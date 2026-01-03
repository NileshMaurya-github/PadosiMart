import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "@/components/reviews/StarRating";
import { Loader2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProductReviewsListProps {
  productId: string;
}

type ProductReview = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  customer_id: string;
};

export function ProductReviewsList({ productId }: ProductReviewsListProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("id, rating, title, comment, created_at, customer_id")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProductReview[];
    },
  });

  const averageRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
          <StarRating rating={averageRating} size="sm" />
        </div>
        <div className="text-sm text-muted-foreground">
          Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-border pb-4 last:border-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
                {review.title && (
                  <h4 className="font-medium text-foreground mt-1">{review.title}</h4>
                )}
                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
