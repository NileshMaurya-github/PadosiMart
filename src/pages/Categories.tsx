import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/marketplace/Navbar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductQuickView } from "@/components/marketplace/ProductQuickView";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Package, Grid3X3, Store, SlidersHorizontal, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PRODUCTS_PER_PAGE = 12;

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  grocery: { label: "Grocery", icon: "🛒", color: "bg-green-500/10 text-green-600" },
  medical: { label: "Medical", icon: "💊", color: "bg-red-500/10 text-red-600" },
  electronics: { label: "Electronics", icon: "📱", color: "bg-blue-500/10 text-blue-600" },
  clothing: { label: "Clothing", icon: "👕", color: "bg-purple-500/10 text-purple-600" },
  food: { label: "Food", icon: "🍔", color: "bg-orange-500/10 text-orange-600" },
  services: { label: "Services", icon: "🔧", color: "bg-yellow-500/10 text-yellow-600" },
  other: { label: "Other", icon: "📦", color: "bg-gray-500/10 text-gray-600" },
};

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "discount", label: "Biggest Discount" },
];

type Product = {
  id: string;
  name: string;
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
  } | null;
};

export default function Categories() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  
  const selectedCategory = searchParams.get("category") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const sortBy = searchParams.get("sort") || "newest";
  const minPrice = parseInt(searchParams.get("minPrice") || "0", 10);
  const maxPrice = parseInt(searchParams.get("maxPrice") || "10000", 10);

  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.set("page", "1");
    setSearchParams(params);
  };

  const setSelectedCategory = (category: string) => {
    updateParams({ category: category || null });
  };

  const setSortBy = (sort: string) => {
    updateParams({ sort: sort === "newest" ? null : sort });
  };

  const applyPriceFilter = () => {
    updateParams({
      minPrice: priceRange[0] === 0 ? null : priceRange[0].toString(),
      maxPrice: priceRange[1] === 10000 ? null : priceRange[1].toString(),
    });
  };

  const clearPriceFilter = () => {
    setPriceRange([0, 10000]);
    updateParams({ minPrice: null, maxPrice: null });
  };

  const setCurrentPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const hasActiveFilters = minPrice > 0 || maxPrice < 10000 || sortBy !== "newest";

  // Fetch products with seller info
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["category-products", selectedCategory, currentPage, sortBy, minPrice, maxPrice],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          id, name, price, original_price, image_url, stock, unit, category, seller_id,
          sellers!inner(id, shop_name, category)
        `, { count: "exact" })
        .eq("is_available", true)
        .gte("price", minPrice);

      if (maxPrice < 10000) {
        query = query.lte("price", maxPrice);
      }

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      // Apply sorting
      switch (sortBy) {
        case "price_low":
          query = query.order("price", { ascending: true });
          break;
        case "price_high":
          query = query.order("price", { ascending: false });
          break;
        case "discount":
          query = query.order("original_price", { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;
      return { products: data as Product[], totalCount: count || 0 };
    },
    enabled: !!user,
  });

  // Fetch category counts
  const { data: categoryCounts } = useQuery({
    queryKey: ["category-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .eq("is_available", true);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((product) => {
        const cat = product.category || "other";
        counts[cat] = (counts[cat] || 0) + 1;
      });
      return counts;
    },
    enabled: !!user,
  });

  const products = productsData?.products || [];
  const totalCount = productsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  const handleAddToCart = (product: Product) => {
    if (!product.sellers) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.image_url || undefined,
      unit: product.unit || "piece",
      sellerId: product.seller_id,
      sellerName: product.sellers.shop_name,
      stock: product.stock,
    });
  };

  // Show login prompt for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Grid3X3 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Sign In to Browse Categories
            </h2>
            <p className="text-muted-foreground mb-6">
              Create an account or sign in to browse products by category.
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Browse by Category</h1>
          <p className="text-muted-foreground">
            Explore products across all shops organized by category
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = categoryCounts?.[key] || 0;
            const isActive = selectedCategory === key;
            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isActive ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedCategory(isActive ? "" : key)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${config.color} flex items-center justify-center text-2xl`}>
                    {config.icon}
                  </div>
                  <p className="font-medium text-sm text-foreground">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{count} products</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Price Range
                {(minPrice > 0 || maxPrice < 10000) && (
                  <Badge variant="secondary" className="ml-1">
                    ₹{minPrice} - ₹{maxPrice}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Price Range</h4>
                  {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                    <Button variant="ghost" size="sm" onClick={clearPriceFilter}>
                      Reset
                    </Button>
                  )}
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={10000}
                  step={100}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}{priceRange[1] === 10000 ? "+" : ""}</span>
                </div>
                <Button onClick={applyPriceFilter} className="w-full" size="sm">
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Active Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPriceRange([0, 10000]);
                updateParams({ sort: null, minPrice: null, maxPrice: null });
              }}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear Filters
            </Button>
          )}

          {/* Results count */}
          <span className="text-sm text-muted-foreground ml-auto">
            {totalCount} product{totalCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Selected Category Header */}
        {selectedCategory && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{categoryConfig[selectedCategory]?.icon}</span>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {categoryConfig[selectedCategory]?.label || selectedCategory}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {totalCount} product{totalCount !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedCategory("")}>
              Clear Category
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up group relative"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="space-y-2">
                    <div className="relative">
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.original_price || undefined}
                        imageUrl={product.image_url || undefined}
                        stock={product.stock}
                        unit={product.unit || "piece"}
                        onAddToCart={() => handleAddToCart(product)}
                      />
                      {/* Quick View Button */}
                      <button
                        onClick={() => setQuickViewProductId(product.id)}
                        className="absolute top-2 right-2 p-2 rounded-full bg-background/90 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                        title="Quick View"
                      >
                        <Eye className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                    {product.sellers && (
                      <button
                        onClick={() => navigate(`/shop/${product.sellers!.id}`)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors w-full"
                      >
                        <Store className="w-3 h-3" />
                        <span className="truncate">{product.sellers.shop_name}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {selectedCategory ? "No products in this category" : "No products available"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory
                ? "Try selecting a different category"
                : "Check back soon for new products!"}
            </p>
            {selectedCategory && (
              <Button variant="outline" onClick={() => setSelectedCategory("")}>
                View All Categories
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Product Quick View Modal */}
      <ProductQuickView
        productId={quickViewProductId}
        open={!!quickViewProductId}
        onOpenChange={(open) => !open && setQuickViewProductId(null)}
      />
    </div>
  );
}
