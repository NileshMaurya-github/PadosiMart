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
  ShieldCheck, // Added
  CheckCircle,
  Zap,
  Gift,
  Headphones,
  Loader2,
  Navigation,
  Bell // Added
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
import { CategoryRow } from "@/components/marketplace/CategoryRow";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
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
  { icon: Headphones, title: "24/7 Support", description: "We're always here", color: "bg-orange-500" },
];

const dummyShops = [
  {
    id: "demo-1",
    shop_name: "Daily Fresh Mart",
    image_url: "https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.8,
    is_open: true,
    category: "grocery",
    distance: 0.8,
    address: "123 Main St"
  },
  {
    id: "demo-2",
    shop_name: "Apollo Pharmacy",
    image_url: "https://images.pexels.com/photos/5910953/pexels-photo-5910953.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.6,
    is_open: true,
    category: "medical",
    distance: 1.2,
    address: "45 Care Rd"
  },
  {
    id: "demo-3",
    shop_name: "Tech Zone",
    image_url: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.9,
    is_open: true,
    category: "electronics",
    distance: 2.5,
    address: "Tech Park"
  },
  {
    id: "demo-4",
    shop_name: "Tasty  Bites",
    image_url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.7,
    is_open: false,
    category: "food",
    distance: 0.5,
    address: "Food Street"
  }

];

