import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MapPin, Star, Clock, Users, ArrowLeft, CalendarIcon, Send, CheckCircle, CreditCard, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewSection from "@/components/ReviewSection";
import WishlistButton from "@/components/WishlistButton";

import destIceland from "@/assets/dest-iceland.jpg";
import destJapan from "@/assets/dest-japan.jpg";
import destMaldives from "@/assets/dest-maldives.jpg";
import destSwitzerland from "@/assets/dest-switzerland.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destGreece from "@/assets/dest-greece.jpg";
import destKerala from "@/assets/dest-kerala.jpg";
import destThailand from "@/assets/dest-thailand.jpg";

const destinationData: Record<string, {
  name: string; image: string; rating: number; tours: number; tagline: string;
  description: string; highlights: string[]; duration: string; price: string;
}> = {
  iceland: {
    name: "Iceland", image: destIceland, rating: 4.8, tours: 12, tagline: "Land of Fire and Ice",
    description: "Experience the raw beauty of Iceland — from erupting geysers and cascading waterfalls to the mesmerizing Northern Lights dancing across Arctic skies. Trek across glaciers, soak in natural hot springs, and explore volcanic landscapes unlike anywhere else on Earth.",
    highlights: ["Northern Lights viewing", "Golden Circle tour", "Blue Lagoon", "Glacier hiking", "Whale watching"],
    duration: "5–10 days", price: "From $1,299",
  },
  japan: {
    name: "Japan", image: destJapan, rating: 4.9, tours: 18, tagline: "Where Tradition Meets Future",
    description: "Discover the harmony of ancient temples and neon-lit streets. From the serene bamboo groves of Kyoto to the electrifying energy of Tokyo, Japan offers a journey through centuries of culture, cuisine, and innovation.",
    highlights: ["Cherry blossom season", "Mount Fuji trek", "Kyoto temples", "Tokyo street food", "Bullet train experience"],
    duration: "7–14 days", price: "From $1,499",
  },
  maldives: {
    name: "Maldives", image: destMaldives, rating: 5.0, tours: 8, tagline: "Paradise on Earth",
    description: "Escape to crystal-clear turquoise waters and pristine white-sand beaches. The Maldives is the ultimate tropical paradise for honeymooners, divers, and anyone seeking pure relaxation surrounded by breathtaking natural beauty.",
    highlights: ["Overwater villa stay", "Snorkeling with mantas", "Sunset dolphin cruise", "Private island dining", "Coral reef diving"],
    duration: "5–7 days", price: "From $2,199",
  },
  switzerland: {
    name: "Switzerland", image: destSwitzerland, rating: 4.7, tours: 15, tagline: "Alpine Wonderland",
    description: "Journey through the Swiss Alps where snow-capped peaks meet emerald valleys. Ride scenic trains through mountain passes, explore charming villages, and indulge in world-class chocolate and cheese.",
    highlights: ["Jungfrau railway", "Lake Geneva cruise", "Zermatt & Matterhorn", "Swiss chocolate tour", "Interlaken adventures"],
    duration: "6–12 days", price: "From $1,799",
  },
  dubai: {
    name: "Dubai", image: destDubai, rating: 4.6, tours: 10, tagline: "City of the Future",
    description: "Experience the extraordinary in Dubai — a city where futuristic skyscrapers meet golden desert dunes. From the world's tallest building to luxury shopping and thrilling desert safaris, Dubai redefines what's possible.",
    highlights: ["Burj Khalifa visit", "Desert safari", "Dubai Mall & Aquarium", "Palm Jumeirah", "Dhow dinner cruise"],
    duration: "4–7 days", price: "From $999",
  },
  greece: {
    name: "Greece", image: destGreece, rating: 4.8, tours: 14, tagline: "Cradle of Civilization",
    description: "Walk in the footsteps of ancient gods among whitewashed villages and sun-drenched islands. Greece offers a perfect blend of rich history, stunning coastlines, and Mediterranean cuisine that captivates every traveler.",
    highlights: ["Santorini sunsets", "Athens Acropolis", "Mykonos nightlife", "Meteora monasteries", "Island hopping"],
    duration: "7–14 days", price: "From $1,199",
  },
  kerala: {
    name: "Kerala", image: destKerala, rating: 4.9, tours: 20, tagline: "God's Own Country",
    description: "Glide through tranquil backwaters, explore lush tea plantations, and rejuvenate with Ayurvedic treatments. Kerala offers an enchanting blend of tropical landscapes, rich culture, and warm hospitality.",
    highlights: ["Houseboat cruise", "Munnar tea gardens", "Ayurvedic spa", "Periyar wildlife sanctuary", "Kathakali dance show"],
    duration: "5–10 days", price: "From $799",
  },
  thailand: {
    name: "Thailand", image: destThailand, rating: 4.7, tours: 22, tagline: "Land of Smiles",
    description: "From bustling Bangkok markets to serene island beaches, Thailand enchants with its vibrant street food scene, ornate temples, and legendary warm hospitality that keeps travelers coming back.",
    highlights: ["Bangkok temples", "Phi Phi Islands", "Chiang Mai night market", "Thai cooking class", "Elephant sanctuary"],
    duration: "7–14 days", price: "From $899",
  },
};

const DestinationDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [travelDate, setTravelDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [groupSize, setGroupSize] = useState("2");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dest = slug ? destinationData[slug] : undefined;

  if (!dest) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Destination Not Found</h1>
          <p className="text-muted-foreground mb-6">The destination you're looking for doesn't exist.</p>
          <Button asChild><Link to="/destinations">Browse Destinations</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to book a trip");
      navigate("/login");
      return;
    }
    if (!travelDate) {
      toast.error("Please select a travel date");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      destination: dest.name,
      travel_date: format(travelDate, "yyyy-MM-dd"),
      return_date: returnDate ? format(returnDate, "yyyy-MM-dd") : null,
      group_size: parseInt(groupSize) || 1,
      message: message || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to submit booking. Please try again.");
    } else {
      setSubmitted(true);
      toast.success("Booking inquiry submitted!");
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please sign in to pay for a trip");
      navigate("/login");
      return;
    }
    setPaymentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { destination: slug },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("Failed to start payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative h-[50vh] sm:h-[60vh]">
        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
          <div className="container">
            <Link to="/destinations" className="inline-flex items-center gap-1 text-primary-foreground/70 hover:text-primary-foreground text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Destinations
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <span className="text-primary-foreground font-medium">{dest.rating}</span>
              <span className="text-primary-foreground/60 text-sm">• {dest.tours} tours available</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-heading font-bold text-primary-foreground mb-2">{dest.name}</h1>
            <p className="text-xl text-primary-foreground/80 font-body">{dest.tagline}</p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">About {dest.name}</h2>
              <p className="text-muted-foreground leading-relaxed font-body">{dest.description}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-4">Trip Highlights</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {dest.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-card-foreground font-body">{h}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-body">{dest.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-body">{dest.tours} tours</span>
              </div>
              <div className="flex items-center gap-2 font-heading font-bold text-foreground text-lg">
                {dest.price}
              </div>
              <WishlistButton destination={dest.name} size="sm" />
            </motion.div>

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ReviewSection destination={dest.name} />
            </motion.div>
          </div>

          {/* Booking sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div className="bg-card rounded-2xl border border-border shadow-card p-6 sticky top-24">
              <h3 className="text-lg font-heading font-bold text-foreground mb-1">Book This Trip</h3>
              <p className="text-sm text-muted-foreground mb-5">Submit an inquiry and we'll get back to you within 24 hours.</p>

              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="font-heading font-semibold text-foreground">Inquiry Sent!</h4>
                  <p className="text-sm text-muted-foreground">We'll contact you shortly with trip details and pricing.</p>
                  <Button variant="outline" className="mt-2" onClick={() => setSubmitted(false)}>Book Another Trip</Button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  {/* Travel Date */}
                  <div className="space-y-1.5">
                    <Label>Travel Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !travelDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {travelDate ? format(travelDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={travelDate} onSelect={setTravelDate} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Return Date */}
                  <div className="space-y-1.5">
                    <Label>Return Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !returnDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {returnDate ? format(returnDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} disabled={(date) => date < (travelDate || new Date())} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Group Size */}
                  <div className="space-y-1.5">
                    <Label htmlFor="groupSize">Group Size</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="groupSize" type="number" min="1" max="50" value={groupSize} onChange={(e) => setGroupSize(e.target.value)} className="pl-10" />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label htmlFor="message">Special Requests</Label>
                    <Textarea id="message" placeholder="Any preferences or questions..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                      {loading ? "Submitting..." : <><Send className="w-4 h-4" /> Send Inquiry</>}
                    </Button>
                    <Button type="button" variant="outline" className="w-full gap-2" size="lg" disabled={paymentLoading} onClick={handlePayment}>
                      {paymentLoading ? "Redirecting..." : <><CreditCard className="w-4 h-4" /> Pay Now — {dest.price}</>}
                    </Button>
                  </div>

                  {!user && (
                    <p className="text-xs text-muted-foreground text-center">
                      You'll need to <Link to="/login" className="text-primary hover:underline">sign in</Link> to book or pay.
                    </p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DestinationDetail;
