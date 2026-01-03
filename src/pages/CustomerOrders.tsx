import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/marketplace/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { ReviewFormDialog } from "@/components/reviews/ReviewFormDialog";
import { StarRating } from "@/components/reviews/StarRating";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Store,
  Loader2,
  ChevronRight,
  PackageCheck,
  ShoppingBag,
  Phone,
  Star,
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
  seller_id: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

interface Seller {
  shop_name: string;
  address: string;
  phone: string;
  image_url: string | null;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock; step: number }> = {
  pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20", icon: Clock, step: 1 },
  accepted: { label: "Accepted", color: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle, step: 2 },
  packed: { label: "Packed", color: "bg-accent/10 text-accent-foreground border-accent/20", icon: Package, step: 3 },
  out_for_delivery: { label: "Out for Delivery", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Truck, step: 4 },
  delivered: { label: "Delivered", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle, step: 5 },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle, step: 0 },
};

const deliveryLabels: Record<DeliveryType, string> = {
  self_delivery: "Self Delivery",
  third_party: "Third Party Delivery",
  customer_pickup: "Store Pickup",
};

const statusSteps = ["pending", "accepted", "packed", "out_for_delivery", "delivered"] as const;

export default function CustomerOrders() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("active");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["customer-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
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

  // Fetch seller info for selected order
  const { data: seller } = useQuery({
    queryKey: ["seller-info", selectedOrder?.seller_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("shop_name, address, phone, image_url")
        .eq("id", selectedOrder!.seller_id)
        .maybeSingle();

      if (error) throw error;
      return data as Seller | null;
    },
    enabled: !!selectedOrder?.seller_id,
  });

  // Fetch existing review for selected order
  const { data: existingReview } = useQuery({
    queryKey: ["order-review", selectedOrder?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, comment")
        .eq("order_id", selectedOrder!.id)
        .eq("customer_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrder?.id && !!user?.id,
  });

  // Real-time subscription for orders
  useEffect(() => {
    if (!user?.id) return;

    console.log("Setting up real-time subscription for customer orders");
    
    const channel = supabase
      .channel("customer-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Order update received:", payload);
          queryClient.invalidateQueries({ queryKey: ["customer-orders", user.id] });
          
          // Update selected order if it matches
          if (selectedOrder && payload.new && (payload.new as Order).id === selectedOrder.id) {
            setSelectedOrder(payload.new as Order);
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, selectedOrder]);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  // Filter orders by status
  const filteredOrders = orders?.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return !["delivered", "cancelled"].includes(order.status);
    if (activeTab === "completed") return order.status === "delivered";
    if (activeTab === "cancelled") return order.status === "cancelled";
    return true;
  });

  const orderCounts = {
    all: orders?.length || 0,
    active: orders?.filter(o => !["delivered", "cancelled"].includes(o.status)).length || 0,
    completed: orders?.filter(o => o.status === "delivered").length || 0,
    cancelled: orders?.filter(o => o.status === "cancelled").length || 0,
  };

  // Calculate progress percentage
  const getProgressPercentage = (status: OrderStatus): number => {
    if (status === "cancelled") return 0;
    const step = statusConfig[status].step;
    return (step / 5) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>
          <Button onClick={() => navigate("/discover")}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active ({orderCounts.active})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({orderCounts.completed})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({orderCounts.cancelled})</TabsTrigger>
            <TabsTrigger value="all">All ({orderCounts.all})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders && filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  
                  return (
                    <Card
                      key={order.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()} •{" "}
                                {deliveryLabels[order.delivery_type]}
                              </p>
                              <Badge className={`mt-2 ${statusConfig[order.status].color}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig[order.status].label}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold">₹{order.total_amount}</p>
                              <p className="text-xs text-muted-foreground">Total Amount</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/orders/${order.id}`);
                              }}
                            >
                              Track
                            </Button>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Progress Bar for Active Orders */}
                        {!["delivered", "cancelled"].includes(order.status) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                              <span>Order Placed</span>
                              <span>Delivered</span>
                            </div>
                            <Progress value={getProgressPercentage(order.status)} className="h-2" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <PackageCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "active"
                    ? "You don't have any active orders"
                    : "Your orders will appear here"}
                </p>
                <Button onClick={() => navigate("/discover")}>
                  Start Shopping
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 pr-4">
                {/* Order Number & Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono font-semibold">{selectedOrder.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={statusConfig[selectedOrder.status].color}>
                    {statusConfig[selectedOrder.status].label}
                  </Badge>
                </div>

                {/* Status Timeline */}
                {selectedOrder.status !== "cancelled" && (
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-medium mb-4">Order Progress</h4>
                    <div className="relative">
                      <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border" />
                      {statusSteps.map((step, index) => {
                        const isCompleted = statusConfig[selectedOrder.status].step > index;
                        const isCurrent = statusConfig[selectedOrder.status].step === index + 1;
                        const StepIcon = statusConfig[step].icon;
                        
                        return (
                          <div key={step} className="relative flex items-center gap-4 pb-4 last:pb-0">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                                isCompleted || isCurrent
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <StepIcon className="w-3 h-3" />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${
                                isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                              }`}>
                                {statusConfig[step].label}
                              </p>
                              {isCurrent && (
                                <p className="text-xs text-primary">Current Status</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cancelled Message */}
                {selectedOrder.status === "cancelled" && (
                  <div className="bg-destructive/10 rounded-lg p-4 text-center">
                    <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                    <p className="font-medium text-destructive">Order Cancelled</p>
                  </div>
                )}

                {/* Seller Info */}
                {seller && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Shop Details
                    </h4>
                    <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                      <p className="font-medium">{seller.shop_name}</p>
                      <p className="text-sm text-muted-foreground flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        {seller.address}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {seller.phone}
                      </p>
                    </div>
                  </div>
                )}

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
                        <span className="font-medium">₹{item.subtotal}</span>
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
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{selectedOrder.total_amount}</span>
                  </div>
                </div>

                {/* Review Section for Delivered Orders */}
                {selectedOrder.status === "delivered" && (
                  <div className="bg-primary/5 rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      {existingReview ? "Your Review" : "Rate Your Experience"}
                    </h4>
                    {existingReview ? (
                      <div className="space-y-2">
                        <StarRating rating={existingReview.rating} size="sm" />
                        {existingReview.comment && (
                          <p className="text-sm text-muted-foreground">
                            {existingReview.comment}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewDialogOpen(true)}
                        >
                          Edit Review
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Share your experience with this shop
                        </p>
                        <Button size="sm" onClick={() => setReviewDialogOpen(true)}>
                          <Star className="w-4 h-4 mr-2" />
                          Write a Review
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedOrder(null);
                      navigate(`/shop/${selectedOrder.seller_id}`);
                    }}
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Visit Shop
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      {selectedOrder && seller && (
        <ReviewFormDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          orderId={selectedOrder.id}
          sellerId={selectedOrder.seller_id}
          sellerName={seller.shop_name}
          existingReview={existingReview || undefined}
        />
      )}
    </div>
  );
}
