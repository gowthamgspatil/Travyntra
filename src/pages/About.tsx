import { motion } from "framer-motion";
import { Users, Globe, Award, Heart, MapPin, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bali.jpg";

const stats = [
  { icon: <Users className="w-6 h-6" />, value: "50K+", label: "Happy Travelers" },
  { icon: <Globe className="w-6 h-6" />, value: "100+", label: "Destinations" },
  { icon: <Award className="w-6 h-6" />, value: "500+", label: "Tour Packages" },
  { icon: <Star className="w-6 h-6" />, value: "4.9", label: "Average Rating" },
];

const team = [
  { name: "Sarah Mitchell", role: "CEO & Founder", initials: "SM" },
  { name: "Raj Patel", role: "Head of Operations", initials: "RP" },
  { name: "Emily Chen", role: "Lead Travel Expert", initials: "EC" },
  { name: "Tom Wilson", role: "Marketing Director", initials: "TW" },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-80 overflow-hidden">
        <img src={heroBg} alt="About Travyntra" className="w-full h-full object-cover" width={1920} height={960} />
        <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-primary-foreground mb-3">About Travyntra</h1>
            <p className="text-primary-foreground/80 text-lg font-body">Making travel dreams come true since 2020</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-card rounded-2xl border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">{stat.icon}</div>
                <div className="text-3xl font-heading font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container max-w-3xl text-center">
          <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-heading font-bold text-foreground mb-6">Our Mission</h2>
          <p className="text-muted-foreground text-lg font-body leading-relaxed">
            At Travyntra, we believe that travel has the power to transform lives. Our mission is to make
            extraordinary travel experiences accessible to everyone. We partner with local experts worldwide
            to craft personalized journeys that create lasting memories.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-8 bg-card rounded-2xl border border-border">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-heading font-bold mx-auto mb-4">
                  {member.initials}
                </div>
                <h3 className="font-heading font-semibold text-card-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
