import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LocationProvider } from "@/hooks/useLocation";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CartSheet } from "@/components/cart/CartSheet";
import { OrderNotificationProvider } from "@/components/notifications/OrderNotificationProvider";
import Landing from "./pages/Landing";
import Discover from "./pages/Discover";
import ShopDetail from "./pages/ShopDetail";
import Checkout from "./pages/Checkout";
import CustomerOrders from "./pages/CustomerOrders";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Wishlist from "./pages/Wishlist";
import OrderTracking from "./pages/OrderTracking";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerRegistration from "./pages/seller/SellerRegistration";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerAnalytics from "./pages/seller/SellerAnalytics";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import SellerCredentials from "./pages/admin/SellerCredentials";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <OrderNotificationProvider />
              <BrowserRouter>
                <CartSheet />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/shop/:shopId" element={<ShopDetail />} />
                  <Route path="/checkout/:sellerId" element={<Checkout />} />
                  <Route path="/orders" element={<CustomerOrders />} />
                  <Route path="/orders/:orderId" element={<OrderTracking />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/seller/register" element={<SellerRegistration />} />
                  <Route path="/seller/products" element={<SellerProducts />} />
                  <Route path="/seller/orders" element={<SellerOrders />} />
                  <Route path="/seller/analytics" element={<SellerAnalytics />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/credentials" element={<SellerCredentials />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
