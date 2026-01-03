import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  wishlistItems: string[];
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  isToggling: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((item) => item.product_id);
    },
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("Must be logged in");

      const isCurrentlyInWishlist = wishlistItems.includes(productId);

      if (isCurrentlyInWishlist) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) throw error;
        return { action: "removed" };
      } else {
        const { error } = await supabase.from("wishlist").insert({
          user_id: user.id,
          product_id: productId,
        });

        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.id] });
      toast({
        title: result.action === "added" ? "Added to Wishlist" : "Removed from Wishlist",
        description: result.action === "added" 
          ? "Product saved to your wishlist" 
          : "Product removed from your wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    },
  });

  const isInWishlist = (productId: string) => wishlistItems.includes(productId);

  const toggleWishlist = (productId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save products to your wishlist",
      });
      return;
    }
    toggleMutation.mutate(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        isInWishlist,
        toggleWishlist,
        isToggling: toggleMutation.isPending,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
