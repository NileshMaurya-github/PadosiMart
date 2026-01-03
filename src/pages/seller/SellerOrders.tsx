import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Phone,
  User,
  Loader2,
  ChevronRight,
  Store,
  PackageCheck,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type DeliveryType = Database["public"]["Enums"]["delivery_type"];

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  delivery_address: string | null;
  subtotal: number;
  delivery_fee: number | null;
  total_amount: number;
  notes: string | null;
  created_at: string;
  customer_id: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

interface CustomerProfile {
  full_name: string | null;
  phone: string | null;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  accepted: { label: "Accepted", color: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle },
  packed: { label: "Packed", color: "bg-accent/10 text-accent-foreground border-accent/20", icon: Package },
  out_for_delivery: { label: "Out for Delivery", color: "bg-info/10 text-info border-info/20", icon: Truck },
  delivered: { label: "Delivered", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const deliveryLabels: Record<DeliveryType, string> = {
  self_delivery: "Self Delivery",
  third_party: "Third Party",
  customer_pickup: "Store Pickup",
};

const statusFlow: OrderStatus[] = ["pending", "accepted", "packed", "out_for_delivery", "delivered"];

export default function SellerOrders() {
  const navigate = useNavigate();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch seller info
  const { data: seller } = useQuery({
    queryKey: ["seller", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["seller-orders", seller?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", seller!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!seller?.id,
  });

  // Fetch order items for selected order
  const { data: orderItems } = useQuery({
    queryKey: ["order-items", selectedOrder?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", selectedOrder!.id);

      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!selectedOrder?.id,
  });

  // Fetch customer profile
  const { data: customerProfile } = useQuery({
    queryKey: ["customer-profile", selectedOrder?.customer_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", selectedOrder!.customer_id)
        .maybeSingle();

      if (error) throw error;
      return data as CustomerProfile | null;
    },
    enabled: !!selectedOrder?.customer_id,
  });

  // Real-time subscription for orders
  useEffect(() => {
    if (!seller?.id) return;

    console.log("Setting up real-time subscription for seller orders");
    
    const channel = supabase
      .channel("seller-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `seller_id=eq.${seller.id}`,
        },
        (payload) => {
          console.log("Order update received:", payload);
          queryClient.invalidateQueries({ queryKey: ["seller-orders", seller.id] });
          
          if (payload.eventType === "INSERT") {
            toast.info("New order received!", {
              description: `Order ${(payload.new as Order).order_number}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [seller?.id, queryClient]);

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast.success(`Order ${statusConfig[status].label.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Failed to update order status");
    },
  });

  // Redirect non-sellers
  if (!authLoading && (!user || (userRole !== "seller" && userRole !== "admin"))) {
    navigate("/auth");
    return null;
  }

  if (!authLoading && !seller) {
    navigate("/seller/register");
    return null;
  }

  // Filter orders by status
  const filteredOrders = orders?.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["pending", "accepted", "packed", "out_for_delivery"].includes(order.status);
    return order.status === activeTab;
  });

  // Get next status in flow
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  // Get action button label
  const getActionLabel = (status: OrderStatus): string => {
    switch (status) {
      case "pending": return "Accept Order";
      case "accepted": return "Mark as Packed";
      case "packed": return "Out for Delivery";
      case "out_for_delivery": return "Mark Delivered";
      default: return "";
    }
  };

  const orderCounts = {
    all: orders?.length || 0,
    pending: orders?.filter(o => o.status === "pending").length || 0,
    active: orders?.filter(o => ["pending", "accepted", "packed", "out_for_delivery"].includes(o.status)).length || 0,
    delivered: orders?.filter(o => o.status === "delivered").length || 0,
  };

  return (
    <DashboardLayout userRole="seller">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orderCounts.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orderCounts.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orderCounts.delivered}</p>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orderCounts.all}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({orderCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({orderCounts.pending})</TabsTrigger>
                <TabsTrigger value="active">Active ({orderCounts.active})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered ({orderCounts.delivered})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const StatusIcon = statusConfig[order.status].icon;
                      const nextStatus = getNextStatus(order.status);
                      
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()} •{" "}
                                {deliveryLabels[order.delivery_type]}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className={statusConfig[order.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[order.status].label}
                            </Badge>
                            <span className="font-semibold">₹{order.total_amount}</span>
                            
                            {nextStatus && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStatusMutation.mutate({ orderId: order.id, status: nextStatus });
                                }}
                                disabled={updateStatusMutation.isPending}
                              >
                                {getActionLabel(order.status)}
                              </Button>
                            )}
                            
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PackageCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground">
                      {activeTab === "pending"
                        ? "No pending orders at the moment"
                        : "Orders will appear here when customers place them"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 pr-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <Badge className={statusConfig[selectedOrder.status].color}>
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer
                  </h4>
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
                    <p className="text-sm">{customerProfile?.full_name || "Customer"}</p>
                    {customerProfile?.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customerProfile.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery
                  </h4>
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-medium">{deliveryLabels[selectedOrder.delivery_type]}</p>
                    {selectedOrder.delivery_address && (
                      <p className="text-sm text-muted-foreground flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        {selectedOrder.delivery_address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Items
                  </h4>
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                    {orderItems?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Order Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>{selectedOrder.delivery_fee ? `₹${selectedOrder.delivery_fee}` : "Free"}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{selectedOrder.total_amount}</span>
                  </div>
                </div>

                {/* Actions */}
                {getNextStatus(selectedOrder.status) && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        const nextStatus = getNextStatus(selectedOrder.status);
                        if (nextStatus) {
                          updateStatusMutation.mutate({ orderId: selectedOrder.id, status: nextStatus });
                          setSelectedOrder({ ...selectedOrder, status: nextStatus });
                        }
                      }}
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      {getActionLabel(selectedOrder.status)}
                    </Button>
                    {selectedOrder.status === "pending" && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          updateStatusMutation.mutate({ orderId: selectedOrder.id, status: "cancelled" });
                          setSelectedOrder({ ...selectedOrder, status: "cancelled" });
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
