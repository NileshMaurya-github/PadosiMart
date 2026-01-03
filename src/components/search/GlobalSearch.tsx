import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Store, Package, Search, Star, MapPin, Loader2 } from "lucide-react";

interface Shop {
  id: string;
  shop_name: string;
  category: string;
  address: string;
  rating: number | null;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  image_url: string | null;
  seller_id: string;
  sellers: {
    shop_name: string;
  } | null;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryLabels: Record<string, string> = {
  grocery: "Grocery",
  medical: "Medical",
  electronics: "Electronics",
  clothing: "Clothing",
  food: "Food",
  services: "Services",
  other: "Other",
};

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
    }
  }, [open]);

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Search shops
  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ["search-shops", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return [];

      const { data, error } = await supabase
        .from("sellers")
        .select("id, shop_name, category, address, rating, image_url")
        .eq("is_approved", true)
        .eq("is_active", true)
        .ilike("shop_name", `%${debouncedSearch}%`)
        .limit(5);

      if (error) throw error;
      return data as Shop[];
    },
    enabled: !!debouncedSearch.trim() && !!user,
  });

  // Search products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["search-products", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch.trim()) return [];

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          category,
          image_url,
          seller_id,
          sellers!inner(shop_name, is_approved, is_active)
        `)
        .eq("is_available", true)
        .eq("sellers.is_approved", true)
        .eq("sellers.is_active", true)
        .ilike("name", `%${debouncedSearch}%`)
        .limit(5);

      if (error) throw error;
      return data.map((p) => ({
        ...p,
        sellers: p.sellers as unknown as { shop_name: string },
      })) as Product[];
    },
    enabled: !!debouncedSearch.trim() && !!user,
  });

  const isLoading = shopsLoading || productsLoading;
  const hasResults = (shops && shops.length > 0) || (products && products.length > 0);

  const handleSelectShop = useCallback(
    (shopId: string) => {
      onOpenChange(false);
      navigate(`/shop/${shopId}`);
    },
    [navigate, onOpenChange]
  );

  const handleSelectProduct = useCallback(
    (sellerId: string) => {
      onOpenChange(false);
      navigate(`/shop/${sellerId}`);
    },
    [navigate, onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search shops and products..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {!debouncedSearch.trim() && (
          <CommandEmpty className="py-6 text-center text-sm">
            <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Start typing to search...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px]">⌘K</kbd> anytime to open search
            </p>
          </CommandEmpty>
        )}

        {debouncedSearch.trim() && isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {debouncedSearch.trim() && !isLoading && !hasResults && (
          <CommandEmpty>No results found for "{debouncedSearch}"</CommandEmpty>
        )}

        {shops && shops.length > 0 && (
          <CommandGroup heading="Shops">
            {shops.map((shop) => (
              <CommandItem
                key={shop.id}
                value={`shop-${shop.id}-${shop.shop_name}`}
                onSelect={() => handleSelectShop(shop.id)}
                className="cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden mr-3 shrink-0">
                  {shop.image_url ? (
                    <img
                      src={shop.image_url}
                      alt={shop.shop_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{shop.shop_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {categoryLabels[shop.category] || shop.category}
                    </Badge>
                    {shop.rating && shop.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-warning text-warning" />
                        {shop.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {shops && shops.length > 0 && products && products.length > 0 && (
          <CommandSeparator />
        )}

        {products && products.length > 0 && (
          <CommandGroup heading="Products">
            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={`product-${product.id}-${product.name}`}
                onSelect={() => handleSelectProduct(product.seller_id)}
                className="cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden mr-3 shrink-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>₹{product.price}</span>
                    <span>•</span>
                    <span className="truncate">{product.sellers?.shop_name}</span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
