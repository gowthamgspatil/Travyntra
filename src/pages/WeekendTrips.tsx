import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, MapPin, Star, CalendarIcon, Send, ArrowRight, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import destKerala from "@/assets/dest-kerala.jpg";
import destSwitzerland from "@/assets/dest-switzerland.jpg";
import destThailand from "@/assets/dest-thailand.jpg";
import destGreece from "@/assets/dest-greece.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destJapan from "@/assets/dest-japan.jpg";
const gokarnaImage = "https://s7ap1.scene7.com/is/image/incredibleindia/om-beach-gokarna-karnataka-tri-hero?qlt=82&ts=1727164538227";

const weekendTrips = [
  {
    slug: "coorg-the-scotland-of-india",
    destination: "Madikeri",
    title: "Coorg - The Scotland of India",
    image: destKerala,
    duration: "2 Days 1 Night",
    price: 3999,
    rating: 4.7,
    groupSize: "2–8",
    tagline: "Madikeri",
    highlights: ["Coffee estate visit", "Waterfalls", "Local cuisine"],
  },
  {
    slug: "chikmagalur-greater-heights",
    destination: "Chikkamagaluru",
    title: "Explore Chikmagalur - Visit the Greater heights",
    image: destKerala,
    duration: "2 Days 1 Night",
    price: 3999,
    rating: 4.6,
    groupSize: "2–8",
    tagline: "Experience the soothing landscapes",
    highlights: ["Coffee plantation", "Trekking", "Local homestays"],
  },
  {
    slug: "pondicherry-french-indian-bliss",
    destination: "Puducherry",
    title: "Pondicherry - Your Gateway to French-Indian Bliss",
    image: destGreece,
    duration: "2 Days 1 Night",
    price: 4599,
    rating: 4.5,
    groupSize: "2–6",
    tagline: "Puducherry",
    highlights: ["Promenade", "Auroville visit", "French cuisine"],
  },
  {
    slug: "rameshwaram-dhanushkodi",
    destination: "Rameswaram",
    title: "Rameshwaram & Dhanushkodi: To the Edge of India",
    image: destDubai,
    duration: "2 Days 1 Night",
    price: 5499,
    rating: 4.6,
    groupSize: "2–8",
    tagline: "Rameshwaram",
    highlights: ["Dhanushkodi", "Ramanathaswamy Temple", "Sea views"],
  },
  {
    slug: "wayanad-green-paradise",
    destination: "Wayanad",
    title: "Wayanad - The green paradise",
    image: destKerala,
    duration: "2 Days 1 Night",
    price: 4599,
    rating: 4.7,
    groupSize: "2–8",
    tagline: "Wayanad",
    highlights: ["Wildlife", "Tea estates", "Trails"],
  },
  {
    slug: "valparai-untouched-heaven",
    destination: "Valparai",
    title: "Valparai - The untouched Heaven",
    image: destKerala,
    duration: "2 Days 1 Night",
    price: 5499,
    rating: 4.6,
    groupSize: "2–8",
    tagline: "Valparai",
    highlights: ["Tea gardens", "Waterfalls", "Birdwatching"],
  },
  {
    slug: "kodaikanal-princess-of-hills",
    destination: "Kodaikanal",
    title: "Kodaikanal - The princess of hills",
    image: destKerala,
    duration: "2 Days 1 Night",
    price: 5499,
    rating: 4.6,
    groupSize: "2–8",
    tagline: "Kodaikanal",
    highlights: ["Lake boating", "Pine forests", "Viewpoints"],
  },
  {
    slug: "munnar-into-the-mist",
    destination: "Munnar",
    title: "Munnar : Into the Mist",
    image: destKerala,
    duration: "2 Days 1 Night",
    price: 5999,
    rating: 4.8,
    groupSize: "2–8",
    tagline: "Munnar",
    highlights: ["Tea gardens", "Misty hills", "Scenic views"],
  },
  {
    slug: "ooty-coonoor",
    destination: "Ooty",
    title: "Ooty-Coonoor : Explore Misty Hills & Blissfull Weather",
    image: destKerala,
    duration: "2 Days 1 Night",
    price: 5399,
    rating: 4.6,
    groupSize: "2–8",
    tagline: "Ooty",
    highlights: ["Toy train", "Botanical gardens", "Tea estates"],
  },
  {
    slug: "gokarna-7-in-1",
    destination: "Gokarna",
    title: "Gokarna - Honnavar, Murdeshwar - 7 In 1",
    image: gokarnaImage,
    duration: "2 Days 1 Night",
    price: 3199,
    rating: 4.4,
    groupSize: "2–10",
    tagline: "Gokarna",
    highlights: ["Beach hop", "Temple visits", "Water sports"],
  },
  {
    slug: "varkala-kochi-alleppey-backwater",
    destination: "Varkala",
    title: "Varkala, Kochi-Alleppey with Backwater Boating & Cruise",
    image: destKerala,
    duration: "3 Days 2 Night",
    price: 9999,
    rating: 4.8,
    groupSize: "2–8",
    tagline: "Varkala",
    highlights: ["Backwater cruise", "Houseboat", "Beaches"],
  },
];

