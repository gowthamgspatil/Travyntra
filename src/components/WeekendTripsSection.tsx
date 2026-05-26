import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import destKerala from "@/assets/dest-kerala.jpg";
import destSwitzerland from "@/assets/dest-switzerland.jpg";
import destThailand from "@/assets/dest-thailand.jpg";
import destGreece from "@/assets/dest-greece.jpg";

const trips = [
  { title: "Kerala Backwaters", subtitle: "3 Days • From $499", image: destKerala },
  { title: "Swiss Weekend", subtitle: "2 Days • From $899", image: destSwitzerland },
  { title: "Thailand Escape", subtitle: "3 Days • From $649", image: destThailand },
  { title: "Santorini Bliss", subtitle: "2 Days • From $799", image: destGreece },
];

const WeekendTripsSection = () => {
  return (
    <section id="weekend" className="py-20 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
              Weekend Getaways
            </h2>
            <p className="text-muted-foreground mt-1 font-body">Short trips, big memories</p>
          </div>
          <Button variant="ghost" className="gap-2 text-primary hidden sm:flex" asChild>
            <Link to="/weekend-trips">View All <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trips.map((trip, i) => (
            <motion.div
              key={trip.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer"
            >
              <img
                src={trip.image}
                alt={trip.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
                width={640}
                height={640}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-heading font-bold text-lg text-primary-foreground">{trip.title}</h3>
                <p className="text-primary-foreground/80 text-sm">{trip.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeekendTripsSection;
