import { motion } from "framer-motion";
import { Compass, Mountain, Palmtree, Ship, Camera, Tent } from "lucide-react";
import { useNavigate } from "react-router-dom";

const experiences = [
  { icon: <Mountain className="w-7 h-7" />, title: "Trekking", count: "20+ Places", category: "trekking" },
  { icon: <Palmtree className="w-7 h-7" />, title: "Beach Holidays", count: "10+ Tours", category: "beach" },
  { icon: <Ship className="w-7 h-7" />, title: "Cruises", count: "45+ Tours", category: "cruise" },
  { icon: <Camera className="w-7 h-7" />, title: "Photography Tours", count: "30+ Tours", category: "photography" },
  { icon: <Tent className="w-7 h-7" />, title: "Camping", count: "60+ Tours", category: "camping" },
  { icon: <Compass className="w-7 h-7" />, title: "Adventure Sports", count: "90+ Tours", category: "adventure" },
];

const ExperiencesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="experiences" className="py-20 bg-secondary">
      <div className="container">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-2">
          Explore by Experience
        </h2>
        <p className="text-muted-foreground text-center mb-12 font-body">
          Find the perfect adventure that matches your vibe
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col items-center gap-3 p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer"
              onClick={() => {
                if (exp.category) navigate(`/packages?category=${encodeURIComponent(exp.category)}`);
                else navigate('/packages');
              }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {exp.icon}
              </div>
              <h3 className="font-heading font-semibold text-sm text-card-foreground">{exp.title}</h3>
              <span className="text-xs text-muted-foreground">{exp.count}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperiencesSection;
