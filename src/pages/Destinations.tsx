import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WishlistButton from "@/components/WishlistButton";

import destIceland from "@/assets/dest-iceland.jpg";
import destJapan from "@/assets/dest-japan.jpg";
import destMaldives from "@/assets/dest-maldives.jpg";
import destSwitzerland from "@/assets/dest-switzerland.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destGreece from "@/assets/dest-greece.jpg";
import destKerala from "@/assets/dest-kerala.jpg";
import destThailand from "@/assets/dest-thailand.jpg";

import { MapPin, Star, ArrowRight } from "lucide-react";

const destinations = [
  { name: "Iceland", slug: "iceland", image: destIceland, tours: 12, rating: 4.8, tagline: "Land of Fire and Ice" },
  { name: "Japan", slug: "japan", image: destJapan, tours: 18, rating: 4.9, tagline: "Where Tradition Meets Future" },
  { name: "Maldives", slug: "maldives", image: destMaldives, tours: 8, rating: 5.0, tagline: "Paradise on Earth" },
  { name: "Switzerland", slug: "switzerland", image: destSwitzerland, tours: 15, rating: 4.7, tagline: "Alpine Wonderland" },
  { name: "Dubai", slug: "dubai", image: destDubai, tours: 10, rating: 4.6, tagline: "City of the Future" },
  { name: "Greece", slug: "greece", image: destGreece, tours: 14, rating: 4.8, tagline: "Cradle of Civilization" },
  { name: "Kerala", slug: "kerala", image: destKerala, tours: 20, rating: 4.9, tagline: "God's Own Country" },
  { name: "Thailand", slug: "thailand", image: destThailand, tours: 22, rating: 4.7, tagline: "Land of Smiles" },
];

const DestinationsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-3">Explore Destinations</h1>
            <p className="text-muted-foreground text-lg font-body max-w-xl mx-auto">Discover breathtaking places around the world</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destinations.map((dest, i) => (
              <Link to={`/destinations/${dest.slug}`} key={dest.name}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
              >
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" width={640} height={640} />
                <div className="absolute top-3 right-3 z-10">
                  <WishlistButton destination={dest.name} className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-primary-foreground text-sm font-medium">{dest.rating}</span>
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-primary-foreground">{dest.name}</h3>
                  <p className="text-primary-foreground/70 text-sm mb-2">{dest.tagline}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-foreground/60 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {dest.tours} tours available
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default DestinationsPage;
