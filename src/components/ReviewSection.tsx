import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

interface Review {
  id: string;
  user_id: string;
  destination: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-5 h-5 ${interactive ? "cursor-pointer" : ""} ${star <= rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
        onClick={() => interactive && onRate?.(star)}
      />
    ))}
  </div>
);

const ReviewSection = ({ destination }: { destination: string }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [destination]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("destination", destination)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setReviews(data);
      if (user) {
        const existing = data.find((r) => r.user_id === user.id);
        if (existing) setUserReview(existing);
      }
    } else {
      // If no reviews from DB, provide a small set of mock reviews for specific packages (eg: Agumbe)
      if (typeof destination === "string" && destination.toLowerCase().includes("agumbe")) {
        const sampleComments = [
          "Amazing experience — the rainforest walk was magical!",
          "Well organised trip, great food and guides.",
          "Breathtaking sunset views. Highly recommended.",
          "Excellent trek, a bit challenging but worth it.",
          "Loved the waterfalls and the guide's local knowledge.",
          "Accommodation was comfortable and the transport was on time.",
          "A memorable trip with friendly crew and good safety measures.",
          "Good value for money. Would join again.",
          "Kids enjoyed the nature trails and easy walks.",
          "Perfect weekend escape from Bangalore."
        ];
        const sampleNames = [
          'Arjun',
          'Priya',
          'Rohit',
          'Ananya',
          'Kumar',
          'Sneha',
          'Vivek',
          'Deepa',
          'Manjunath',
          'Lakshmi'
        ];

        const mockCount = 5;
        const mockReviews: Review[] = Array.from({ length: mockCount }).map((_, i) => ({
          id: `mock-agumbe-${i + 1}`,
          user_id: `mock-user-${i + 1}`,
          destination,
          rating: 5 - (i % 2),
          comment: sampleComments[i] || null,
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          profiles: { display_name: sampleNames[i] || `Guest ${i + 1}`, avatar_url: null },
        }));
        setReviews(mockReviews);
      } else if (data) {
        setReviews(data);
      }
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      destination,
      rating,
      comment: comment || null,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") toast.error("You've already reviewed this destination");
      else toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted!");
      setComment("");
      fetchReviews();
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-heading font-semibold text-foreground">
          Reviews ({reviews.length})
        </h3>
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(Number(avgRating))} />
          <span className="text-sm font-medium text-foreground">{avgRating}</span>
        </div>
      </div>

      {/* Review Form */}
      {user && !userReview && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h4 className="font-heading font-medium text-foreground">Leave a Review</h4>
          <StarRating rating={rating} onRate={setRating} interactive />
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Review
          </Button>
        </div>
      )}

      {userReview && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-primary font-medium">You've already reviewed this destination</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{review.profiles?.display_name || 'Traveler'}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-muted-foreground py-6">No reviews yet. Be the first to share your experience!</p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
