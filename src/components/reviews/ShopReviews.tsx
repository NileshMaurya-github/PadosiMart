import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "./StarRating";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    signed_avatar_url?: string | null;
  } | null;
}

interface ShopReviewsProps {
  sellerId: string;
}

export function ShopReviews({ sellerId }: ShopReviewsProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["shop-reviews", sellerId],
    queryFn: async () => {
      // First fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, customer_id")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (reviewsError) throw reviewsError;

      // Then fetch profiles for those customers
      const customerIds = reviewsData.map((r) => r.customer_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", customerIds);

      // Generate signed URLs for avatars
      const profilesWithSignedUrls = await Promise.all(
        (profiles || []).map(async (profile) => {
          if (profile.avatar_url) {
            // Extract file path from stored URL or use directly if it's a path
            const filePath = profile.avatar_url.includes('/storage/v1/object/')
              ? profile.avatar_url.split('/avatars/')[1]
              : profile.avatar_url;
            
            if (filePath) {
              const { data } = await supabase.storage
                .from("avatars")
                .createSignedUrl(filePath, 3600);
              
              return {
                ...profile,
                signed_avatar_url: data?.signedUrl || null
              };
            }
          }
          return { ...profile, signed_avatar_url: null };
        })
      );

      // Merge profiles with reviews
      return reviewsData.map((review) => ({
        ...review,
        profile: profilesWithSignedUrls?.find((p) => p.user_id === review.customer_id) || null,
      })) as Review[];
    },
    enabled: !!sellerId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={review.profile?.signed_avatar_url || undefined} />
                <AvatarFallback>
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-medium truncate">
                    {review.profile?.full_name || "Anonymous"}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <StarRating rating={review.rating} size="sm" />
                {review.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
