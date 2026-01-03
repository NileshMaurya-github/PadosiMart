import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Store,
  ShoppingBag,
  MapPin,
  Users,
  ChevronRight,
  Star,
  LogOut,
  LayoutDashboard,
  User,
  Search,
  ShoppingCart,
  Heart,
  Clock,
  Truck,
  Shield,
  CheckCircle,
  Zap,
  Gift,
  Headphones,
  Loader2,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { SmartSearch } from "@/components/SmartSearch";
import { supabase } from "@/integrations/supabase/client";

const stats = [
  { icon: Store, label: "Local Shops", value: "500+", color: "text-emerald-500" },
  { icon: Users, label: "Happy Customers", value: "10K+", color: "text-blue-500" },
  { icon: ShoppingBag, label: "Products", value: "25K+", color: "text-purple-500" },
  { icon: MapPin, label: "Cities", value: "15+", color: "text-orange-500" },
];

// Premium categories with curated images
const categories = [
  {
    name: "Grocery & Essentials",
    shortName: "Grocery",
    image: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=500",
    description: "Fresh fruits, vegetables & daily needs"
  },
  {
    name: "Health & Pharmacy",
    shortName: "Medical",
    image: "https://images.pexels.com/photos/159211/headache-pain-pills-medication-159211.jpeg?auto=compress&cs=tinysrgb&w=500",
    description: "Medicines, wellness & healthcare"
  },
  {
    name: "Electronics & Gadgets",
    shortName: "Electronics",
    image: "https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=500",
    description: "Phones, laptops & accessories"
  },
  {
    name: "Fashion & Apparel",
    shortName: "Clothing",
    image: "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=500",
    description: "Clothing, shoes & accessories"
  },
  {
    name: "Food & Dining",
    shortName: "Food",
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500",
    description: "Restaurants, cafes & bakeries"
  },
  {
    name: "Home Services",
    shortName: "Services",
    image: "https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=500",
    description: "Repairs, cleaning & maintenance"
  },
];

