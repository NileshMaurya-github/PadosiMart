import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { Navbar } from "@/components/marketplace/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Trash2, Loader2, Package, Store } from "lucide-react";

type WishlistProduct = {
  id: string;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    image_url: string | null;
    stock: number;
    unit: string | null;
    seller_id: string;
    sellers: {
      id: string;
      shop_name: string;
    } | null;
  } | null;
};

export default function Wishlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["wishlist-full", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          id, product_id,
          products(id, name, price, original_price, image_url, stock, unit, seller_id,
            sellers(id, shop_name))
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WishlistProduct[];
    },
    enabled: !!user,
  });

  const handleAddToCart = (item: WishlistProduct) => {
    if (!item.products || !item.products.sellers) return;
    addItem({
      productId: item.products.id,
      name: item.products.name,
      price: item.products.price,
      quantity: 1,
      imageUrl: item.products.image_url || undefined,
      unit: item.products.unit || "piece",
      sellerId: item.products.seller_id,
      sellerName: item.products.sellers.shop_name,
      stock: item.products.stock,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Sign In to View Wishlist
            </h2>
            <p className="text-muted-foreground mb-6">
              Create an account or sign in to save products you love.
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Sign In to Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistItems?.length || 0} saved product{wishlistItems?.length !== 1 ? "s" : ""}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : wishlistItems && wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {item.products ? (
                  <>
                    <div className="relative aspect-square bg-secondary">
                      {item.products.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      {item.products.stock === 0 && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <span className="text-sm font-medium text-destructive">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-medium text-foreground line-clamp-2">
                          {item.products.name}
                        </h3>
                        {item.products.sellers && (
                          <button
                            onClick={() => navigate(`/shop/${item.products!.sellers!.id}`)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1"
                          >
                            <Store className="w-3 h-3" />
                            {item.products.sellers.shop_name}
                          </button>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-primary">
                          ₹{item.products.price.toFixed(2)}
                        </span>
                        {item.products.original_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{item.products.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          disabled={item.products.stock === 0}
                          onClick={() => handleAddToCart(item)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleWishlist(item.product_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-4 text-center text-muted-foreground">
                    Product no longer available
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-muted-foreground mb-4">
              Start adding products you love to save them for later
            </p>
            <Button onClick={() => navigate("/categories")}>
              Browse Products
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
