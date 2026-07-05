import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import * as bookingService from "@/services/bookingService";
import { Calendar, MapPin, Users, DollarSign, XCircle, Download, Phone } from "lucide-react";

interface EnhancedBooking {
  id: string;
  batch_id: string;
  status: string;
  travelers_count: number;
  total_amount: number;
  wallet_used: number;
  addons: string[];
  created_at: string;
  batch?: {
    id: string;
    package_id: string;
    departure_date: string;
    return_date: string;
    max_capacity: number;
    current_count: number;
  };
  package?: {
    title: string;
    location: string;
    duration: number;
    price: number;
  };
}

export function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<EnhancedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<EnhancedBooking | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("batch_bookings")
        .select(`
          *,
          batch:batch_id(
            id,
            package_id,
            departure_date,
            return_date,
            max_capacity,
            current_count
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setBookings(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!user || !cancellationReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    try {
      // Get booking details for refund calculation
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;

      // Calculate refund (for demo: full refund minus 10% cancellation fee)
      const refundAmount = booking.total_amount * 0.9;

      // Process refund
      const result = await bookingService.processRefund({
        bookingId,
        userId: user.id,
        stripeChargeId: "dummy_charge_id", // In production, get from payment_receipts
        refundAmount,
        reason: cancellationReason,
      });

      if (result.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
        );

        // Send cancellation email
        await bookingService.sendCancellationEmail({
          bookingId,
          userId: user.id,
          reason: cancellationReason,
          refundAmount,
        });

        alert("Booking cancelled successfully. Refund will be processed within 5-7 days.");
        setCanceling(null);
        setCancellationReason("");
      } else {
        alert("Failed to cancel booking: " + result.error);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("An error occurred while cancelling the booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canCancelBooking = (booking: EnhancedBooking) => {
    return booking.status !== "cancelled" && booking.status !== "completed";
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-gray-600 mt-1">View and manage all your adventure bookings</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">Loading...</div>
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-4">Start your adventure by booking a package</p>
            <Button>Browse Packages</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {booking.package?.title || "Package " + booking.batch_id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {booking.package?.location || "Location"}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(booking.status)} capitalize`}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Booking Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Departure</p>
                    <p className="text-sm font-semibold mt-1">
                      {booking.batch ? new Date(booking.batch.departure_date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Return</p>
                    <p className="text-sm font-semibold mt-1">
                      {booking.batch ? new Date(booking.batch.return_date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Travelers</p>
                    <p className="text-sm font-semibold mt-1 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {booking.travelers_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase">Total Amount</p>
                    <p className="text-sm font-semibold mt-1 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ₹{booking.total_amount}
                    </p>
                  </div>
                </div>

                {/* Add-ons */}
                {booking.addons && booking.addons.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase mb-2">Add-ons</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.addons.map((addon, idx) => (
                        <Badge key={idx} variant="secondary">
                          {addon}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>₹{booking.total_amount}</span>
                  </div>
                  {booking.wallet_used > 0 && (
                    <div className="flex justify-between">
                      <span>Wallet Used:</span>
                      <span className="text-green-600">-₹{booking.wallet_used}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total Paid:</span>
                    <span>₹{booking.total_amount - booking.wallet_used}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {booking.status === "confirmed" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Booking
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Booking</DialogTitle>
                          <DialogDescription>
                            Please provide a reason for cancellation. You'll receive a refund of 90% of your booking amount.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <Textarea
                            placeholder="Why are you cancelling?"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            className="min-h-24"
                          />
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                            <p className="font-semibold mb-1">Refund Policy:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>Full refund minus 10% cancellation fee</li>
                              <li>Processing time: 5-7 business days</li>
                              <li>Refund goes to original payment method</li>
                            </ul>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={!cancellationReason.trim() || canceling === booking.id}
                          >
                            {canceling === booking.id ? "Processing..." : "Confirm Cancellation"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>

                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>

                {/* Booking ID */}
                <p className="text-xs text-gray-500">Booking ID: {booking.id.slice(0, 8)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
