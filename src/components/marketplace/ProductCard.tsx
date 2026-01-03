import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { getProductImage } from "@/lib/productImages";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  stock: number;
  unit?: string;
  category?: string | null;
  shopCategory?: string;
  onAddToCart?: (quantity: number) => void;
}

export function ProductCard({
  name,
  price,
  originalPrice,
  imageUrl,
  stock,
  unit = "piece",
  category,
  shopCategory,
  onAddToCart,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const isOutOfStock = stock === 0;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const displayImage = imageUrl || getProductImage(category, shopCategory);

  const handleAdd = () => {
    if (quantity < stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleRemove = () => {
    if (quantity > 0) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0 && onAddToCart) {
      onAddToCart(quantity);
      setQuantity(0);
    }
  };

  return (
    <Card variant="default" className="overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary/50">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <Badge variant="accent" className="absolute top-2 left-2">
            -{discount}%
          </Badge>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary">Out of Stock</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-foreground line-clamp-2 text-sm mb-2 min-h-[2.5rem]">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            ₹{price.toFixed(0)}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{originalPrice.toFixed(0)}
            </span>
          )}
          <span className="text-xs text-muted-foreground">/{unit}</span>
        </div>

        {/* Quantity Controls or Add Button */}
        {!isOutOfStock && (
          <div className="flex items-center gap-2">
            {quantity === 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleAdd}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            ) : (
              <>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleRemove}
                    className="rounded-r-none"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleAdd}
                    disabled={quantity >= stock}
                    className="rounded-l-none"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        )}

        {/* Stock Info */}
        {stock > 0 && stock <= 5 && (
          <p className="text-xs text-warning mt-2">Only {stock} left!</p>
        )}
      </div>
    </Card>
  );
}
