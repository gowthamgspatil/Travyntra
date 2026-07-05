import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, ArrowRight, Flame, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import destKerala from "@/assets/dest-kerala.jpg";

const destinations = [
  {
    id: "kerala",
    label: "Kerala",
    icon: <Flame className="w-4 h-4" />,
    tours: [
      { id: "kerala-1", title: "Kerala Backwaters Retreat", image: destKerala, days: "5 days & 4 nights", rating: 4.9, reviews: 156, price: "₹45,000", save: "₹5,000" },
      { id: "kerala-2", title: "Munnar Hill Station Getaway", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800", days: "4 days & 3 nights", rating: 4.8, reviews: 92, price: "₹35,000", save: "₹4,500" },
      { id: "kerala-3", title: "Wayanad Nature Trail", image: "https://images.unsplash.com/photo-1593693397690-362cb9666d6c?q=80&w=800", days: "6 days & 5 nights", rating: 4.7, reviews: 120, price: "₹42,000", save: "₹6,000" },
    ],
  },
  {
    id: "rajasthan",
    label: "Rajasthan",
    icon: null,
    badge: "Trending",
    tours: [
      { id: "raj-1", title: "Royal Jaipur Experience", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800", days: "6 days & 5 nights", rating: 4.8, reviews: 210, price: "₹55,000", save: "₹8,000" },
      { id: "raj-2", title: "Udaipur Lakes & Palaces", image: "https://images.unsplash.com/photo-1615836245337-f8e28cf69a1b?q=80&w=800", days: "5 days & 4 nights", rating: 4.7, reviews: 184, price: "₹48,000", save: "₹5,500" },
      { id: "raj-3", title: "Jaisalmer Desert Safari", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800", days: "4 days & 3 nights", rating: 4.9, reviews: 95, price: "₹38,000", save: "₹4,000" },
    ],
  },
  {
    id: "goa",
    label: "Goa",
    icon: null,
    tours: [
      { id: "goa-1", title: "North Goa Beach Hop", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800", days: "5 days & 4 nights", rating: 4.6, reviews: 320, price: "₹30,000", save: "₹3,500" },
      { id: "goa-2", title: "South Goa Luxury Resorts", image: "https://images.unsplash.com/photo-1587922546307-776227941871?q=80&w=800", days: "7 days & 6 nights", rating: 4.9, reviews: 145, price: "₹75,000", save: "₹10,000" },
      { id: "goa-3", title: "Goan Culture & Heritage", image: "https://images.unsplash.com/photo-1560179406-1c6ca80efadc?q=80&w=800", days: "4 days & 3 nights", rating: 4.7, reviews: 88, price: "₹28,000", save: "₹3,000" },
    ],
  },
  {
    id: "himachal",
    label: "Himachal",
    icon: null,
    tours: [
      { id: "him-1", title: "Manali Snow Adventure", image: "https://images.unsplash.com/photo-1605649487212-4dcb1b6b1833?q=80&w=800", days: "6 days & 5 nights", rating: 4.8, reviews: 260, price: "₹45,000", save: "₹6,000" },
      { id: "him-2", title: "Shimla Valley Escape", image: "https://images.unsplash.com/photo-1596894002674-0cd3422c5e53?q=80&w=800", days: "5 days & 4 nights", rating: 4.6, reviews: 198, price: "₹38,000", save: "₹4,500" },
      { id: "him-3", title: "Spiti Valley Road Trip", image: "https://images.unsplash.com/photo-1618774797053-5353d26f6341?q=80&w=800", days: "8 days & 7 nights", rating: 4.9, reviews: 112, price: "₹65,000", save: "₹9,000" },
    ],
  },
];

const DestinationTabs = () => {
  const [active, setActive] = useState("kerala");
  const activeDest = destinations.find((d) => d.id === active)!;

  return (
    <section id="destinations" className="py-20 bg-background">
      <div className="container">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-2">
          Popular Destinations
        </h2>
        <p className="text-muted-foreground text-center mb-10 font-body">
          Handpicked tours loved by thousands of travelers
        </p>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {destinations.map((d) => (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                active === d.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {d.icon}
              {d.label}
              {d.badge && (
                <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-semibold">
                  {d.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeDest.tours.map((tour, i) => (
              <Link
                key={i}
                to={`/packages/${tour.id}`}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-border block text-left"
              >
                <div className="relative h-56 overflow-hidden bg-muted">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={640}
                    height={640}
                  />
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-sm font-semibold">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    {tour.rating}
                    <span className="text-muted-foreground font-normal">({tour.reviews})</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    {tour.days}
                  </div>
                  <h3 className="font-heading font-semibold text-card-foreground text-lg mb-3 line-clamp-2">
                    {tour.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-foreground">{tour.price}</span>
                      <span className="ml-2 text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                        SAVE {tour.save}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" className="gap-2 rounded-full">
            View All Destinations <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DestinationTabs;
