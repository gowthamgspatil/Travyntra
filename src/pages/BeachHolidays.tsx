import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BEACHES from "@/data/beaches";

const BeachHolidays = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20">
        <div className="container">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-2">Beach Holidays</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Discover top beaches across India and nearby favourites — sun, sand and serene waters.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BEACHES.map((b, i) => (
              <motion.div key={b.slug} className="bg-card rounded-2xl border border-border overflow-hidden" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="h-44 bg-gray-100">
                  <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-foreground mb-1">{b.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{b.short}</p>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link to={`/packages?search=${encodeURIComponent(b.name)}`}>View Packages</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/experiences/beach/${b.slug}`}>Learn More</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BeachHolidays;
