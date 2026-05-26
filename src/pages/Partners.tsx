import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, ExternalLink, Building2, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartnerCardSkeleton } from "@/components/CardSkeleton";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Resort {
  id: string;
  name: string;
  location: string;
  description: string | null;
  images: string[];
  contact: string | null;
  website: string | null;
  is_partner: boolean;
  amenities: string[];
  price_range: string | null;
}

const Partners = () => {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResorts = async () => {
      const { data } = await supabase.from("resorts").select("*").eq("is_partner", true).order("name");
      if (data) setResorts(data as Resort[]);
      setLoading(false);
    };
    fetchResorts();
  }, []);

  const defaultImage = "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80";

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Our Partners" description="Discover Travyntra's trusted resort partners delivering exceptional travel experiences across India." />
      <Navbar />
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-3">Our Partners</h1>
            <p className="text-muted-foreground text-lg font-body max-w-xl mx-auto">Trusted resort partners that deliver exceptional travel experiences</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <PartnerCardSkeleton key={i} />
              ))}
            </div>
          ) : resorts.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-heading font-semibold text-foreground mb-1">Partner listings coming soon</h3>
              <p className="text-muted-foreground text-sm">We're onboarding our resort partners</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resorts.map((resort, i) => (
                <motion.div
                  key={resort.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img src={resort.images?.[0] || defaultImage} alt={resort.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-lg text-foreground">{resort.name}</h3>
                      <Badge className="bg-primary/10 text-primary border-primary/20">Partner</Badge>
                    </div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />{resort.location}
                    </p>
                    {resort.description && <p className="text-sm text-muted-foreground line-clamp-2">{resort.description}</p>}
                    {resort.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {resort.amenities.slice(0, 4).map((a, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      {resort.price_range && <span className="text-sm font-heading font-bold text-foreground">{resort.price_range}</span>}
                      {resort.website && (
                        <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
                          <a href={resort.website} target="_blank" rel="noopener noreferrer">
                            Visit <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Partners;
