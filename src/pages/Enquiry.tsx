import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Send, Phone, Instagram, CheckCircle, Loader2, MessageSquare, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Enquiry = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("enquiries").insert({
      name,
      email,
      phone: phone || null,
      message: message || null,
      source: "form",
      user_id: user?.id || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to send. Please try again.");
    } else {
      setSubmitted(true);
      toast.success("Enquiry submitted successfully!");
    }
  };

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent("Hi! I'd like to know more about your travel packages.")}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Get in Touch" description="Contact Travyntra — reach us via form, WhatsApp, or Instagram for travel enquiries and custom trip planning." />
      <Navbar />
      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-3">Get in Touch</h1>
            <p className="text-muted-foreground text-lg font-body max-w-xl mx-auto">Have questions? Reach out via form, WhatsApp, or Instagram</p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-2 space-y-4">
              {[
                { icon: Phone, label: "WhatsApp", desc: "Chat with us instantly", href: whatsappLink, color: "text-green-500" },
                { icon: Instagram, label: "Instagram", desc: "Follow our travel stories", href: "https://instagram.com", color: "text-pink-500" },
                { icon: Mail, label: "Email", desc: "hello@travelvista.com", href: "mailto:hello@travelvista.com", color: "text-primary" },
                { icon: MapPin, label: "Office", desc: "Bangalore, India", href: "#", color: "text-primary" },
              ].map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-card transition-shadow"
                >
                  <div className={`p-2.5 bg-secondary rounded-lg ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.a>
              ))}

              {/* Instagram Embed Placeholder */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <h3 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-500" /> Travel Stories
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200&q=80",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80",
                    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&q=80",
                    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=200&q=80",
                    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&q=80",
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200&q=80",
                  ].map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden">
                      <img src={img} alt="Travel story" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" loading="lazy" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-3">
              <div className="bg-card border border-border rounded-2xl shadow-card p-6 sm:p-8">
                {submitted ? (
                  <div className="text-center py-10 space-y-4">
                    <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                    <h3 className="text-2xl font-heading font-bold text-foreground">Thank You!</h3>
                    <p className="text-muted-foreground">We've received your enquiry and will get back to you within 24 hours.</p>
                    <Button onClick={() => { setSubmitted(false); setName(""); setMessage(""); setPhone(""); }}>
                      Send Another
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-heading font-bold text-foreground">Send Us a Message</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Tell us what you're looking for..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
                    </div>
                    <Button type="submit" className="w-full gap-2" size="lg" disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Enquiry
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Enquiry;
