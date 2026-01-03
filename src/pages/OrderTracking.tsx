import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/marketplace/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Circle,
  Store,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

type OrderStatus = "pending" | "accepted" | "packed" | "out_for_delivery" | "delivered" | "cancelled";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Order Placed", color: "bg-yellow-500", icon: Clock },
  accepted: { label: "Confirmed", color: "bg-blue-500", icon: CheckCircle2 },
  packed: { label: "Packed", color: "bg-purple-500", icon: Package },
  out_for_delivery: { label: "Out for Delivery", color: "bg-orange-500", icon: MapPin },
  delivered: { label: "Delivered", color: "bg-green-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: Circle },
};

const statusOrder: OrderStatus[] = ["pending", "accepted", "packed", "out_for_delivery", "delivered"];

type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number | null;
  total_amount: number;
  delivery_type: string;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  seller_id: string;
  sellers: {
    id: string;
    shop_name: string;
    phone: string;
    address: string;
  } | null;
};

type OrderItem = {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  product_id: string;
};

type StatusHistory = {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
};

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, order_number, status, subtotal, delivery_fee, total_amount,
          delivery_type, delivery_address, notes, created_at, updated_at, seller_id,
          sellers(id, shop_name, phone, address)
        `)
        .eq("id", orderId)
        .maybeSingle();

      if (error) throw error;
      return data as Order | null;
    },
    enabled: !!orderId && !!user,
  });

  const { data: orderItems } = useQuery({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from("order_items")
        .select("id, product_name, product_price, quantity, subtotal, product_id")
        .eq("order_id", orderId);

      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!orderId && !!user,
  });

  const { data: statusHistory } = useQuery({
    queryKey: ["order-status-history", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from("order_status_history")
        .select("id, status, note, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as StatusHistory[];
    },
    enabled: !!orderId && !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Sign In Required
            </h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to track your order.
            </p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The order you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/orders")}>View My Orders</Button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Order {order.order_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              Placed on {format(new Date(order.created_at), "PPP 'at' p")}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Order Status
                <Badge
                  className={`${statusConfig[order.status].color} text-white`}
                >
                  {statusConfig[order.status].label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCancelled ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Circle className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Order Cancelled</h3>
                  <p className="text-sm text-muted-foreground">
                    This order has been cancelled
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline */}
                  <div className="space-y-6">
                    {statusOrder.map((status, index) => {
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      const config = statusConfig[status];
                      const Icon = config.icon;
                      const historyEntry = statusHistory?.find((h) => h.status === status);

                      return (
                        <div key={status} className="flex gap-4">
                          {/* Icon and Line */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted
                                  ? config.color + " text-white"
                                  : "bg-secondary text-muted-foreground"
                              } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            {index < statusOrder.length - 1 && (
                              <div
                                className={`w-0.5 h-12 ${
                                  isCompleted && index < currentStatusIndex
                                    ? "bg-primary"
                                    : "bg-border"
                                }`}
                              />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-6">
                            <h4
                              className={`font-medium ${
                                isCompleted ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {config.label}
                            </h4>
                            {historyEntry && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(historyEntry.created_at), "PPP 'at' p")}
                              </p>
                            )}
                            {historyEntry?.note && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {historyEntry.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Shop Info */}
            {order.sellers && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Seller</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link
                    to={`/shop/${order.sellers.id}`}
                    className="flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    <Store className="w-4 h-4" />
                    {order.sellers.shop_name}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {order.sellers.phone}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    {order.sellers.address}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Info */}
            {order.delivery_address && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {orderItems?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="text-muted-foreground">
                      ₹{item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                {order.delivery_fee && order.delivery_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>₹{order.delivery_fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{order.total_amount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
