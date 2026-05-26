import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Users, Loader2, Plane, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (!error && data) setBookings(data);
    setLoading(false);
  };

  const handleCancel = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .eq("user_id", user!.id);

    if (error) {
      toast.error("Failed to cancel booking");
    } else {
      toast.success("Booking cancelled");
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <Plane className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground font-body">No bookings yet.</p>
        <Link to="/destinations" className="text-primary hover:underline text-sm font-medium">
          Browse destinations →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Link
                to={`/destinations/${booking.destination.toLowerCase()}`}
                className="font-heading font-semibold text-foreground hover:text-primary transition-colors"
              >
                <MapPin className="w-4 h-4 inline mr-1" />
                {booking.destination}
              </Link>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusColors[booking.status] || statusColors.pending}`}
              >
                {booking.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                {format(new Date(booking.travel_date), "MMM d, yyyy")}
                {booking.return_date && ` — ${format(new Date(booking.return_date), "MMM d, yyyy")}`}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {booking.group_size} {booking.group_size === 1 ? "person" : "people"}
              </span>
            </div>
            {booking.message && (
              <p className="text-xs text-muted-foreground/70 line-clamp-1">{booking.message}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-muted-foreground">
              {format(new Date(booking.created_at), "MMM d, yyyy")}
            </span>
            {booking.status === "pending" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 h-7 text-xs"
                onClick={() => handleCancel(booking.id)}
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;