export default function Landing() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const { locationName, location } = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ["shops-preview", location],
    queryFn: async () => {
      let query = supabase
        .from("sellers")
        .select("*")
        .eq("status", "approved")
        .limit(4);

      if (location) {
        // In a real app, we would use PostGIS for location-based search
        // For now, we'll just demonstrate the UI
      }

      const { data, error } = await query;
      // if (error) throw error;
      return data;
    },
  });

  // Also fetch shops by category for the slider sections
  const { data: categoryShops } = useQuery({
    queryKey: ['landing-category-shops'],
    queryFn: async () => {
      // Fetch 10 approved shops
      const { data: shops, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('status', 'approved')
        .limit(20);

      // if (error) throw error;

      // Group by category manually since we don't have a complex query
      const grouped: Record<string, any[]> = {};

      shops?.forEach(shop => {
        const cat = shop.category || 'other';
        if (!grouped[cat]) grouped[cat] = [];
        if (grouped[cat].length < 8) {
          grouped[cat].push(shop);
        }
      });

      // Fallback: If no shops found, return demo data to ensure UI looks good
      if (Object.keys(grouped).length === 0) {
        const generate = (cat: string, img: string, count: number) =>
          Array.from({ length: count }).map((_, i) => ({
            id: `demo-${cat}-${i}`,
            shop_name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Store ${i + 1}`,
            rating: 4.2 + (i % 5) / 10,
            is_open: true,
            image_url: img,
            distance: 0.5 + i * 0.3,
            category: cat
          }));
        return {
          grocery: generate('grocery', 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?w=400', 6),
          medical: generate('medical', 'https://images.pexels.com/photos/5910953/pexels-photo-5910953.jpeg?w=400', 6),
          electronics: generate('electronics', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?w=400', 6),
          food: generate('food', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400', 6),
          clothing: generate('clothing', 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?w=400', 6),
          services: generate('services', 'https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?w=400', 6)
        };
      }

      return grouped;
    }
  });


  const displayShops = shops && shops.length > 0 ? shops : dummyShops;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:flex items-baseline gap-1">
              <span className="font-bold text-xl text-gray-900 dark:text-white">Padosi</span>
              <span className="font-bold text-xl text-orange-500">Mart</span>
            </div>
          </Link>

          {/* Location Button */}
          <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="truncate max-w-[150px]">{locationName}</span>
          </Button>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <SmartSearch />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden sm:flex text-gray-500 hover:text-orange-500">
              <Heart className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-orange-500">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </Button>

            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/seller")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Seller Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner - Enhanced 3D */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-950 pt-10 pb-20 lg:pt-20 lg:pb-32">
        {/* Abstract Background Shapes - Softer */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100/60 dark:bg-orange-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-50/60 dark:bg-blue-900/10 rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Content */}
            <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-6 shadow-sm hover:shadow-md transition-all cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live in your neighborhood
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
                Your Neighborhood, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                  Now Online
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Discover local shops near you. Fresh groceries, medicines, electronics, and more—all from trusted neighborhood sellers, delivered to your door.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10 sm:mb-12">
                <Button size="lg" asChild className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-xl shadow-orange-500/20 transition-transform hover:-translate-y-1">
                  <Link to="/discover">
                    <MapPin className="w-5 h-5 mr-2" />
                    Find Nearby Shops
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full px-8 h-12 sm:h-14 text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                  <Link to="/categories">
                    View Categories
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">15m</p>
                  <p className="text-xs sm:text-sm text-gray-500">Avg Delivery</p>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">100%</p>
                  <p className="text-xs sm:text-sm text-gray-500">Secure Payment</p>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">24/7</p>
                  <p className="text-xs sm:text-sm text-gray-500">Support</p>
                </div>
              </div>
            </div>

            {/* Right Side - 3D Ecosystem Composition */}
            <div className="hidden lg:flex justify-center items-center relative h-[600px]">
              {/* Decorative Background Blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-200/20 dark:bg-orange-900/10 rounded-full blur-3xl animate-pulse" />

              <div className="relative w-full max-w-[500px] h-[500px] perspective-1000">
                {/* Central Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center w-48 hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-orange-500/20">
                      <Store className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Local Shops</h3>
                    <p className="text-xs text-gray-500">Connected Hub</p>
                  </div>
                </div>

                {/* Floating Card 1: Fast Delivery (Top Right) */}
                <div className="absolute top-10 right-0 z-10 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-40 transform rotate-6 hover:rotate-0 transition-transform">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400"><Truck className="w-5 h-5" /></div>
                      <span className="font-bold text-sm text-green-700 dark:text-green-400">Fast</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">Super fast delivery from nearby stores</p>
                  </div>
                </div>

                {/* Floating Card 2: Fresh Quality (Bottom Left) */}
                <div className="absolute bottom-20 left-0 z-10 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-44 transform -rotate-3 hover:rotate-0 transition-transform">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600"><ShieldCheck className="w-5 h-5" /></div>
                      <span className="font-bold text-sm text-blue-700 dark:text-blue-400">Quality</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">100% Genuine products & verified sellers</p>
                  </div>
                </div>

                {/* Floating Card 3: Top Rated (Top Left) */}
                <div className="absolute top-20 left-4 z-10 animate-bounce" style={{ animationDuration: '6s', animationDelay: '0.5s' }}>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-3 transform -rotate-6">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 flex items-center justify-center text-[10px] overflow-hidden`}>
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex text-yellow-400 text-xs"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
                      <p className="text-[10px] font-bold text-gray-900 dark:text-white">Happy Customers</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card 4: Categories (Bottom Right) */}
                <div className="absolute bottom-32 right-4 z-10 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform rotate-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-orange-50 p-2 rounded-lg text-center"><span className="text-xl">🍔</span><p className="text-[8px] text-gray-500">Food</p></div>
                      <div className="bg-green-50 p-2 rounded-lg text-center"><span className="text-xl">🥦</span><p className="text-[8px] text-gray-500">Grocery</p></div>
                      <div className="bg-blue-50 p-2 rounded-lg text-center"><span className="text-xl">💊</span><p className="text-[8px] text-gray-500">Meds</p></div>
                      <div className="bg-purple-50 p-2 rounded-lg text-center"><span className="text-xl">📦</span><p className="text-[8px] text-gray-500">More</p></div>
                    </div>
                  </div>
                </div>

                {/* Connecting Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none opacity-20 dark:opacity-10">
                  <path d="M250 250 L400 100" stroke="orange" strokeWidth="2" strokeDasharray="5,5" />
                  <path d="M250 250 L100 400" stroke="orange" strokeWidth="2" strokeDasharray="5,5" />
                  <path d="M250 250 L100 100" stroke="orange" strokeWidth="2" strokeDasharray="5,5" />
                  <path d="M250 250 L400 350" stroke="orange" strokeWidth="2" strokeDasharray="5,5" />
                </svg>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Strip */}
      <section className="hidden md:block bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
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
                {locationName && (
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
                  <CategoryRow
                    key={category}
                    category={category}
                    shops={shopList}
                    categoryName={categoryNames[category] || category}
                    categoryImage={categoryImages[category]}
                  />
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
      </section >

      {/* Stats Section */}
      < section className="py-16" >
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
      </section >

      <HowItWorks />
      <Testimonials />

      {/* Download CTA */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Start shopping in seconds
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get Everything You Need, Delivered Fast
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
              From daily essentials to special occasions, Padosi Mart connects you with the best local stores.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-orange-500 hover:bg-orange-600 rounded-full px-8 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all">
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
    </div >
  );
}
