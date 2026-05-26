import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

const WishlistButton = ({ destination, className, size = "icon" }: { destination: string; className?: string; size?: "icon" | "sm" | "default" }) => {
  const { toggleWishlist, isWishlisted, loading } = useWishlist();
  const wishlisted = isWishlisted(destination);

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        "rounded-full",
        wishlisted ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(destination);
      }}
      disabled={loading}
    >
      <Heart className={cn("w-5 h-5", wishlisted && "fill-current")} />
      {size !== "icon" && <span className="ml-1">{wishlisted ? "Saved" : "Save"}</span>}
    </Button>
  );
};

export default WishlistButton;
