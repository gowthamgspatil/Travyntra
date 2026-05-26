import { useEffect, useState } from "react";
import { Cloud, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Day {
  date: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
  wind: number;
}

const WeatherWidget = ({ location }: { location: string }) => {
  const [days, setDays] = useState<Day[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/weather?location=${encodeURIComponent(location)}`,
          { headers: { "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Weather unavailable");
        setDays(data.days);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading weather...
      </div>
    );
  }
  if (error || !days) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Cloud className="w-4 h-4 text-primary" />
        <h4 className="font-heading font-semibold text-sm">5-Day Weather — {location}</h4>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {days.map((d) => (
          <div key={d.date} className="text-center p-2 rounded-lg bg-muted/40">
            <div className="text-[10px] text-muted-foreground">
              {new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
              alt={d.description}
              className="w-10 h-10 mx-auto"
            />
            <div className="text-sm font-heading font-semibold">{d.temp}°</div>
            <div className="text-[10px] text-muted-foreground capitalize">{d.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;
