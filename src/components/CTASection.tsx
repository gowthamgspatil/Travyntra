import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Users, Shield, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: <Users className="w-6 h-6" />, title: "Expert Guides", desc: "Local experts on every tour" },
  { icon: <Shield className="w-6 h-6" />, title: "Best Price Guarantee", desc: "No hidden charges ever" },
  { icon: <Headphones className="w-6 h-6" />, title: "24/7 Support", desc: "Always here to help" },
];

const CTASection = () => {
  return (
    <section id="custom" className="py-20 bg-gradient-hero">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Plan Your Dream Trip
              <br />
              <span className="text-gradient-primary">With Us Today</span>
            </h2>
            <p className="text-muted-foreground mb-8 font-body leading-relaxed">
              Whether it's a weekend getaway, a corporate retreat, or a once-in-a-lifetime
              international adventure — we craft personalized itineraries just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="gap-2 rounded-full" asChild>
                <Link to="/enquiry">Get Custom Quote <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link to="/enquiry">Talk to an Expert</Link>
              </Button>
            </div>
          </motion.div>

          <div className="grid gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-card-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
