import { MapPin, User, Menu, X, LogOut, Store, LayoutDashboard, Grid3X3, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { SmartSearch } from "@/components/SmartSearch";

interface NavbarProps {
  location?: string;
  onLocationClick?: () => void;
}

export function Navbar({ location, onLocationClick }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <div className="container flex h-14 md:h-16 items-center justify-between gap-2 md:gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
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

        {/* Smart Search - Visible on all screens */}
        <div className="flex flex-1 max-w-4xl mx-2 md:mx-4 relative">
          <SmartSearch className="w-full" />
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
    </header>
  );
}
