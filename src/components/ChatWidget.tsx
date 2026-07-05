import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Sparkles, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TREKKING_LOCATIONS } from "@/lib/trekking";

type Msg = { role: "user" | "assistant"; content: string; recommendation?: { title: string; link: string } };

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Namaste! 🙏 I'm your Travyntra travel assistant. Try asking me for 'a 2 day trek under 5000' or 'something easy for beginners'." },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    // Simple keyword extraction trick client-side before calling the pure text API (since ai-chat is streaming text only)
    // In a real sophisticated setup, the edge function would return a specialized JSON card schema via function calling.
    let matchedLink: string | null = null;
    let matchedTitle: string | null = null;
    
    const searchTerms = text.toLowerCase();
    for (const loc of TREKKING_LOCATIONS) {
      if (searchTerms.includes(loc.toLowerCase())) {
        matchedLink = `/packages?search=${encodeURIComponent(loc)}`;
        matchedTitle = `${loc} Trek`;
        break;
      }
    }

    if (!matchedLink && (searchTerms.includes("easy") || searchTerms.includes("relax"))) {
      matchedLink = `/packages?search=Tadiandamol`; // Generic map for demo
      matchedTitle = `Tadiandamol (Easy/Moderate)`;
    }

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Chat error" }));
        toast.error(err.error || "Chat error");
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      
      const newAssistantMsg: Msg = { role: "assistant", content: "" };
      if (matchedLink && matchedTitle) {
        newAssistantMsg.recommendation = { title: matchedTitle, link: matchedLink };
      }
      setMessages([...newMessages, newAssistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { 
                  ...copy[copy.length - 1],
                  content: assistantText 
                };
                return copy;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (e) {
      toast.error("Failed to reach assistant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-elegant flex items-center justify-center"
        aria-label="Open chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[min(380px,calc(100vw-3rem))] h-[520px] bg-card border border-border rounded-2xl shadow-elegant flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-primary/5">
              <Sparkles className="w-4 h-4 text-primary" />
              <div className="font-heading font-semibold text-sm">Travyntra Assistant</div>
              <span className="ml-auto text-xs text-muted-foreground">AI-powered</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-foreground border border-border"}`}>
                    {m.content || (loading && i === messages.length - 1 ? <Loader2 className="w-3 h-3 animate-spin" /> : null)}
                  </div>
                  
                  {m.recommendation && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-2 w-[85%] bg-card border border-primary/20 shadow-sm rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => { navigate(m.recommendation!.link); setOpen(false); }}
                    >
                      <div className="bg-primary/5 px-3 py-2 flex items-center justify-between border-b border-primary/10">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Suggested Trip</span>
                        <Navigation className="w-3 h-3 text-primary" />
                      </div>
                      <div className="p-3">
                        <div className="font-heading font-medium text-sm text-foreground line-clamp-1">{m.recommendation.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">Click to view details & book spots</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="p-3 border-t border-border flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about India trips..."
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
