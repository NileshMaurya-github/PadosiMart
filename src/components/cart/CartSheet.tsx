import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, Trash2, Store } from "lucide-react";

export function CartSheet() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getSubtotal } = useCart();

  // Group items by seller
  const itemsBySeller = items.reduce((acc, item) => {
    if (!acc[item.sellerId]) {
      acc[item.sellerId] = {
        sellerName: item.sellerName,
        items: [],
      };
    }
    acc[item.sellerId].items.push(item);
    return acc;
  }, {} as Record<string, { sellerName: string; items: typeof items }>);

  const handleCheckout = (sellerId: string) => {
    setIsOpen(false);
    if (!user) {
      // Redirect to auth with return URL
      navigate(`/auth?redirect=/checkout/${sellerId}`);
    } else {
      navigate(`/checkout/${sellerId}`);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add items from shops to get started
            </p>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              {Object.entries(itemsBySeller).map(([sellerId, { sellerName, items: sellerItems }]) => (
                <div key={sellerId} className="mb-6">
                  {/* Seller Header */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                    <Store className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{sellerName}</span>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {sellerItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {/* Image */}
                        <div className="w-16 h-16 rounded-lg bg-secondary/50 overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ShoppingCart className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.price} / {item.unit}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-r-none"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-l-none"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Item Total & Delete */}
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                ₹{(item.price * item.quantity).toFixed(0)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seller Subtotal & Checkout */}
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">
                        ₹{sellerItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(0)}
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleCheckout(sellerId)}
                    >
                      Checkout from {sellerName}
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>

            {/* Total Footer */}
            {Object.keys(itemsBySeller).length > 1 && (
              <>
                <Separator />
                <div className="pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{getSubtotal().toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Checkout separately for each seller
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
