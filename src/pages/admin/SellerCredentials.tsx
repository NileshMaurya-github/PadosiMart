import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, Copy, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type SellerCredential = {
  id: string;
  shop_name: string;
  category: string;
  email: string;
  password: string;
  is_approved: boolean;
  created_at: string;
};

export default function SellerCredentials() {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Redirect if not admin
  if (!authLoading && (!user || userRole !== "admin")) {
    navigate("/");
    return null;
  }

  // Fetch demo sellers with credentials
  const { data: credentials, isLoading } = useQuery({
    queryKey: ["seller-credentials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_credentials")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as SellerCredential[];
    },
    enabled: !!user && userRole === "admin",
  });

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: "Copied to clipboard",
      description: "Credentials copied successfully",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Mutation to create demo sellers
  const createDemoSellersMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("create-demo-sellers");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seller-credentials"] });
      const successCount = data.results?.filter((r: any) => r.status === "success").length || 0;
      toast({
        title: "Demo sellers created",
        description: `Successfully created ${successCount} demo seller accounts`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create demo sellers",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout userRole="admin" userName="Admin">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Seller Credentials</h1>
          <p className="text-muted-foreground">Demo seller login credentials for testing</p>
        </div>
        <Button 
          onClick={() => createDemoSellersMutation.mutate()}
          disabled={createDemoSellersMutation.isPending}
        >
          {createDemoSellersMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Create Demo Sellers
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demo Sellers</CardTitle>
          <CardDescription>
            These are demo seller accounts with pre-populated shop data. Click "Create Demo Sellers" to generate actual login accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : credentials && credentials.length > 0 ? (
            <div className="space-y-3">
              {credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{cred.shop_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryLabel(cred.category)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-mono text-foreground">{cred.email}</p>
                      <p className="text-sm font-mono text-muted-foreground">{cred.password}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={cred.is_approved ? "success" : "warning"}>
                        {cred.is_approved ? "Approved" : "Pending"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`Email: ${cred.email}\nPassword: ${cred.password}`, cred.id)}
                      >
                        {copiedId === cred.id ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Store className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">No demo sellers</p>
              <p className="text-muted-foreground">Demo seller credentials will appear here once created.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
