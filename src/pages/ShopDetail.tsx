import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Navbar } from "@/components/marketplace/Navbar";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ShopReviews } from "@/components/reviews/ShopReviews";
import { ShopProductFilters } from "@/components/marketplace/ShopProductFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Loader2,
  Store,
  Package,
  Truck,
  MessageSquare,
} from "lucide-react";

type Seller = {
  id: string;
  shop_name: string;
  shop_description: string | null;
  category: string;
  address: string;
  phone: string;
  image_url: string | null;
  is_open: boolean | null;
  rating: number | null;
  review_count: number | null;
  opening_hours: string | null;
  closing_hours: string | null;
  delivery_options: string[] | null;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string | null;
  stock: number;
  unit: string | null;
  image_url: string | null;
  is_available: boolean | null;
};

const categoryLabels: Record<string, string> = {
  grocery: "Grocery & Essentials",
  medical: "Medical & Pharmacy",
  electronics: "Electronics",
  clothing: "Clothing & Fashion",
  food: "Food & Restaurant",
  services: "Services",
  other: "Other",
};

const deliveryLabels: Record<string, { label: string; icon: typeof Truck }> = {
  self_delivery: { label: "Self Delivery", icon: Truck },
  third_party: { label: "Third Party Delivery", icon: Truck },
  customer_pickup: { label: "Store Pickup", icon: Store },
};

