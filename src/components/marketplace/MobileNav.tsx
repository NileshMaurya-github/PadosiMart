
import { Home, Compass, ShoppingBag, Heart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const MobileNav = () => {
    const location = useLocation();
    const pathname = location.pathname;

    // Don't show on admin or seller routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/seller")) {
        return null;
    }

    const navItems = [
        {
            label: "Home",
            icon: Home,
            href: "/",
        },
        {
            label: "Discover",
            icon: Compass,
            href: "/discover",
        },
        {
            label: "Cart",
            icon: ShoppingBag,
            href: "/orders", // Using orders as cart/orders entry point for now
        },
        {
            label: "Wishlist",
            icon: Heart,
            href: "/wishlist",
        },
        {
            label: "Profile",
            icon: User,
            href: "/profile",
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pb-safe md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive
                                    ? "text-orange-600 dark:text-orange-500"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <item.icon
                                className={cn("w-6 h-6", isActive && "fill-current")}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
