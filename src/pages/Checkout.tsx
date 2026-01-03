import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Navbar } from "@/components/marketplace/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Store,
  MapPin,
  Truck,
  Package,
  Loader2,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type DeliveryType = Database["public"]["Enums"]["delivery_type"];

const deliveryLabels: Record<DeliveryType, { label: string; description: string; icon: typeof Truck }> = {
  self_delivery: {
    label: "Self Delivery",
    description: "Shop delivers to your location",
    icon: Truck
  },
  third_party: {
    label: "Third Party Delivery",
    description: "Delivery by partner service",
    icon: Package
  },
  customer_pickup: {
    label: "Store Pickup",
    description: "Pick up from shop location",
    icon: Store
  },
};

export default function Checkout() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSellerItems, clearSellerItems } = useCart();

  const cartItems = sellerId ? getSellerItems(sellerId) : [];

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("customer_pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Fetch seller details
  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ["seller", sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", sellerId!)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!sellerId && !!user,
  });

  // Fetch user profile for address
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      if (data?.address && !deliveryAddress) {
        setDeliveryAddress(data.address);
      }
      return data;
    },
    enabled: !!user,
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user || !sellerId || cartItems.length === 0) {
        throw new Error("Invalid order data");
      }

      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = deliveryType === "customer_pickup" ? 0 : 30; // Simple delivery fee logic
      const totalAmount = subtotal + deliveryFee;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user.id,
          seller_id: sellerId,
          delivery_type: deliveryType,
          delivery_address: deliveryType !== "customer_pickup" ? deliveryAddress : null,
          delivery_latitude: profile?.latitude,
          delivery_longitude: profile?.longitude,
          delivery_fee: deliveryFee,
          subtotal,
          total_amount: totalAmount,
          notes: notes || null,
          order_number: `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`, // Fallback if trigger is missing
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: (order) => {
      clearSellerItems(sellerId!);
      setOrderNumber(order.order_number);
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    },
    onError: (error) => {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
    },
  });

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-md py-16">
          <Card className="text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Sign in to Continue</h2>
              <p className="text-muted-foreground mb-6">
                Please sign in or create an account to complete your order.
              </p>
              <Button
                className="w-full"
                onClick={() => navigate(`/auth?redirect=/checkout/${sellerId}`)}
              >
                Sign In to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Redirect if no items
  if (!sellerId || (cartItems.length === 0 && !orderPlaced)) {
    navigate("/discover");
    return null;
  }

  if (sellerLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Order success view
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-lg py-16">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
              <p className="text-muted-foreground mb-4">
                Thank you for your order. The seller will process it shortly.
              </p>
              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-lg font-mono font-semibold">{orderNumber}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/discover")}
                >
                  Continue Shopping
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => navigate("/orders")}
                >
                  View Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryType === "customer_pickup" ? 0 : 30;
  const total = subtotal + deliveryFee;

  const availableDeliveryOptions = seller?.delivery_options || ["customer_pickup"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Ordering from {seller?.shop_name}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Delivery Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={deliveryType}
                  onValueChange={(value) => setDeliveryType(value as DeliveryType)}
                  className="space-y-3"
                >
                  {(availableDeliveryOptions as DeliveryType[]).map((option) => {
                    const { label, description, icon: Icon } = deliveryLabels[option];
                    return (
                      <div key={option} className="flex items-center space-x-3">
                        <RadioGroupItem value={option} id={option} />
                        <Label
                          htmlFor={option}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-muted-foreground">{description}</p>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {deliveryType !== "customer_pickup" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter your full delivery address..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            )}

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special instructions for the seller..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => placeOrderMutation.mutate()}
                  disabled={
                    placeOrderMutation.isPending ||
                    (deliveryType !== "customer_pickup" && !deliveryAddress.trim())
                  }
                >
                  {placeOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                {deliveryType !== "customer_pickup" && !deliveryAddress.trim() && (
                  <p className="text-xs text-destructive text-center">
                    Please enter a delivery address
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
