import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bali.jpg";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Beautiful tropical landscape"
          className="w-full h-full object-cover"
          width={1920}
          height={960}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-extrabold text-primary-foreground mb-4 leading-tight">
            Welcome to
            <br />
            <span className="text-gradient-primary" style={{ WebkitTextFillColor: "hsl(24 95% 53%)" }}>
              Travyntra
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 font-body">
            Explore unforgettable multi-day tours across the world.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-background/95 backdrop-blur-md rounded-2xl p-2 shadow-card-hover max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <input
                type="text"
                placeholder="Where do you want to go?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent w-full outline-none text-sm text-foreground placeholder:text-muted-foreground font-body"
              />
            </div>
            <Button type="submit" size="lg" className="gap-2 rounded-xl px-8">
              <Search className="w-4 h-4" /> Explore
            </Button>
          </form>

          <div className="mt-6">
            <div className="flex flex-wrap justify-center gap-2">
              {["Kerala", "Goa", "Rajasthan", "Delhi", "Agra", "Udaipur"].map((tag) => (
                <span
                  key={tag}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  className="px-4 py-1.5 rounded-full bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary-foreground/30 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
