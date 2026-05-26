import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Car, Hotel, Handshake, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ServiceCardSkeleton } from "@/components/CardSkeleton";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const typeIcons: Record<string, any> = {
  vehicle: Car,
  stay: Hotel,
  contracting: Handshake,
};

const typeLabels: Record<string, string> = {
  vehicle: "Vehicle Services",
  stay: "Stay & Hotels",
  contracting: "Resort Contracting",
};

interface Service {
  id: string;
  type: string;
  title: string;
  description: string | null;
  image: string | null;
  price_range: string | null;
  features: string[];
}

const defaultImages: Record<string, string> = {
  vehicle: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
  stay: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  contracting: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80",
};

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from("services").select("*").order("created_at");
      if (data) setServices(data as Service[]);
      setLoading(false);
    };
    fetchServices();
  }, []);

  const filtered = activeType === "all" ? services : services.filter((s) => s.type === activeType);
  const types = ["all", "vehicle", "stay", "contracting"];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Our Services" description="Comprehensive travel solutions — vehicle rentals, hotel stays, and resort contracting services by Travyntra." />
      <Navbar />
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-3">Our Services</h1>
            <p className="text-muted-foreground text-lg font-body max-w-xl mx-auto">Comprehensive travel solutions — vehicles, stays, and resort partnerships</p>
          </div>

          {/* Type Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${activeType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {t === "all" ? "All Services" : typeLabels[t]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Handshake className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-heading font-semibold text-foreground mb-1">No services listed yet</h3>
              <p className="text-muted-foreground text-sm">Check back soon for our full service catalog</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((service, i) => {
                const Icon = typeIcons[service.type] || Car;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
                  >
                    <div className="h-44 overflow-hidden">
                      <img src={service.image || defaultImages[service.type]} alt={service.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <Badge variant="secondary" className="capitalize">{service.type}</Badge>
                      </div>
                      <h3 className="font-heading font-bold text-lg text-foreground">{service.title}</h3>
                      {service.description && <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>}
                      {service.features?.length > 0 && (
                        <div className="space-y-1.5">
                          {service.features.slice(0, 3).map((f, j) => (
                            <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                      )}
                      {service.price_range && (
                        <p className="text-sm font-heading font-bold text-foreground">{service.price_range}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Services;