export default function ShopDetail() {
  const { shopId } = useParams<{ shopId: string }>();
  const [searchParams] = useSearchParams();
  const highlightProductId = searchParams.get("highlight");
  const navigate = useNavigate();
  const { addItem, setIsOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState("default");
  const [activeTab, setActiveTab] = useState("products");
  const highlightRef = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(highlightProductId);

  // Fetch shop details
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      // Handle demo shops
      if (shopId?.startsWith("demo-")) {
        const parts = shopId.split("-");
        const category = parts[1] || "general";
        const index = parts[2] || "1";

        return {
          id: shopId,
          shop_name: `${category.charAt(0).toUpperCase() + category.slice(1)} Store ${index}`,
          shop_description: "This is a demonstration shop showing standard features.",
          category: category,
          address: `123 Demo Street, Block ${index}, Tech Park`,
          phone: "+91 98765 43210",
          image_url: `https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?w=800&h=400`,
          is_open: true,
          rating: 4.5,
          review_count: 120,
          opening_hours: "09:00 AM",
          closing_hours: "10:00 PM",
          delivery_options: ["self_delivery", "customer_pickup"]
        } as Seller;
      }

      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", shopId!)
        .eq("is_approved", true)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as Seller | null;
    },
    enabled: !!shopId,
  });

  // Fetch shop products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["shop-products", shopId],
    queryFn: async () => {
      // Handle demo products
      if (shopId?.startsWith("demo-")) {
        // Generate 15 mock products
        const parts = shopId.split("-");
        const category = parts[1] || "general";

        const demoImages: Record<string, string> = {
          grocery: "https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg?w=400",
          medical: "https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?w=400",
          electronics: "https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?w=400",
          food: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400",
          clothing: "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?w=400",
          services: "https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=400"
        };

        // Generate 15 mock products
        return Array.from({ length: 15 }).map((_, i) => ({
          id: `demo-prod-${shopId}-${i}`,
          name: `${category.charAt(0).toUpperCase() + category.slice(1)} Item ${i + 1}`,
          description: `High quality ${category} item for your daily needs.`,
          price: 50 + (i * 25),
          original_price: i % 2 === 0 ? 60 + (i * 25) : null,
          category: category, // All in shop category for simplicity, or vary
          stock: 50,
          unit: "pack",
          image_url: demoImages[category] || demoImages.grocery,
          is_available: true
        })) as Product[];
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", shopId!)
        .eq("is_available", true)
        .order("category", { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!shopId,
  });

  // Get max price from products
  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 10000;
    return Math.ceil(Math.max(...products.map((p) => p.price)) / 100) * 100;
  }, [products]);

  // Update price range when max price changes
  useMemo(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // Get unique categories from products
  const productCategories = useMemo(() => {
    return products
      ? [...new Set(products.map((p) => p.category).filter(Boolean))] as string[]
      : [];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  // Scroll to highlighted product
  useEffect(() => {
    if (highlightProductId && filteredProducts.length > 0) {
      // Wait for render
      setTimeout(() => {
        const element = document.getElementById(`product-${highlightProductId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Clear highlight after 3 seconds
          setTimeout(() => {
            setHighlightedId(null);
          }, 3000);
        }
      }, 500);
    }
  }, [highlightProductId, filteredProducts]);

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-16">
            <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Shop Not Found</h2>
            <p className="text-muted-foreground">
              This shop may have been removed or is no longer available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Shop Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-32 md:h-64 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          {shop.image_url ? (
            <img
              src={shop.image_url}
              alt={shop.shop_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-20 h-20 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Shop Info */}
        <div className="container relative -mt-20">
          <Card className="border-none shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                {/* Shop Avatar */}
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-background border-4 border-background shadow-lg overflow-hidden shrink-0 -mt-10 md:-mt-20">
                  {shop.image_url ? (
                    <img
                      src={shop.image_url}
                      alt={shop.shop_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <Store className="w-10 h-10 text-primary" />
                    </div>
                  )}
                </div>

                {/* Shop Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 md:gap-3 mb-1 sm:mb-2">
                        <h1 className="text-xl md:text-2xl font-bold text-foreground">
                          {shop.shop_name}
                        </h1>
                        <Badge variant={shop.is_open ? "open" : "closed"}>
                          {shop.is_open ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      <Badge variant="category" className="mb-3">
                        {categoryLabels[shop.category] || shop.category}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 px-2 text-xs sm:text-sm">
                      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Back
                    </Button>
                  </div>

                  {shop.shop_description && (
                    <p className="text-muted-foreground mb-4">
                      {shop.shop_description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium">
                        {shop.rating?.toFixed(1) || "New"}
                      </span>
                      <span className="text-muted-foreground">
                        ({shop.review_count || 0} reviews)
                      </span>
                    </div>

                    {/* Hours */}
                    {shop.opening_hours && shop.closing_hours && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {shop.opening_hours} - {shop.closing_hours}
                        </span>
                      </div>
                    )}

                    {/* Address */}
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate">{shop.address}</span>
                    </div>
                  </div>

                  {/* Delivery Options */}
                  {shop.delivery_options && shop.delivery_options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {shop.delivery_options.map((option) => (
                        <Badge key={option} variant="secondary">
                          {deliveryLabels[option]?.label || option}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products & Reviews Section */}
      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Reviews ({shop.review_count || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {/* Search and Filter */}
            <ShopProductFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={productCategories}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              maxPrice={maxPrice}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalProducts={products?.length || 0}
              filteredCount={filteredProducts.length}
            />

            {/* Products Grid */}
            {productsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    id={`product-${product.id}`}
                    className={`transition-all duration-500 ${highlightedId === product.id
                      ? 'ring-4 ring-orange-500 ring-offset-2 rounded-2xl scale-105 shadow-xl'
                      : ''
                      }`}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.original_price || undefined}
                      imageUrl={product.image_url || undefined}
                      unit={product.unit || "piece"}
                      stock={product.stock}
                      category={product.category}
                      shopCategory={shop.category}
                      onAddToCart={(quantity) => {
                        addItem({
                          productId: product.id,
                          name: product.name,
                          price: product.price,
                          quantity,
                          imageUrl: product.image_url || undefined,
                          unit: product.unit || "piece",
                          sellerId: shop.id,
                          sellerName: shop.shop_name,
                          stock: product.stock,
                        });
                        toast.success(`${quantity} × ${product.name} added to cart`);
                        setIsOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  {products && products.length > 0
                    ? "Try adjusting your search or filters"
                    : "This shop hasn't added any products yet"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <ShopReviews sellerId={shop.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
