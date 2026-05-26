import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MapPin, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/use-wishlist";
import WishlistButton from "@/components/WishlistButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import destIceland from "@/assets/dest-iceland.jpg";
import destJapan from "@/assets/dest-japan.jpg";
import destMaldives from "@/assets/dest-maldives.jpg";
import destSwitzerland from "@/assets/dest-switzerland.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destGreece from "@/assets/dest-greece.jpg";
import destKerala from "@/assets/dest-kerala.jpg";
import destThailand from "@/assets/dest-thailand.jpg";

const imageMap: Record<string, string> = {
  Iceland: destIceland, Japan: destJapan, Maldives: destMaldives,
  Switzerland: destSwitzerland, Dubai: destDubai, Greece: destGreece,
  Kerala: destKerala, Thailand: destThailand,
};

const slugMap: Record<string, string> = {
  Iceland: "iceland", Japan: "japan", Maldives: "maldives",
  Switzerland: "switzerland", Dubai: "dubai", Greece: "greece",
  Kerala: "kerala", Thailand: "thailand",
};

const WishlistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-3">
              <Heart className="w-8 h-8 inline mr-2 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground text-lg font-body">Destinations you've saved for later</p>
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground">No saved destinations yet.</p>
              <Link to="/destinations" className="text-primary hover:underline text-sm font-medium">
                Browse destinations →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((dest, i) => (
                <Link to={`/destinations/${slugMap[dest] || dest.toLowerCase()}`} key={dest}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer"
                  >
                    <img src={imageMap[dest]} alt={dest} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute top-3 right-3 z-10">
                      <WishlistButton destination={dest} className="bg-background/80 backdrop-blur-sm hover:bg-background" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-heading font-bold text-2xl text-primary-foreground">{dest}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-primary-foreground/60 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Explore
                        </span>
                        <ArrowRight className="w-4 h-4 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default WishlistPage;
