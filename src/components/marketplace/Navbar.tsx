import { MapPin, Search, User, Menu, X, LogOut, Store, LayoutDashboard, Grid3X3, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { CartButton } from "@/components/cart/CartButton";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { ShoppingCart } from "lucide-react";

interface NavbarProps {
  location?: string;
  onLocationClick?: () => void;
}

export function Navbar({ location, onLocationClick }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "seller") return "/seller";
    return null;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-xl text-foreground">Padosi</span>
            <span className="font-bold text-xl text-orange-500"> Mart</span>
          </div>
        </Link>

        {/* Location Selector - Desktop */}
        <button
          onClick={onLocationClick}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors max-w-[200px]"
        >
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm text-foreground truncate">
            {location || "Set location"}
          </span>
        </button>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="relative w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm text-muted-foreground text-left hover:bg-secondary/50 transition-colors"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <span>Search shops & products...</span>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <CartButton />

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{user.user_metadata?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {getDashboardLink() && (
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()!} className="cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                {userRole !== "seller" && (
                  <DropdownMenuItem asChild>
                    <Link to="/seller/register" className="cursor-pointer">
                      <Store className="w-4 h-4 mr-2" />
                      Become a Seller
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link to="/categories" className="cursor-pointer">
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Browse Categories
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="cursor-pointer">
                    <Heart className="w-4 h-4 mr-2" />
                    My Wishlist
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/orders" className="cursor-pointer">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    My Orders
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-slide-up">
          {/* Mobile Search */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setSearchOpen(true);
            }}
            className="relative w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm text-muted-foreground text-left hover:bg-secondary/50 transition-colors mb-4"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <span>Search shops & products...</span>
          </button>

          {/* Mobile Location */}
          <button
            onClick={onLocationClick}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              {location || "Set your location"}
            </span>
          </button>
        </div>
      )}

      {/* Global Search Dialog */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
