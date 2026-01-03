import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { Loader2 } from "lucide-react";

interface ReviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  sellerId: string;
  sellerName: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  };
}

export function ReviewFormDialog({
  open,
  onOpenChange,
  orderId,
  sellerId,
  sellerName,
  existingReview,
}: ReviewFormDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in");
      if (rating === 0) throw new Error("Please select a rating");

      if (existingReview) {
        const { error } = await supabase
          .from("reviews")
          .update({
            rating,
            comment: comment.trim() || null,
          })
          .eq("id", existingReview.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("reviews").insert({
          order_id: orderId,
          seller_id: sellerId,
          customer_id: user.id,
          rating,
          comment: comment.trim() || null,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(existingReview ? "Review updated!" : "Review submitted!");
      queryClient.invalidateQueries({ queryKey: ["order-review"] });
      queryClient.invalidateQueries({ queryKey: ["shop-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Edit Your Review" : "Rate Your Experience"}
          </DialogTitle>
          <DialogDescription>
            How was your experience with {sellerName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex justify-center py-2">
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => submitReview()} disabled={isPending || rating === 0}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {existingReview ? "Update Review" : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
