import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Minus, Plus, ShoppingCart, Store, Package, Loader2, Heart } from "lucide-react";
import { ProductReviewsList } from "@/components/reviews/ProductReviewsList";

interface ProductQuickViewProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  stock: number;
  unit: string | null;
  category: string | null;
  seller_id: string;
  sellers: {
    id: string;
    shop_name: string;
    category: string;
    rating: number | null;
    review_count: number | null;
  } | null;
};

export function ProductQuickView({ productId, open, onOpenChange }: ProductQuickViewProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-quick-view", productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, description, price, original_price, image_url, stock, unit, category, seller_id,
          sellers(id, shop_name, category, rating, review_count)
        `)
        .eq("id", productId)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!productId && open,
  });

  const handleAddToCart = () => {
    if (!product || !product.sellers) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.image_url || undefined,
      unit: product.unit || "piece",
      sellerId: product.seller_id,
      sellerName: product.sellers.shop_name,
      stock: product.stock,
    });
    onOpenChange(false);
    setQuantity(1);
  };

  const handleViewShop = () => {
    if (!product?.sellers) return;
    onOpenChange(false);
    navigate(`/shop/${product.sellers.id}`);
  };

  const discount = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : product ? (
          <div className="flex flex-col md:flex-row">
            {/* Product Image */}
            <div className="relative w-full md:w-1/2 aspect-square bg-secondary">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-destructive">
                  -{discount}%
                </Badge>
              )}
              {/* Wishlist Button */}
              <button
                onClick={() => productId && toggleWishlist(productId)}
                className="absolute top-3 right-3 p-2 rounded-full bg-background/90 shadow-sm hover:bg-background transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    productId && isInWishlist(productId)
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            </div>

            {/* Product Details */}
            <div className="flex-1 p-6 flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-foreground pr-8">
                  {product.name}
                </DialogTitle>
              </DialogHeader>

              {product.category && (
                <Badge variant="secondary" className="w-fit mt-2 capitalize">
                  {product.category}
                </Badge>
              )}

              {product.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-2xl font-bold text-primary">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.original_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.original_price.toFixed(2)}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  / {product.unit || "piece"}
                </span>
              </div>

              {/* Stock Status */}
              <div className="mt-2">
                {product.stock > 0 ? (
                  <span className={`text-sm ${product.stock < 10 ? "text-amber-600" : "text-green-600"}`}>
                    {product.stock < 10 ? `Only ${product.stock} left` : "In Stock"}
                  </span>
                ) : (
                  <span className="text-sm text-destructive">Out of Stock</span>
                )}
              </div>

              <Separator className="my-4" />

              {/* Seller Info */}
              {product.sellers && (
                <button
                  onClick={handleViewShop}
                  className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {product.sellers.shop_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.sellers.rating ? `⭐ ${product.sellers.rating.toFixed(1)}` : "No ratings"} 
                      {product.sellers.review_count ? ` (${product.sellers.review_count} reviews)` : ""}
                    </p>
                  </div>
                </button>
              )}

              {/* Add to Cart */}
              {product.stock > 0 && (
                <div className="mt-auto pt-4 space-y-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Quantity</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleAddToCart} className="w-full gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart - ₹{(product.price * quantity).toFixed(2)}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Product not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
