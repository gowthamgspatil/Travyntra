import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, MapPin, Star, Filter, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackageCardSkeleton } from "@/components/CardSkeleton";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ResultType = "package" | "resort" | "service";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  description: string;
  image?: string;
  location?: string;
  price?: number;
  rating?: number;
  category?: string;
  href: string;
  tags: string[];
}

const typeFilters: { id: "all" | ResultType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "package", label: "Packages" },
  { id: "resort", label: "Resorts" },
  { id: "service", label: "Services" },
];

const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<"all" | ResultType>("all");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const fetchAll = async () => {
    const [pkgs, resorts, services] = await Promise.all([
      supabase.from("packages").select("id, title, description, images, location, price, rating, category"),
      supabase.from("resorts").select("id, name, description, images, location, amenities, price_range"),
      supabase.from("services").select("id, title, description, image, type, features, price_range"),
    ]);

    const combined: SearchResult[] = [];

    (pkgs.data || []).forEach((p: any) => {
      combined.push({
        id: p.id,
        type: "package",
        title: p.title,
        description: p.description || "",
        image: p.images?.[0] || defaultImage,
        location: p.location,
        price: p.price,
        rating: p.rating,
        category: p.category,
        href: `/packages/${p.id}`,
        tags: [p.category].filter(Boolean),
      });
    });

    (resorts.data || []).forEach((r: any) => {
      combined.push({
        id: r.id,
        type: "resort",
        title: r.name,
        description: r.description || "",
        image: r.images?.[0] || defaultImage,
        location: r.location,
        href: `/partners#${r.id}`,
        tags: r.amenities || [],
      });
    });

    (services.data || []).forEach((s: any) => {
      combined.push({
        id: s.id,
        type: "service",
        title: s.title,
        description: s.description || "",
        image: s.image || defaultImage,
        href: `/services#${s.id}`,
        tags: [s.type, ...(s.features || [])].filter(Boolean),
      });
    });

    setResults(combined);
    setLoading(false);
  };

  const allTags = useMemo(
    () => [...new Set(results.flatMap((r) => r.tags))].filter(Boolean).sort().slice(0, 20),
    [results]
  );

  const filtered = useMemo(() => {
    return results.filter((item) => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      const matchesType = activeType === "all" || item.type === activeType;
      const matchesTags = activeTags.length === 0 || activeTags.some((t) => item.tags.includes(t));
      return matchesQuery && matchesType && matchesTags;
    });
  }, [results, query, activeType, activeTags]);

  const toggleTag = (tag: string) =>
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const clearFilters = () => {
    setActiveTags([]);
    setActiveType("all");
    setQuery("");
    setSearchParams({});
  };

  const submitQuery = (q: string) => {
    setQuery(q);
    if (q) setSearchParams({ q });
    else setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={query ? `Search: ${query}` : "Search"} description="Search packages, resorts, and services across India." />
      <Navbar />
      <section className="py-12 sm:py-20">
        <div className="container">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-3">Search</h1>
            <p className="text-muted-foreground text-lg font-body max-w-xl mx-auto">Find packages, resorts, and services</p>
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search packages, resorts, services, locations..."
                value={query}
                onChange={(e) => submitQuery(e.target.value)}
                className="pl-12 pr-12 h-14 text-base rounded-2xl border-border bg-card shadow-card"
              />
              {query && (
                <button onClick={() => submitQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            {typeFilters.map((t) => (
              <Button key={t.id} size="sm" variant={activeType === t.id ? "default" : "outline"} onClick={() => setActiveType(t.id)} className="rounded-full">
                {t.label}
              </Button>
            ))}
            {allTags.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-1.5 rounded-full">
                <Filter className="w-3.5 h-3.5" /> Tags {activeTags.length > 0 && `(${activeTags.length})`}
              </Button>
            )}
            {(activeTags.length > 0 || query || activeType !== "all") && (
              <Button size="sm" variant="ghost" onClick={clearFilters} className="gap-1 text-muted-foreground rounded-full">
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-wrap justify-center gap-2 mb-8 max-w-3xl mx-auto">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={activeTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer capitalize hover:bg-primary/90 transition-colors"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </motion.div>
          )}

          <p className="text-sm text-muted-foreground text-center mb-8">
            {loading ? "Searching..." : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} found`}
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <PackageCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <SearchIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">Try different keywords or clear your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((item, i) => (
                <motion.div key={`${item.type}-${item.id}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}>
                  <Link to={item.href} className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer block bg-card border border-border">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-xs capitalize">{item.type}</Badge>
                    </div>
                    {item.category && (
                      <div className="absolute top-3 right-3">
                        <Badge className="text-xs capitalize bg-primary text-primary-foreground">{item.category}</Badge>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground">
                      {item.rating ? (
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                          <span className="text-sm font-medium">{item.rating}</span>
                        </div>
                      ) : null}
                      <h3 className="font-heading font-bold text-xl line-clamp-1">{item.title}</h3>
                      {item.description && <p className="text-primary-foreground/70 text-sm line-clamp-2 mt-1">{item.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-primary-foreground/80">
                        {item.location && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                        )}
                        {item.price ? (
                          <span className="flex items-center gap-1 font-semibold"><Clock className="w-3 h-3" />₹{item.price.toLocaleString()}</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
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

export default SearchPage;
