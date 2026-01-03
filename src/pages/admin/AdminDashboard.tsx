import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  TrendingDown,
  Store,
  Users,
  ShoppingCart,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  MapPin,
  Phone,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

type Seller = {
  id: string;
  shop_name: string;
  shop_description: string | null;
  category: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  opening_hours: string | null;
  closing_hours: string | null;
  delivery_options: string[] | null;
};

export default function AdminDashboard() {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  // Redirect if not admin
  if (!authLoading && (!user || userRole !== "admin")) {
    navigate("/");
    return null;
  }

  // Fetch pending sellers
  const { data: pendingSellers, isLoading: pendingLoading } = useQuery({
    queryKey: ["pending-sellers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Seller[];
    },
    enabled: !!user && userRole === "admin",
  });

  // Fetch approved sellers count
  const { data: approvedCount } = useQuery({
    queryKey: ["approved-sellers-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("sellers")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", true)
        .eq("is_active", true);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user && userRole === "admin",
  });

  // Fetch total orders count
  const { data: ordersCount } = useQuery({
    queryKey: ["orders-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user && userRole === "admin",
  });

  // Approve seller mutation
  const approveMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      const { error } = await supabase
        .from("sellers")
        .update({ is_approved: true })
        .eq("id", sellerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-sellers"] });
      queryClient.invalidateQueries({ queryKey: ["approved-sellers-count"] });
      toast({
        title: "Seller approved",
        description: "The seller can now start listing products.",
      });
      setSelectedSeller(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject seller mutation
  const rejectMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      const { error } = await supabase
        .from("sellers")
        .delete()
        .eq("id", sellerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-sellers"] });
      toast({
        title: "Seller rejected",
        description: "The registration has been removed.",
      });
      setSelectedSeller(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stats = [
    {
      title: "Pending Approvals",
      value: pendingSellers?.length || 0,
      change: "Needs action",
      trend: pendingSellers?.length ? "warning" : "neutral",
      icon: Clock,
    },
    {
      title: "Active Sellers",
      value: approvedCount || 0,
      change: "Approved",
      trend: "up",
      icon: Store,
    },
    {
      title: "Total Orders",
      value: ordersCount || 0,
      change: "All time",
      trend: "neutral",
      icon: ShoppingCart,
    },
    {
      title: "Commission Rate",
      value: "1%",
      change: "Platform fee",
      trend: "neutral",
      icon: TrendingUp,
    },
  ];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      grocery: "Grocery & Essentials",
      medical: "Medical & Pharmacy",
      electronics: "Electronics",
      clothing: "Clothing & Fashion",
      food: "Food & Restaurant",
      services: "Services",
      other: "Other",
    };
    return labels[category] || category;
  };

  const getDeliveryLabel = (option: string) => {
    const labels: Record<string, string> = {
      self_delivery: "Self Delivery",
      third_party: "Third Party",
      customer_pickup: "Customer Pickup",
    };
    return labels[option] || option;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and seller management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <Badge
                  variant={
                    stat.trend === "up"
                      ? "success"
                      : stat.trend === "warning"
                      ? "warning"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Pending Seller Approvals
              {pendingSellers && pendingSellers.length > 0 && (
                <Badge variant="warning">{pendingSellers.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Review and approve new seller registrations</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingSellers && pendingSellers.length > 0 ? (
            <div className="space-y-4">
              {pendingSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-background overflow-hidden flex items-center justify-center">
                      {seller.image_url ? (
                        <img
                          src={seller.image_url}
                          alt={seller.shop_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{seller.shop_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryLabel(seller.category)}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {seller.address.split(",")[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(seller.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSeller(seller)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => approveMutation.mutate(seller.id)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectMutation.mutate(seller.id)}
                      disabled={rejectMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-1" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">All caught up!</p>
              <p className="text-muted-foreground">No pending seller approvals at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seller Detail Dialog */}
      <Dialog open={!!selectedSeller} onOpenChange={() => setSelectedSeller(null)}>
        <DialogContent className="max-w-lg">
          {selectedSeller && (
            <>
              <DialogHeader>
                <DialogTitle>Seller Details</DialogTitle>
                <DialogDescription>
                  Review the seller information before approval
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Shop Image */}
                {selectedSeller.image_url && (
                  <div className="w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={selectedSeller.image_url}
                      alt={selectedSeller.shop_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Shop Info */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedSeller.shop_name}
                  </h3>
                  <Badge variant="category" className="mt-1">
                    {getCategoryLabel(selectedSeller.category)}
                  </Badge>
                </div>

                {selectedSeller.shop_description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedSeller.shop_description}
                  </p>
                )}

                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">{selectedSeller.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">{selectedSeller.phone}</p>
                    </div>
                  </div>

                  {selectedSeller.opening_hours && selectedSeller.closing_hours && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Operating Hours</p>
                        <p className="text-muted-foreground">
                          {selectedSeller.opening_hours} - {selectedSeller.closing_hours}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedSeller.delivery_options && selectedSeller.delivery_options.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Delivery Options</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeller.delivery_options.map((option) => (
                          <Badge key={option} variant="secondary">
                            {getDeliveryLabel(option)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => approveMutation.mutate(selectedSeller.id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve Seller
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => rejectMutation.mutate(selectedSeller.id)}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
