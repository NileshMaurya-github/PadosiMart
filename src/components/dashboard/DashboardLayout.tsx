import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: "seller" | "admin";
  userName?: string;
  shopName?: string;
}

const sellerNavItems: { icon: typeof LayoutDashboard; label: string; href: string; badge?: number }[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/seller" },
  // { icon: Store, label: "My Shop", href: "/seller/shop" }, // Pending implementation
  { icon: Package, label: "Products", href: "/seller/products" },
  { icon: ShoppingCart, label: "Orders", href: "/seller/orders", badge: 3 },
  { icon: BarChart3, label: "Analytics", href: "/seller/analytics" },
  // { icon: Settings, label: "Settings", href: "/seller/settings" }, // Pending implementation
];

const adminNavItems: { icon: typeof LayoutDashboard; label: string; href: string; badge?: number }[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Key, label: "Seller Credentials", href: "/admin/credentials" },
  { icon: Store, label: "Sellers", href: "/admin/sellers" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export function DashboardLayout({
  children,
  userRole,
  userName = "User",
  shopName,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const navItems = userRole === "seller" ? sellerNavItems : adminNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 h-16 border-b border-border bg-background flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
            <span className="text-primary-foreground font-bold">L</span>
          </div>
          <span className="font-bold text-foreground">LocalMart</span>
        </Link>

        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-sidebar-foreground">Padosi</span>
                <span className="font-bold text-lg text-orange-500"> Mart</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="font-semibold text-sidebar-accent-foreground">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sidebar-foreground truncate">{userName}</p>
                {shopName && (
                  <p className="text-sm text-muted-foreground truncate">{shopName}</p>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="accent"
                      className="ml-auto h-5 px-2 text-[10px]"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur items-center justify-between px-6">
          <div>
            <h1 className="font-semibold text-foreground">
              {userRole === "seller" ? "Seller Dashboard" : "Admin Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </Button>
            <Link to="/discover">
              <Button variant="outline" size="sm">
                <Store className="w-4 h-4 mr-2" />
                View Marketplace
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
