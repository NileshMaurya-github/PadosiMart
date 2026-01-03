import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Store, Package, MapPin, X, Loader2, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category: string | null;
    seller_id: string;
    seller: {
        id: string;
        shop_name: string;
        address: string;
        is_open: boolean | null;
    };
}

interface SmartSearchProps {
    className?: string;
}

export function SmartSearch({ className }: SmartSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("recentSearches");
        if (saved) {
            setRecentSearches(JSON.parse(saved).slice(0, 5));
        }
    }, []);

    // Save search to recent
    const saveRecentSearch = (term: string) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select(`
            id,
            name,
            price,
            image_url,
            category,
            seller_id,
            seller:sellers!products_seller_id_fkey (
              id,
              shop_name,
              address,
              is_open
            )
          `)
                    .ilike("name", `%${query}%`)
                    .eq("is_available", true)
                    .limit(10);

                if (error) throw error;

                // Transform and deduplicate results
                const transformed = (data || []).map((item: any) => ({
                    ...item,
                    seller: item.seller || { id: item.seller_id, shop_name: "Unknown Shop", address: "", is_open: false }
                }));

                setResults(transformed);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResultClick = (result: SearchResult) => {
        saveRecentSearch(result.name);
        setIsOpen(false);
        setQuery("");
        // Navigate to shop with product highlighted
        navigate(`/shop/${result.seller_id}?highlight=${result.id}`);
    };

    const handleRecentClick = (term: string) => {
        setQuery(term);
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            saveRecentSearch(query.trim());
            setIsOpen(false);
            navigate(`/discover?search=${encodeURIComponent(query.trim())}`);
        }
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        inputRef.current?.focus();
    };

    // Group results by store
    const groupedResults = results.reduce((acc, result) => {
        const shopId = result.seller.id;
        if (!acc[shopId]) {
            acc[shopId] = {
                shop: result.seller,
                products: []
            };
        }
        acc[shopId].products.push(result);
        return acc;
    }, {} as Record<string, { shop: SearchResult["seller"]; products: SearchResult[] }>);

    return (
        <div className={`relative ${className}`}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Search products, groceries..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        className="pl-9 pr-8 h-9 text-sm rounded-full border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-colors w-full"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </form>

            {/* Dropdown */}
            {isOpen && (query.length >= 2 || recentSearches.length > 0) && (
                <div
                    ref={dropdownRef}
                    className="fixed top-[62px] left-4 right-4 sm:absolute sm:top-full sm:left-0 sm:right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[60] max-h-[60vh] sm:max-h-[70vh] overflow-y-auto"
                >
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                            <span className="ml-2 text-gray-500">Searching...</span>
                        </div>
                    )}

                    {/* No Results */}
                    {!isLoading && query.length >= 2 && results.length === 0 && (
                        <div className="p-6 text-center">
                            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No products found for "{query}"</p>
                            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                        </div>
                    )}

                    {/* Recent Searches - show when no query */}
                    {!isLoading && query.length < 2 && recentSearches.length > 0 && (
                        <div className="p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                Recent Searches
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((term, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleRecentClick(term)}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results grouped by store */}
                    {!isLoading && Object.keys(groupedResults).length > 0 && (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {Object.entries(groupedResults).map(([shopId, { shop, products }]) => (
                                <div key={shopId} className="p-4">
                                    {/* Store Header */}
                                    <Link
                                        to={`/shop/${shopId}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 mb-3 group"
                                    >
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 flex items-center justify-center">
                                            <Store className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors truncate">
                                                {shop.shop_name}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                                <MapPin className="w-3 h-3" />
                                                {shop.address}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${shop.is_open
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            {shop.is_open ? 'Open' : 'Closed'}
                                        </span>
                                    </Link>

                                    {/* Products in this store */}
                                    <div className="space-y-2 ml-13">
                                        {products.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleResultClick(product)}
                                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                                            >
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg object-cover bg-gray-100"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-orange-500 font-semibold">
                                                        ₹{product.price}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full capitalize">
                                                    {product.category}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View All Results - Footer */}
                    {query.length >= 2 && results.length > 0 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <button
                                onClick={handleSubmit}
                                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                            >
                                View all results for "{query}"
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
