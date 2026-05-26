import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

interface Rec {
  id: string;
  title: string;
  reason: string;
}

const Recommend = () => {
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Rec[] | null>(null);
  const [summary, setSummary] = useState("");

  const submit = async () => {
    if (!preferences.trim()) return;
    setLoading(true);
    setRecs(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-recommend", {
        body: { preferences },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setRecs(data.recommendations || []);
      setSummary(data.summary || "");
    } catch (e) {
      toast.error((e as Error).message || "Recommendation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="AI Travel Recommendations" description="Get personalized Karnataka trip recommendations powered by AI." />
      <Navbar />
      <div className="container py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Badge className="mb-3 gap-1"><Sparkles className="w-3 h-3" /> AI-Powered</Badge>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">Find Your Perfect Karnataka Trip</h1>
          <p className="text-muted-foreground">Tell us what you love and we'll match you with handpicked packages.</p>
        </motion.div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <Textarea
            placeholder="e.g. I love nature, coffee plantations, and cool weather. 4 days, mid-range budget, traveling with my partner."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            rows={4}
            maxLength={1000}
          />
          <Button onClick={submit} disabled={loading || !preferences.trim()} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Finding matches..." : "Get Recommendations"}
          </Button>
        </div>

        {recs && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
            {summary && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
                {summary}
              </div>
            )}
            {recs.map((r) => (
              <Link
                key={r.id}
                to={`/packages/${r.id}`}
                className="block bg-card border border-border rounded-xl p-5 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-semibold text-lg mb-1">{r.title}</h3>
                    <p className="text-sm text-muted-foreground">{r.reason}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
            {recs.length === 0 && <div className="text-center text-muted-foreground">No matches yet — try a different prompt.</div>}
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Recommend;
