import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wishlists")
      .select("destination")
      .eq("user_id", user.id);
    if (data) setWishlist(data.map((w) => w.destination));
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (destination: string) => {
    if (!user) {
      toast.error("Please sign in to save destinations");
      return;
    }
    setLoading(true);
    const isInWishlist = wishlist.includes(destination);

    if (isInWishlist) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("destination", destination);
      if (!error) {
        setWishlist((prev) => prev.filter((d) => d !== destination));
        toast.success("Removed from wishlist");
      }
    } else {
      const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id, destination });
      if (!error) {
        setWishlist((prev) => [...prev, destination]);
        toast.success("Added to wishlist!");
      }
    }
    setLoading(false);
  };

  const isWishlisted = (destination: string) => wishlist.includes(destination);

  return { wishlist, toggleWishlist, isWishlisted, loading, refetch: fetchWishlist };
};
