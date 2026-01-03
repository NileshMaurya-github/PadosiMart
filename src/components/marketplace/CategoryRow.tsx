
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CategoryRowProps {
    category: string;
    shops: any[];
    categoryName: string;
    categoryImage: string;
}

export const CategoryRow = ({ category, shops, categoryName, categoryImage }: CategoryRowProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 340; // Approx one card width + gap
            const currentScroll = scrollContainerRef.current.scrollLeft;
            const targetScroll =
                direction === "left"
                    ? currentScroll - scrollAmount
                    : currentScroll + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: targetScroll,
                behavior: "smooth",
            });
        }
    };

    if (!shops || shops.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-3xl p-3 sm:p-6 relative group shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6 px-4">
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                    {categoryName}
                </h3>
                <Link
                    to={`/discover?category=${category}`}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 flex items-center gap-1 transition-colors"
                >
                    View All ({shops.length}) <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="relative group/row">
                {/* Left Button - Positioned to not overlap cards due to container padding */}
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 shadow-xl backdrop-blur-sm flex opacity-100 transition-all duration-300 transform"
                    onClick={() => scroll("left")}
                >
                    <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                </Button>

                <div
                    ref={scrollContainerRef}
                    className="flex gap-3 sm:gap-6 overflow-x-auto pb-4 sm:pb-8 pt-2 scrollbar-hide snap-x snap-mandatory px-2 sm:px-4 md:px-14"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {shops.map((shop: any) => (
                        <div key={shop.id} className="min-w-[170px] w-[170px] sm:min-w-[280px] sm:w-[280px] md:min-w-[320px] md:w-[320px] snap-start shrink-0">
                            <Link to={`/shop/${shop.id}`}>
                                <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900 rounded-2xl group/card">
                                    <div className="relative h-28 sm:h-48 overflow-hidden">
                                        <img
                                            src={shop.image_url || categoryImage}
                                            alt={shop.shop_name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                                        />
                                        {shop.is_open && (
                                            <div className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] sm:text-xs sm:top-3 sm:right-3 sm:px-2.5 sm:py-1 bg-green-500/90 backdrop-blur-md text-white font-bold rounded-lg shadow-sm tracking-wide">
                                                OPEN
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <div className="p-2.5 sm:p-5">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-lg truncate mb-1">
                                            {shop.shop_name}
                                        </h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate mb-3 sm:mb-4">
                                            {shop.address || "Local Shop near you"}
                                        </p>

                                        <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center gap-1 sm:gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                                                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    {shop.rating?.toFixed(1) || "New"}
                                                </span>
                                            </div>

                                            {shop.distance && (
                                                <div className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                                                    {shop.distance.toFixed(1)} km
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Right Button */}
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 shadow-xl backdrop-blur-sm flex opacity-100 transition-all duration-300 transform"
                    onClick={() => scroll("right")}
                >
                    <ChevronRight className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                </Button>
            </div>
        </div>
    );
};