const QuickBookModal = ({
  trip,
  onClose,
}: {
  trip: (typeof weekendTrips)[0];
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [travelDate, setTravelDate] = useState<Date>();
  const [groupSize, setGroupSize] = useState("2");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to book");
      navigate("/login");
      return;
    }
    if (!travelDate) {
      toast.error("Please select a date");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      destination: `${trip.title} (Weekend)`,
      travel_date: format(travelDate, "yyyy-MM-dd"),
      group_size: parseInt(groupSize) || 2,
      message: `Weekend trip: ${trip.title}`,
    });
    setLoading(false);
    if (error) {
      toast.error("Booking failed. Please try again.");
    } else {
      setDone(true);
      toast.success("Weekend trip booked!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-border shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-heading font-bold text-foreground mb-1">{trip.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{trip.duration} • From ₹{trip.price}</p>

        {done ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-3xl">🎉</div>
            <p className="font-heading font-semibold text-foreground">You're all set!</p>
            <p className="text-sm text-muted-foreground">We'll confirm your weekend trip within 24 hours.</p>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Calendar mode="single" selected={travelDate} onSelect={setTravelDate} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wkGroupSize">Group Size</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="wkGroupSize" type="number" min="1" max="10" value={groupSize} onChange={(e) => setGroupSize(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                {loading ? "Booking..." : <><Send className="w-4 h-4" /> Book Now</>}
              </Button>
            </div>
            {!user && (
              <p className="text-xs text-muted-foreground text-center">
                <Link to="/login" className="text-primary hover:underline">Sign in</Link> to book.
              </p>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
};

const WeekendTrips = () => {
  const [selectedTrip, setSelectedTrip] = useState<(typeof weekendTrips)[0] | null>(null);
  const [sortBy, setSortBy] = useState("default");
  const [filterDestination, setFilterDestination] = useState("all");

  const destinations = [...new Set(weekendTrips.map((t) => t.destination))];

  const filteredTrips = useMemo(() => {
    let trips = [...weekendTrips];
    if (filterDestination !== "all") {
      trips = trips.filter((t) => t.destination === filterDestination);
    }
    switch (sortBy) {
      case "price-asc": trips.sort((a, b) => a.price - b.price); break;
      case "price-desc": trips.sort((a, b) => b.price - a.price); break;
      case "rating": trips.sort((a, b) => b.rating - a.rating); break;
      case "duration": trips.sort((a, b) => a.duration.localeCompare(b.duration)); break;
    }
    return trips;
  }, [sortBy, filterDestination]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-4">
              Weekend Getaways
            </h1>
            <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
              Short on time, big on adventure. Discover handpicked 2–3 day trips that pack unforgettable experiences into a long weekend.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="container pt-10 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <Select value={filterDestination} onValueChange={setFilterDestination}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Destinations</SelectItem>
              {destinations.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
          {(filterDestination !== "all" || sortBy !== "default") && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterDestination("all"); setSortBy("default"); }}>
              Clear
            </Button>
          )}
          <span className="text-sm text-muted-foreground ml-auto">{filteredTrips.length} trip{filteredTrips.length !== 1 ? "s" : ""}</span>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="container py-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip, i) => (
            <motion.div
              key={trip.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-sm font-medium">
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  {trip.rating}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-foreground text-lg">{trip.title}</h3>
                  <p className="text-sm text-muted-foreground font-body">{trip.tagline}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{trip.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{trip.groupSize}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{trip.destination}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {trip.highlights.map((h) => (
                    <span key={h} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{h}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-heading font-bold text-foreground">From ₹{trip.price}</span>
                  <Button size="sm" className="gap-1" onClick={() => setSelectedTrip(trip)}>
                    Book Now <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
            Looking for something longer?
          </h2>
          <p className="text-muted-foreground font-body mb-6 max-w-lg mx-auto">
            Explore our full destination catalog for week-long adventures and custom itineraries.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link to="/destinations">Browse All Destinations <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </section>

      {selectedTrip && <QuickBookModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />}

      <Footer />
    </div>
  );
};

export default WeekendTrips;
