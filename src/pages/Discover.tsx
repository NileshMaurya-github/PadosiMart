import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { Navbar } from "@/components/marketplace/Navbar";
import { LocationPrompt } from "@/components/marketplace/LocationPrompt";
import { Loader2, MapPin, Store, Star, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SmartSearch } from "@/components/SmartSearch";

type Seller = {
  id: string;
  shop_name: string;
  shop_description: string | null;
  category: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  is_open: boolean | null;
  rating: number | null;
  review_count: number | null;
  opening_hours: string | null;
  closing_hours: string | null;
  delivery_options: string[] | null;
};

type ShopWithDistance = Seller & {
  distance: number | null;
};

// Haversine formula to calculate distance
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const categoryDisplayNames: Record<string, string> = {
  grocery: "Grocery & Essentials",
  medical: "Pharmacy & Health",
  electronics: "Electronics & Gadgets",
  clothing: "Fashion & Clothing",
  food: "Food & Restaurants",
  services: "Home Services",
  other: "Other Shops"
};

const categoryEmojis: Record<string, string> = {
  grocery: "🛒",
  medical: "💊",
  electronics: "📱",
  clothing: "👕",
  food: "🍔",
  services: "🔧",
  other: "🏪"
};

export default function Discover() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search") || "";

  const { location, locationName, isLoadingLocation, locationError, requestLocation } = useLocation();

  // Fetch all approved sellers
  const { data: sellers, isLoading: sellersLoading } = useQuery({
    queryKey: ["all-sellers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("is_approved", true)
        .eq("is_active", true);

      if (error) throw error;
      return data as Seller[];
    },
  });

  // Process shops: Calculate distance and filter
  const processedShops = useMemo(() => {
    if (!sellers) return [];

    let shops: ShopWithDistance[] = sellers.map(seller => ({
      ...seller,
      distance: location
        ? calculateDistance(location.lat, location.lng, seller.latitude, seller.longitude)
        : null
    }));

    // Filter by search term from URL
    if (searchQuery) {
      const lowerInfos = searchQuery.toLowerCase();
      shops = shops.filter(s =>
        s.shop_name.toLowerCase().includes(lowerInfos) ||
        s.category.toLowerCase().includes(lowerInfos) ||
        (s.shop_description && s.shop_description.toLowerCase().includes(lowerInfos))
      );
    }

    // Sort by distance if available, otherwise rating
    shops.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    return shops;
  }, [sellers, location, searchQuery]);

  // Group by category
  const groupedShops = useMemo(() => {
    const groups: Record<string, ShopWithDistance[]> = {};

    // Initialize common categories to ensure order
    const orderedCategories = ["grocery", "medical", "electronics", "clothing", "food", "services"];
    orderedCategories.forEach(cat => groups[cat] = []);

    processedShops.forEach(shop => {
      const cat = shop.category.toLowerCase();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(shop);
    });

    // Remove empty categories
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) delete groups[key];
    });

    return groups;
  }, [processedShops]);

  // If specific category selected via URL, show only that
  const displayGroups = useMemo(() => {
    if (initialCategory && initialCategory !== 'all') {
      const filtered: Record<string, ShopWithDistance[]> = {};
      if (groupedShops[initialCategory]) {
        filtered[initialCategory] = groupedShops[initialCategory];
      }
      // Also check fallback for loose match
      else {
        const found = Object.keys(groupedShops).find(k => k.includes(initialCategory) || initialCategory.includes(k));
        if (found) filtered[found] = groupedShops[found];
      }
      return filtered;
    }
    return groupedShops;
  }, [groupedShops, initialCategory]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar location={locationName} onLocationClick={requestLocation} />

      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Discover Shops</h1>
          <p className="text-sm text-gray-500">Find the best local businesses near you</p>

          {/* Smart Search Bar */}
          <div className="mt-4 max-w-2xl relative z-30">
            <SmartSearch />
          </div>

          {/* Quick Filters */}
          <div className="mt-4 flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-2 scrollbar-hide snap-x">
            <Button
              variant={!initialCategory || initialCategory === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => navigate('/discover?category=all')}
              className={`rounded-full h-8 text-xs snap-start ${!initialCategory || initialCategory === 'all' ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
            >
              All
            </Button>
            {Object.keys(categoryDisplayNames).map(cat => (
              <Button
                key={cat}
                variant={initialCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => navigate(`/discover?category=${cat}`)}
                className={`rounded-full h-8 text-xs whitespace-nowrap snap-start ${initialCategory === cat ? "bg-orange-500 hover:bg-orange-600 text-white" : "text-gray-600"}`}
              >
                {categoryEmojis[cat]} {categoryDisplayNames[cat].split('&')[0].trim()}
              </Button>
            ))}
          </div>

          {!location && !isLoadingLocation && (
            <div className="mt-6 p-4 bg-orange-50 text-orange-700 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium">Location not detected</p>
                <p className="text-sm opacity-80">Enable location to see distance and nearest shops.</p>
              </div>
              <Button size="sm" onClick={requestLocation} variant="outline" className="border-orange-200 hover:bg-orange-100">
                Enable Location
              </Button>
            </div>
          )}
        </div>

        {sellersLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : Object.keys(displayGroups).length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No shops found</h3>
            <p className="text-gray-500">Try adjusting your search or location.</p>
            {(!sellers || sellers.length === 0) && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Dev: No data in database?</p>
                <Button onClick={() => import("@/utils/seedData").then(m => m.seedDemoData())} variant="outline">
                  Seed Demo Data
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(displayGroups).map(([category, shops]) => (
              <section key={category}>
                <div className="flex items-center gap-2 mb-3 sm:mb-6 border-b pb-2 sm:pb-4">
                  <span className="text-2xl sm:text-3xl">{categoryEmojis[category] || "🏪"}</span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white capitalize">
                      {categoryDisplayNames[category] || category}
                    </h2>
                    <p className="text-xs text-gray-500">{shops.length} shops available</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {shops.map((shop) => (
                    <Link key={shop.id} to={`/shop/${shop.id}`}>
                      <Card className="overflow-hidden border group hover:border-orange-200 hover:shadow-lg transition-all duration-300">
                        <div className="relative h-28 sm:h-48 overflow-hidden">
                          <img
                            src={shop.image_url || "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=600"}
                            alt={shop.shop_name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Badge
                            className={`absolute top-2 left-2 px-1.5 py-0.5 text-[10px] sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 ${shop.is_open ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                          >
                            {shop.is_open ? 'Open' : 'Closed'}
                          </Badge>
                          {shop.distance && shop.distance < 5 && (
                            <Badge variant="secondary" className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] sm:top-3 sm:right-3 sm:px-2.5 sm:py-1 bg-white/90 text-gray-900">
                              Nearby
                            </Badge>
                          )}
                        </div>

                        <div className="p-2.5 sm:p-4">
                          <h3 className="font-bold text-sm sm:text-lg text-gray-900 mb-1 group-hover:text-orange-600 transition-colors truncate">
                            {shop.shop_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 mb-2 sm:mb-3">
                            {shop.shop_description || "No description available"}
                          </p>

                          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{shop.rating?.toFixed(1) || "New"}</span>
                              <span className="text-gray-400">({shop.review_count || 0})</span>
                            </div>
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>20-30m</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-0.5 sm:gap-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate max-w-[100px] sm:max-w-[150px]">{shop.address}</span>
                            </div>
                            {shop.distance !== null && (
                              <span className="font-medium text-orange-500 flex-shrink-0">
                                {shop.distance.toFixed(1)} km
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
