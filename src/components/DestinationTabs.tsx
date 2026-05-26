import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, ArrowRight, Flame, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import destIceland from "@/assets/dest-iceland.jpg";
import destJapan from "@/assets/dest-japan.jpg";
import destMaldives from "@/assets/dest-maldives.jpg";
import destSwitzerland from "@/assets/dest-switzerland.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destGreece from "@/assets/dest-greece.jpg";
import destKerala from "@/assets/dest-kerala.jpg";
import destThailand from "@/assets/dest-thailand.jpg";

const destinations = [
  {
    id: "trending",
    label: "Trending",
    icon: <Flame className="w-4 h-4" />,
    tours: [
      { title: "Scenic Iceland with Diamond Circle", image: destIceland, days: "7 days & 6 nights", rating: 4.5, reviews: 40, price: "$3,248", save: "$804" },
      { title: "Cherry Blossom Japan Adventure", image: destJapan, days: "10 days & 9 nights", rating: 4.8, reviews: 112, price: "$4,200", save: "$650" },
      { title: "Maldives Luxury Escape", image: destMaldives, days: "5 days & 4 nights", rating: 5.0, reviews: 614, price: "$3,609", save: "$894" },
    ],
  },
  {
    id: "europe",
    label: "Europe",
    icon: null,
    badge: "Trending",
    tours: [
      { title: "Greek Islands Odyssey", image: destGreece, days: "8 days & 7 nights", rating: 4.7, reviews: 89, price: "$2,950", save: "$500" },
      { title: "Swiss Alps Adventure Trek", image: destSwitzerland, days: "6 days & 5 nights", rating: 4.6, reviews: 67, price: "$3,400", save: "$720" },
      { title: "Scenic Iceland with Diamond Circle", image: destIceland, days: "7 days & 6 nights", rating: 4.5, reviews: 40, price: "$3,248", save: "$804" },
    ],
  },
  {
    id: "asia",
    label: "Asia",
    icon: null,
    tours: [
      { title: "Cherry Blossom Japan Adventure", image: destJapan, days: "10 days & 9 nights", rating: 4.8, reviews: 112, price: "$4,200", save: "$650" },
      { title: "Thailand Beach & Culture Tour", image: destThailand, days: "7 days & 6 nights", rating: 4.6, reviews: 203, price: "$1,890", save: "$340" },
      { title: "Kerala Backwaters Retreat", image: destKerala, days: "5 days & 4 nights", rating: 4.9, reviews: 156, price: "$1,200", save: "$280" },
    ],
  },
  {
    id: "dubai",
    label: "Dubai",
    icon: null,
    tours: [
      { title: "Dubai City & Desert Safari", image: destDubai, days: "5 days & 4 nights", rating: 4.7, reviews: 320, price: "$2,100", save: "$450" },
      { title: "Maldives Luxury Escape", image: destMaldives, days: "5 days & 4 nights", rating: 5.0, reviews: 614, price: "$3,609", save: "$894" },
      { title: "Greek Islands Odyssey", image: destGreece, days: "8 days & 7 nights", rating: 4.7, reviews: 89, price: "$2,950", save: "$500" },
    ],
  },
];

const DestinationTabs = () => {
  const [active, setActive] = useState("trending");
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
              <div
                key={i}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-border"
              >
                <div className="relative h-56 overflow-hidden">
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
              </div>
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
