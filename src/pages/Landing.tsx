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
  Plus,
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
import { Navbar } from "@/components/marketplace/Navbar";
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

  const { locationName, location, requestLocation } = useLocation();

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
      <Navbar location={locationName} onLocationClick={requestLocation} />
      {/* Hero Banner - Cinematic Glassmorphism */}
      <div className="relative isolate overflow-hidden bg-gray-900 pb-12 pt-4 sm:pb-20 sm:pt-14">
        {/* Background Image with Overlay */}
        <img
          src="https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Market background"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20 blur-sm"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"
        />
        <div
          className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white/5 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center"
        />

        {/* Tech Grid Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>



        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-flow-col xl:gap-x-8">

            {/* Left Content */}
            <div className="max-w-2xl pt-0 sm:pt-16 lg:pt-0 lg:self-center text-center lg:text-left mx-auto lg:mx-0">
              <div className="flex items-center justify-center lg:justify-start gap-x-3 mb-6">
                <span className="inline-flex items-center rounded-md bg-orange-400/10 px-2 py-1 text-xs font-medium text-orange-400 ring-1 ring-inset ring-orange-400/20">
                  Update
                </span>
                <span className="h-4 w-px bg-white/20" />
                <span className="text-sm leading-6 text-gray-300">New shops added in your area</span>
              </div>

              <h1 className="mt-0 text-3xl font-bold tracking-tight text-white sm:text-5xl leading-tight">
                Your Local Market, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
                  Digitized & Delivered.
                </span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-gray-300">
                Experience the warmth of your neighborhood shops with the convenience of modern technology. Fresh groceries, pharmacy, and food—delivered in minutes.
              </p>

              <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-4">
                <Button size="lg" asChild className="bg-orange-500 hover:bg-orange-400 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-orange-500/30">
                  <Link to="/discover">
                    Start Shopping
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 text-base border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                  <Link to="/seller/register">
                    Become a Seller
                  </Link>
                </Button>
              </div>

              {/* Trust Metrics */}
              <div className="mt-14 flex items-center justify-center lg:justify-start gap-8 border-t border-white/10 pt-8">
                <div>
                  <h3 className="text-2xl font-bold text-white">1,200+</h3>
                  <p className="text-xs text-gray-400">Active Shops</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">15min</h3>
                  <p className="text-xs text-gray-400">Avg Delivery</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">4.9/5</h3>
                  <p className="text-xs text-gray-400">User Rating</p>
                </div>
              </div>
            </div>

            {/* Right Side - Realistic App Mockup */}
            <div className="hidden lg:block mt-8 sm:mt-24 lg:col-span-1 lg:mt-0 lg:self-center">
              <div className="relative mx-auto w-[280px] h-[560px] sm:w-[300px] sm:h-[600px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden">
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20"></div>

                {/* Screen Content */}
                <div className="w-full h-full bg-gray-50 dark:bg-gray-800 overflow-hidden relative font-sans flex flex-col">

                  {/* Status Bar Area */}
                  <div className="h-10 w-full bg-white dark:bg-gray-900 z-10"></div>

                  {/* App Header */}
                  <div className="px-5 py-2 bg-white dark:bg-gray-900 flex flex-col shadow-sm z-10">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                      <MapPin className="w-3 h-3 text-orange-500" />
                      Delivering to
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">Home • Sector 15</span>
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="px-5 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-400">Search "milk", "medicines"...</span>
                    </div>
                  </div>

                  {/* Body Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">

                    {/* Promo Banner */}
                    <div className="w-full h-32 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-4 text-white relative overflow-hidden shrink-0">
                      <div className="relative z-10 w-2/3">
                        <p className="text-xs font-bold opacity-90">First Order</p>
                        <p className="text-xl font-bold leading-tight mt-1">50% OFF</p>
                        <p className="text-[10px] mt-2 bg-white/20 inline-block px-2 py-1 rounded">Code: NEW50</p>
                      </div>
                      <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/20 rounded-full blur-2xl transform translate-x-4 translate-y-4"></div>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xl">🥦</div>
                        <span className="text-[10px] text-gray-600 dark:text-gray-300">Grocery</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-xl">🍔</div>
                        <span className="text-[10px] text-gray-600 dark:text-gray-300">Food</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xl">💊</div>
                        <span className="text-[10px] text-gray-600 dark:text-gray-300">Meds</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-xl">📦</div>
                        <span className="text-[10px] text-gray-600 dark:text-gray-300">Package</span>
                      </div>
                    </div>

                    {/* Featured Shops */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs">Recommended</h4>
                        <span className="text-[10px] text-orange-500 font-bold">See All</span>
                      </div>
                      <div className="bg-white dark:bg-gray-900 p-2 rounded-xl flex gap-3 shadow-sm">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                          <img src="https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=100" className="w-full h-full object-cover" alt="Food" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">The Burger Club</p>
                          <p className="text-[10px] text-gray-500">American • 25 mins</p>
                          <div className="mt-1 flex gap-1">
                            <Star className="w-2 h-2 text-yellow-400 fill-current" />
                            <span className="text-[10px] text-gray-400 leading-none">4.5 (1k+)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Navigation */}
                  <div className="h-14 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-around items-center px-4 relative z-10">
                    <div className="flex flex-col items-center gap-0.5">
                      <Store className="w-5 h-5 text-orange-500" />
                      <span className="text-[9px] font-bold text-orange-500">Home</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Search className="w-5 h-5 text-gray-400" />
                      <span className="text-[9px] text-gray-400">Search</span>
                    </div>

                    {/* Floating Cart Button in Middle */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-500 rounded-full shadow-lg shadow-orange-500/40 flex items-center justify-center border-4 border-gray-50 dark:border-gray-800">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <Heart className="w-5 h-5 text-gray-400" />
                      <span className="text-[9px] text-gray-400">Likes</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-[9px] text-gray-400">Profile</span>
                    </div>
                  </div>

                  {/* Active Order Toast (Floating) */}
                  <div className="absolute bottom-20 left-4 right-4 bg-gray-900/90 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/10 z-20 animate-slide-up">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                        <Truck className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 font-medium uppercase">Order #2045</p>
                        <p className="text-xs text-white font-bold">Arriving in 6 mins</p>
                      </div>
                    </div>
                  </div>

                </div>
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
          <div className="flex items-end justify-between mb-4 sm:mb-8">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Popular Near You</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Top-rated shops in your area</p>
            </div>
            <Button variant="ghost" asChild className="text-orange-500 hover:text-orange-600 p-0 h-auto font-medium text-xs sm:text-sm hover:bg-transparent">
              <Link to="/discover">View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayShops.map((shop: any) => (
              <Link
                key={shop.id}
                to={shop.id.startsWith("demo") ? "/discover" : `/shop/${shop.id}`}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 bg-white dark:bg-gray-800">
                  <div className="relative h-28 sm:h-40">
                    <img
                      src={shop.image_url || `https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400`}
                      alt={shop.shop_name}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      className={`absolute top-2 left-2 px-1.5 py-0.5 text-[10px] sm:text-xs sm:top-3 sm:left-3 ${shop.is_open ? 'bg-green-500' : 'bg-gray-500'}`}
                    >
                      {shop.is_open ? "Open Now" : "Closed"}
                    </Badge>
                  </div>
                  <div className="p-2.5 sm:p-4">
                    <div className="flex items-start justify-between mb-1 sm:mb-2">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate pr-1">{shop.shop_name}</h3>
                      <div className="flex items-center gap-0.5 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded shrink-0">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-green-600 text-green-600" />
                        <span className="text-xs sm:text-sm font-medium text-green-600">{shop.rating?.toFixed(1) || "New"}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 capitalize truncate">{shop.category}</p>
                    <div className="flex items-center justify-between text-[10px] sm:text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>15-30 min</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
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
          <div className="flex items-end justify-between mb-4 sm:mb-8">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Shop by Category</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Find what you need locally</p>
            </div>
            <Button variant="ghost" asChild className="text-orange-500 hover:text-orange-600 p-0 h-auto font-medium text-xs sm:text-sm hover:bg-transparent">
              <Link to="/discover">View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" /></Link>
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
    </div>
  );
}