const features = [
  { icon: Truck, title: "Express Delivery", description: "Get it in under 30 minutes", color: "bg-green-500" },
  { icon: Shield, title: "Secure Payments", description: "100% safe transactions", color: "bg-blue-500" },
  { icon: Gift, title: "Daily Offers", description: "Save more with deals", color: "bg-purple-500" },
  { icon: Headphones, title: "24/7 Support", description: "We're always here", color: "bg-orange-500" },
];

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const { location, locationName, isLoadingLocation, requestLocation, calculateDistance } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Fetch popular shops near user location
  const { data: popularShops, isLoading: shopsLoading } = useQuery({
    queryKey: ["popular-shops", location?.lat, location?.lng],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("is_approved", true)
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(8);

      if (error) throw error;

      // Sort by distance if location available
      if (location && data) {
        return data.map(shop => ({
          ...shop,
          distance: calculateDistance(shop.latitude, shop.longitude)
        })).sort((a, b) => (a.distance || 999) - (b.distance || 999)).slice(0, 4);
      }
      return data?.slice(0, 4) || [];
    },
    staleTime: 60000,
  });

  // Fetch shops by category
  const { data: categoryShops } = useQuery({
    queryKey: ["category-shops", location?.lat, location?.lng],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .eq("is_approved", true)
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (error) throw error;

      // Group by category and add distance
      const grouped: Record<string, any[]> = {};
      const allCategories = ["grocery", "medical", "electronics", "clothing", "food", "services"];

      allCategories.forEach(cat => {
        grouped[cat] = [];
      });

      (data || []).forEach(shop => {
        const cat = shop.category?.toLowerCase() || "other";
        if (grouped[cat]) {
          grouped[cat].push({
            ...shop,
            distance: location ? calculateDistance(shop.latitude, shop.longitude) : null
          });
        }
      });

      // Sort each category by distance and take top 4
      Object.keys(grouped).forEach(cat => {
        grouped[cat] = grouped[cat]
          .sort((a, b) => (a.distance || 999) - (b.distance || 999))
          .slice(0, 4);
      });

      return grouped;
    },
    staleTime: 60000,
  });

  const getDashboardLink = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "seller") return "/seller";
    return null;
  };

  // Demo shops fallback
  const demoShops = [
    { id: "demo-1", shop_name: "Fresh Mart", category: "grocery", rating: 4.8, is_open: true, address: "123 Main St", image_url: "https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: "demo-2", shop_name: "HealthPlus Pharmacy", category: "medical", rating: 4.9, is_open: true, address: "456 Health Ave", image_url: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: "demo-3", shop_name: "TechWorld", category: "electronics", rating: 4.6, is_open: true, address: "789 Tech Blvd", image_url: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: "demo-4", shop_name: "Style Studio", category: "clothing", rating: 4.7, is_open: true, address: "321 Fashion Lane", image_url: "https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=400" },
  ];

  const displayShops = popularShops && popularShops.length > 0 ? popularShops : demoShops;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Clean Navigation */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:flex items-baseline gap-1">
              <span className="font-bold text-xl text-gray-900 dark:text-white">Padosi</span>
              <span className="font-bold text-xl text-orange-500">Mart</span>
            </div>
          </Link>

          {/* Location Button */}
          <button
            onClick={requestLocation}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors max-w-[200px] border border-orange-200 dark:border-orange-800"
          >
            {isLoadingLocation ? (
              <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-orange-500" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
              {locationName || "Set Location"}
            </span>
          </button>

          {/* Smart Search Bar */}
          <SmartSearch className="flex-1 max-w-xl" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link to="/wishlist">
                <Heart className="w-5 h-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link to="/orders">
                <ShoppingCart className="w-5 h-5" />
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium">{user.user_metadata?.full_name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getDashboardLink() && (
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()!}><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile"><User className="w-4 h-4 mr-2" />Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders"><ShoppingBag className="w-4 h-4 mr-2" />Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild className="rounded-full bg-orange-500 hover:bg-orange-600">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner - Enhanced */}
      <section className="relative overflow-hidden min-h-[600px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/95 via-orange-500/90 to-amber-500/80" />
        </div>

        {/* Mesh Gradient Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-yellow-400/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-red-500/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Animated Floating Shapes */}
        <div className="absolute top-20 left-[10%] w-4 h-4 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-40 right-[15%] w-3 h-3 bg-yellow-300/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
        <div className="absolute bottom-32 left-[20%] w-5 h-5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
        <div className="absolute top-1/2 left-[5%] w-2 h-2 bg-amber-300/50 rounded-full animate-ping" style={{ animationDuration: '2s' }} />

        <div className="container relative py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Trusted by 10,000+ customers
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Your Neighborhood
                <br />
                <span className="relative">
                  Store, Delivered
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C50 4 150 2 298 6" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Fresh groceries, medicines, electronics & more from trusted local shops.
                <span className="font-semibold"> Delivered in minutes, not hours.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Button size="lg" asChild className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 h-14 text-lg font-semibold shadow-lg shadow-orange-900/20">
                  <Link to="/discover">
                    <MapPin className="w-5 h-5 mr-2" />
                    Shop Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 h-14 text-lg font-semibold backdrop-blur-sm">
                  <Link to="/categories">
                    Explore Categories
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">15 min</p>
                    <p className="text-white/70 text-sm">Avg. Delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">500+</p>
                    <p className="text-white/70 text-sm">Local Shops</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">4.9/5</p>
                    <p className="text-white/70 text-sm">User Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Premium App Preview */}
            <div className="hidden lg:flex items-center justify-center relative">
              {/* Phone Mockup */}
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-72 h-[520px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-orange-900/30">
                  {/* Screen */}
                  <div className="w-full h-full bg-white rounded-[2.4rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="bg-white px-6 py-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-900">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 bg-gray-900 rounded-sm" />
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="px-4 pb-4">
                      {/* Search Bar */}
                      <div className="bg-gray-100 rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Search products...</span>
                      </div>

                      {/* Featured Product */}
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">🔥 Today's Deal</span>
                          <Heart className="w-5 h-5 text-gray-300" />
                        </div>
                        <img
                          src="https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=200"
                          alt="Fresh Produce"
                          className="w-full h-28 object-cover rounded-xl mb-3"
                        />
                        <h4 className="font-bold text-gray-900">Fresh Vegetables Pack</h4>
                        <div className="flex items-center justify-between mt-2">
                          <div>
                            <span className="text-lg font-bold text-gray-900">₹149</span>
                            <span className="text-sm text-gray-400 line-through ml-2">₹249</span>
                          </div>
                          <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
                            <Star className="w-3 h-3 fill-green-600 text-green-600" />
                            <span className="text-xs font-bold text-green-600">4.8</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Categories */}
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                          <div className="text-2xl mb-1">💊</div>
                          <span className="text-xs font-medium text-gray-700">Medicine</span>
                        </div>
                        <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
                          <div className="text-2xl mb-1">🥬</div>
                          <span className="text-xs font-medium text-gray-700">Grocery</span>
                        </div>
                        <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center">
                          <div className="text-2xl mb-1">📱</div>
                          <span className="text-xs font-medium text-gray-700">Electronics</span>
                        </div>
                      </div>

                      {/* Order Status */}
                      <div className="bg-orange-500 rounded-2xl p-4 text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Truck className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-white/80">Order #1234</p>
                            <p className="font-bold">On the way!</p>
                            <p className="text-xs text-white/80">Arriving in 8 mins</p>
                          </div>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements Around Phone */}
                <div className="absolute -top-4 -right-8 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-bounce">
                  <Zap className="w-4 h-4" />
                  Free Delivery
                </div>

                <div className="absolute top-24 -left-16 bg-white rounded-2xl shadow-xl p-3 w-36">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivery</p>
                      <p className="text-sm font-bold text-gray-900">15 min</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-32 -left-20 bg-white rounded-2xl shadow-xl p-3 w-40">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-orange-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">A</div>
                      <div className="w-8 h-8 bg-blue-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">R</div>
                      <div className="w-8 h-8 bg-green-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold">S</div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Happy users</p>
                      <p className="text-sm font-bold text-gray-900">10K+</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-16 -right-12 bg-white rounded-2xl shadow-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-900">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3 shrink-0">
                <div className={`w-10 h-10 rounded-full ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Categories Row */}
      <section className="py-8 border-b border-gray-100 dark:border-gray-800">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/discover?category=${cat.shortName.toLowerCase()}`}
                className="group block"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <img
                    src={cat.image}
                    alt={cat.shortName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <span className="text-lg font-bold text-white drop-shadow-md">
                      {cat.shortName}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Shops Near You */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Near You</h2>
                {location && (
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {locationName}
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 mt-1">Top-rated shops in your area</p>
            </div>
            <Button variant="ghost" asChild className="text-orange-500 hover:text-orange-600">
              <Link to="/discover">See All <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>

          {shopsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayShops.map((shop: any) => (
                <Link
                  key={shop.id}
                  to={shop.id.startsWith("demo") ? "/discover" : `/shop/${shop.id}`}
                >
                  <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 bg-white dark:bg-gray-800">
                    <div className="relative h-40">
                      <img
                        src={shop.image_url || `https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400`}
                        alt={shop.shop_name}
                        className="w-full h-full object-cover"
                      />
                      <Badge
                        className={`absolute top-3 left-3 ${shop.is_open ? 'bg-green-500' : 'bg-gray-500'}`}
                      >
                        {shop.is_open ? "Open Now" : "Closed"}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{shop.shop_name}</h3>
                        <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-green-600 text-green-600" />
                          <span className="text-sm font-medium text-green-600">{shop.rating?.toFixed(1) || "New"}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-3 capitalize">{shop.category}</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>15-30 min</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{shop.distance ? `${shop.distance.toFixed(1)} km` : shop.address?.split(",")[0] || "Nearby"}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category - Shows actual shops */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
              <p className="text-gray-500 mt-1">Find what you need from local stores</p>
            </div>
            <Button variant="ghost" asChild className="text-orange-500 hover:text-orange-600">
              <Link to="/discover">View All Shops <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>

          {/* Category Tabs with Shops */}
          {categoryShops && Object.keys(categoryShops).length > 0 ? (
            <div className="space-y-10">
              {Object.entries(categoryShops).map(([category, shops]) => {
                const categoryNames: Record<string, string> = {
                  grocery: "🛒 Grocery & Essentials",
                  medical: "💊 Health & Pharmacy",
                  electronics: "📱 Electronics & Gadgets",
                  clothing: "👕 Fashion & Clothing",
                  food: "🍔 Food & Restaurants",
                  services: "🔧 Home Services"
                };

                const categoryImages: Record<string, string> = {
                  grocery: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?w=600",
                  medical: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?w=600",
                  electronics: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?w=600",
                  clothing: "https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?w=600",
                  food: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=600",
                  services: "https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=600"
                };

                // Skip if no shops
                const shopList = shops as any[];
                if (!shopList || shopList.length === 0) return null;

                return (
                  <div key={category} className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {categoryNames[category] || category}
                      </h3>
                      <Link
                        to={`/discover?category=${category}`}
                        className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                      >
                        View All <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {shopList.slice(0, 4).map((shop: any) => (
                        <Link key={shop.id} to={`/shop/${shop.id}`}>
                          <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 bg-white dark:bg-gray-800 h-full">
                            <div className="relative h-32">
                              <img
                                src={shop.image_url || categoryImages[category]}
                                alt={shop.shop_name}
                                className="w-full h-full object-cover"
                              />
                              {shop.is_open && (
                                <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title="Open Now" />
                              )}
                            </div>
                            <div className="p-3">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{shop.shop_name}</h4>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {shop.rating?.toFixed(1) || "New"}
                                  </span>
                                </div>
                                {shop.distance && (
                                  <span className="text-xs text-gray-500">
                                    {shop.distance.toFixed(1)} km
                                  </span>
                                )}
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Fallback: Show category cards if no shops loaded */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/discover?category=${cat.shortName.toLowerCase()}`}
                  className="group"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-white text-sm md:text-base">{cat.shortName}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>




      {/* Stats Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Why Choose Padosi Mart?
            </h2>
            <p className="text-gray-500">Trusted by thousands of customers every day</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Start shopping in seconds
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get Everything You Need, Delivered Fast
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              From daily essentials to special occasions, Padosi Mart connects you with the best local stores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-orange-500 hover:bg-orange-600 rounded-full px-8">
                <Link to="/discover">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Shopping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-xl text-gray-900 dark:text-white">Padosi</span>
                  <span className="font-bold text-xl text-orange-500">Mart</span>
                </div>
              </Link>
              <p className="text-gray-500 text-sm">
                Your trusted neighborhood marketplace. Shop local, save time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Shop</h4>
              <div className="space-y-2 text-sm">
                <Link to="/discover" className="block text-gray-500 hover:text-orange-500">Browse Shops</Link>
                <Link to="/categories" className="block text-gray-500 hover:text-orange-500">Categories</Link>
                <Link to="/orders" className="block text-gray-500 hover:text-orange-500">Track Orders</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Sell</h4>
              <div className="space-y-2 text-sm">
                <Link to="/seller/register" className="block text-gray-500 hover:text-orange-500">Register Shop</Link>
                <Link to="/seller" className="block text-gray-500 hover:text-orange-500">Seller Dashboard</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Help</h4>
              <div className="space-y-2 text-sm">
                <Link to="/about" className="block text-gray-500 hover:text-orange-500">About Us</Link>
                <Link to="/contact" className="block text-gray-500 hover:text-orange-500">Contact</Link>
                <Link to="/privacy" className="block text-gray-500 hover:text-orange-500">Privacy</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-500">
              © 2026 Padosi Mart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
