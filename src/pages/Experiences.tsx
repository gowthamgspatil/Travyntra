import { motion } from "framer-motion";
import { Compass, Mountain, Palmtree, Ship, Camera, Tent, Bike, Waves, TreePine, Plane, Utensils, Music } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const allExperiences = [
  { icon: <Mountain className="w-8 h-8" />, title: "Trekking & Hiking", count: "120+ Tours", desc: "Summit the world's most iconic peaks and trails" },
  { icon: <Palmtree className="w-8 h-8" />, title: "Beach Holidays", count: "85+ Tours", desc: "Crystal waters, white sand, and tropical vibes" },
  { icon: <Ship className="w-8 h-8" />, title: "Cruises", count: "45+ Tours", desc: "Sail the seas in style and luxury" },
  { icon: <Camera className="w-8 h-8" />, title: "Photography Tours", count: "30+ Tours", desc: "Capture breathtaking moments with expert guidance" },
  { icon: <Tent className="w-8 h-8" />, title: "Camping", count: "60+ Tours", desc: "Under the stars, close to nature" },
  { icon: <Compass className="w-8 h-8" />, title: "Adventure Sports", count: "90+ Tours", desc: "Adrenaline-pumping activities worldwide" },
  { icon: <Bike className="w-8 h-8" />, title: "Cycling Tours", count: "40+ Tours", desc: "Explore scenic routes on two wheels" },
  { icon: <Waves className="w-8 h-8" />, title: "Water Sports", count: "75+ Tours", desc: "Diving, surfing, kayaking and more" },
  { icon: <TreePine className="w-8 h-8" />, title: "Wildlife Safari", count: "55+ Tours", desc: "Get close to nature's majestic creatures" },
  { icon: <Plane className="w-8 h-8" />, title: "Skydiving", count: "15+ Tours", desc: "The ultimate freefall experience" },
  { icon: <Utensils className="w-8 h-8" />, title: "Food Tours", count: "65+ Tours", desc: "Taste local flavors and culinary traditions" },
  { icon: <Music className="w-8 h-8" />, title: "Cultural Tours", count: "80+ Tours", desc: "Immerse in local art, music, and heritage" },
];

const ExperiencesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-3">All Experiences</h1>
            <p className="text-muted-foreground text-lg font-body max-w-xl mx-auto">Find the perfect adventure that matches your travel style</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {allExperiences.map((exp, i) => (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col items-center gap-4 p-8 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  {exp.icon}
                </div>
                <h3 className="font-heading font-semibold text-card-foreground">{exp.title}</h3>
                <p className="text-sm text-muted-foreground">{exp.desc}</p>
                <span className="text-xs font-semibold text-primary">{exp.count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ExperiencesPage;
