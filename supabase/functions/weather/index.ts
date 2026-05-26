const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const location = url.searchParams.get("location");
    if (!location || location.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid location" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENWEATHER_API_KEY");
    if (!apiKey) throw new Error("OPENWEATHER_API_KEY not set");

    // Geocode
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location + ",Karnataka,IN")}&limit=1&appid=${apiKey}`,
    );
    const geo = await geoRes.json();
    if (!Array.isArray(geo) || geo.length === 0) {
      return new Response(JSON.stringify({ error: "Location not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { lat, lon, name } = geo[0];

    const wRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
    );
    const w = await wRes.json();
    if (!wRes.ok) throw new Error(`OpenWeather error: ${JSON.stringify(w)}`);

    // Pick one entry per day (around 12:00)
    const byDay = new Map<string, any>();
    for (const item of w.list ?? []) {
      const date = item.dt_txt.split(" ")[0];
      if (!byDay.has(date) || item.dt_txt.includes("12:00:00")) byDay.set(date, item);
    }
    const days = Array.from(byDay.entries()).slice(0, 5).map(([date, item]: any) => ({
      date,
      temp: Math.round(item.main.temp),
      tempMin: Math.round(item.main.temp_min),
      tempMax: Math.round(item.main.temp_max),
      description: item.weather[0]?.description,
      icon: item.weather[0]?.icon,
      humidity: item.main.humidity,
      wind: item.wind?.speed,
    }));

    return new Response(JSON.stringify({ location: name, days }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weather error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
