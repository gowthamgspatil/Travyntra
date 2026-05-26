import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, Users, Star, Search, Filter, CalendarDays, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PackageCardSkeleton } from "@/components/CardSkeleton";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { TREKKING_LOCATIONS, AGUMBE_TEMPLATE, DEFAULT_TREK_IMAGE } from "@/lib/trekking";

const categories = [
  { id: "all", label: "All Packages" },
  { id: "karnataka", label: "Karnataka" },
  { id: "trekking", label: "Trekking" },
  { id: "resort", label: "Resort" },
  { id: "corporate", label: "Corporate" },
  { id: "party", label: "Party" },
];

interface Package {
  id: string;
  title: string;
  category: string;
  price: number;
  duration: string;
  location: string;
  description: string | null;
  images: string[];
  featured: boolean;
  rating: number | null;
  review_count: number | null;
  max_group_size: number | null;
}

interface BatchInfo {
  package_id: string;
  start_date: string;
  spots_left: number;
}

// Agumbe package constants (kept outside the component to avoid JSX/parser issues)
const AGUMBE_IMAGES = [
  'https://images.openai.com/static-rsc-4/SgWNY4HKP9ybJwzxYCMfIJDjCYgK_57Quayb9UtVRKIhIhi6-dhYL-LSyJpC3weaPVPUiZn9t5woPDEez2-UnQxg8UQ7R5CkiGCaqUOeYoGdwvEvxqzWG_DqtRsQVj0Vdg6zeWhyL9HU3GBLqIkNAiOd9oCFM1xcX0FkolgjnpjnPi5_7tLQyrFylf7VyZOO?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/T3OcPkebu88tVprGB5Uyho6lvQ42MSTu_4TAvpGcgnuxRsVzsVezh6SswHktoekrt4ACCkXpwm-wBYPI_F4jFeBVxAznYrBRG1fqlOjhcrAtmdcQRpN1cOvdwxe3Z56AL98rA_LmmCWKdjQRS_-m-y-vzJrDZPgREnvrj0NTMMTqr9VCjrfH7_MkTl90QTv2?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/r7AUthYVjMM70_GtPkgGzXphM3a0al9u1ZIHlaBrNTKF76UH9RfQagGCNz04Y6dTjSK6mAS3ECeqZuRI1zyWu2fRpkPP99a9Tde7N6y2KVIV0HuxIssIIkn1wmREG3MM8xLRBkkCEUaEpKjjD9d_EOaL6i_WBd6TuppYnUhddFXqnHwWmEBkIojrRpJbZ8xx?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/0lJq6T2wDiKK1FvdTKMHRjhIHmuE-UmiXMphms_r0bnz9oHmVvJS0yEzXNTxELAXmXCxUx2czDNhSUGTXoE7OdB15_WzVHv3AVge1TFk41AdSS8_GWICZX4hsCcHs6IpJwMzkXuTYMSIsbIrBHNw7XbrXwbi8D-o6kRh3nR4t4z6oH_ulgOgZoYhXjYptN-K?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/cYw-wA_14ES3-nzxmjJd7FhvuENxILY7mKY_V4wmbwY0PQXhk7x18z0DbNW_-QGp2flWmM80NNFdHHTNoFdeP6M7XmWnCitIBYflVuc98SyK_EzamBSdcmBWQpQmkMGQ_Vnrsz6edDjgTuFPOmay-W71dpXkMfkKPNZ6duZw9DhKxJw01gKzafK0TJYn_cdK?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/ZrmShBu5lGB24qQndM-g5iat5Utoo1vyM-UAD71UtQXiE4LoKgmMTULPswWgS6pZCiFlhsoDcMpodsfqIcPqjk3cDPm1sx0REP8k7S-vyvSAbYmoT5tKze88u8YlGtIeaZmhf4YStusRvNCnFAMKH9kgDxOcylRmV7bBWg68p9MrTY4PxeH_H4PSb5kAhd3R?purpose=fullsize'
];

const AGUMBE_TEMPLATE: Package = {
  id: 'agumbe-template',
  title: 'Agumbe Rainforest Trek',
  category: 'trekking',
  price: 5200,
  duration: '1 Day / 1 Night',
  location: 'Agumbe, Karnataka',
  description: 'Experience trekking at Agumbe — lush rainforest, viewpoints, and monsoon magic.',
  images: AGUMBE_IMAGES,
  featured: true,
  rating: 4.5,
  review_count: 12,
  max_group_size: 16,
};

const Packages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [batchMap, setBatchMap] = useState<Record<string, BatchInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Read search params
  const activeCategory = searchParams.get('category') || "all";
  const search = searchParams.get('search') || "";
  const sortBy = searchParams.get('sort') || "rating";
  const onlyAvailable = searchParams.get('available') === 'true';

  const setActiveCategory = (c: string) => {
    setSearchParams(prev => { c === 'all' ? prev.delete('category') : prev.set('category', c); return prev; });
  }
  const setSearch = (s: string) => {
    setSearchParams(prev => { s ? prev.set('search', s) : prev.delete('search'); return prev; });
  }
  const setSortBy = (s: string) => {
    setSearchParams(prev => { s === 'rating' ? prev.delete('sort') : prev.set('sort', s); return prev; });
  }
  const setOnlyAvailable = (v: boolean) => {
    setSearchParams(prev => { v ? prev.set('available', 'true') : prev.delete('available'); return prev; });
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Use shared trekking locations and filter out any Falls entries
  const trekkingLocations = TREKKING_LOCATIONS.filter((loc) => !/falls/i.test(loc));

  const fetchData = async () => {
    const [pkgRes, batchRes] = await Promise.all([
      supabase.from("packages").select("*").order("featured", { ascending: false }),
      supabase.from("batches").select("package_id, start_date, max_capacity, current_count").eq("status", "open").order("start_date"),
    ]);
    if (pkgRes.data) setPackages(pkgRes.data as Package[]);
    if (batchRes.data) {
      const map: Record<string, BatchInfo> = {};
      (batchRes.data as any[]).forEach((b) => {
        if (!map[b.package_id]) {
          const spotsLeft = Math.max(0, (b.max_capacity || 0) - (b.current_count || 0));
          map[b.package_id] = {
            package_id: b.package_id,
            start_date: b.start_date,
            spots_left: spotsLeft,
          };
        }
      });
      setBatchMap(map);
    }
    setLoading(false);
  };

  // Refresh when sample batches are seeded in admin
  useEffect(() => {
    const handler = () => {
      fetchData();
    };
    window.addEventListener("batches:seeded", handler);
    const channel = new BroadcastChannel('sync-channel');
    channel.onmessage = (e) => {
      if (e.data === 'batches:seeded') handler();
    };
    return () => {
      window.removeEventListener("batches:seeded", handler);
      channel.close();
    };
  }, []);

  const filtered = packages
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !onlyAvailable || (batchMap[p.id] && batchMap[p.id].spots_left > 0))
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return (b.rating || 0) - (a.rating || 0);
    });

  const defaultImage = DEFAULT_TREK_IMAGE;

  // When viewing trekking category, show these locations as package-like mock cards
  const trekkingMockPackages = trekkingLocations.map((loc, idx) => {
    if (loc === 'Agumbe') {
      return { ...AGUMBE_TEMPLATE, id: `mock-${idx}` };
    }
    return {
      id: `mock-${idx}`,
      // allow specific title overrides (avoid double 'Trek' for entries like 'Agumbe Rainforest')
      title: `${loc} Trek`,
      category: "trekking",
      price: 4800 + (idx % 5) * 200,
      duration: "1 Day / 1 Night",
      location: loc + ", Karnataka",
      description: `Experience trekking at ${loc}.`,
      images: [defaultImage],
      featured: false,
      rating: 4.5,
      review_count: 0,
      max_group_size: 12,
    };
  });

  // Ensure Agumbe mock is available in trekking category


  // Build the packages content to render (keeps JSX simpler and avoids nested ternaries)
  let packagesContent: JSX.Element;
  if (loading) {
    packagesContent = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PackageCardSkeleton key={i} />
        ))}
      </div>
    );
  } else if (activeCategory === 'trekking') {
    // Merge real 'filtered' trekking packages with mock list, preferring real packages and avoiding duplicates
    const realIds = new Set((filtered || []).map((p) => p.id));

    // Show mocks for trekking even if there are real packages with different ids.
    // Only hide mocks when user explicitly wants onlyAvailable.
    const missingMocks = onlyAvailable ? [] : trekkingMockPackages.filter((m) => !realIds.has(m.id));

    const list = [...(filtered || []), ...missingMocks];
    // Sort alphabetically by title
    list.sort((a, b) => a.title.localeCompare(b.title));

    if (list.length === 0 && onlyAvailable) {
      packagesContent = (
        <div className="text-center py-20">
          <h3 className="text-xl font-heading font-semibold text-foreground mb-2">No available packages</h3>
          <p className="text-muted-foreground mb-4">There are no packages with open batches matching your filters.</p>
          <Button onClick={() => setOnlyAvailable(false)}>Show all packages</Button>
        </div>
      );
    } else if (list.length === 0) {
      packagesContent = (
        <div className="text-center py-20">
          <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-heading font-semibold text-foreground mb-1">No packages found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or search term</p>
        </div>
      );
    } else {
    packagesContent = (
      <AnimatePresence mode="wait">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((pkg, i) => {
            const batch = batchMap[pkg.id];
            return (
              <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/packages/${pkg.id}`} className="group block">
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
                    <div className="relative h-48 overflow-hidden">
                      <img src={pkg.images?.[0] || defaultImage} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      {pkg.featured && (
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
                      )}
                      <Badge variant="secondary" className="absolute top-3 right-3 capitalize">{pkg.category}</Badge>
                    </div>
                    <div className="p-5 space-y-3">
                      
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{pkg.title}</h3>
                        {(pkg as any).included && (pkg as any).included.length > 0 && (
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 mt-1 text-muted-foreground/60 hover:text-primary flex-shrink-0 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[200px] text-xs">
                                <p className="font-semibold mb-1">Highlights:</p>
                                <ul className="list-disc pl-3">
                                  {(pkg as any).included.slice(0, 3).map((inc: string, idx: number) => (
                                    <li key={idx} className="line-clamp-1">{inc}</li>
                                  ))}
                                  {(pkg as any).included.length > 3 && <li>And more...</li>}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{pkg.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pkg.duration}</span>
                      </div>
                      {batch && batch.spots_left > 0 ? (
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Next: {format(new Date(batch.start_date), "MMM d")}
                          </span>
                          <span className={`font-medium ${batch.spots_left <= 3 ? "text-destructive" : "text-muted-foreground"}`}>
                            {batch.spots_left} spot{batch.spots_left !== 1 ? "s" : ""} left
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-muted text-muted-foreground">No spots available</Badge>
                        </div>
                      )}
                      {pkg.description && <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-primary fill-primary" />
                          <span className="text-sm font-medium text-foreground">{pkg.rating || "New"}</span>
                          {pkg.review_count ? <span className="text-xs text-muted-foreground">({pkg.review_count})</span> : null}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-heading font-bold text-lg text-foreground">₹{pkg.price.toLocaleString()}</span>
                          {batch && batch.spots_left > 0 ? (
                            <Button size="sm" className="rounded-md">Book</Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">&nbsp;</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    );
    }
  } else if (filtered.length === 0 && onlyAvailable) {
    packagesContent = (
      <div className="text-center py-20">
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">No available packages</h3>
        <p className="text-muted-foreground mb-4">There are no packages with open batches matching your filters.</p>
        <Button onClick={() => setOnlyAvailable(false)}>Show all packages</Button>
      </div>
    );
  } else if (filtered.length === 0) {
    packagesContent = (
      <div className="text-center py-20">
        <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="text-lg font-heading font-semibold text-foreground mb-1">No packages found</h3>
        <p className="text-muted-foreground text-sm">Try adjusting your filters or search term</p>
      </div>
    );
  } else {
    packagesContent = (
      <AnimatePresence mode="wait">
        <motion.div key={activeCategory + sortBy} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pkg, i) => {
            const batch = batchMap[pkg.id];
            return (
              <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/packages/${pkg.id}`} className="group block">
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
                    <div className="relative h-48 overflow-hidden">
                      <img src={pkg.images?.[0] || defaultImage} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      {pkg.featured && (
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
                      )}
                      <Badge variant="secondary" className="absolute top-3 right-3 capitalize">{pkg.category}</Badge>
                    </div>
                    <div className="p-5 space-y-3">
                      
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">{pkg.title}</h3>
                        {(pkg as any).included && (pkg as any).included.length > 0 && (
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <Info className="w-4 h-4 mt-1 text-muted-foreground/60 hover:text-primary flex-shrink-0 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[200px] text-xs">
                                <p className="font-semibold mb-1">Highlights:</p>
                                <ul className="list-disc pl-3">
                                  {(pkg as any).included.slice(0, 3).map((inc: string, idx: number) => (
                                    <li key={idx} className="line-clamp-1">{inc}</li>
                                  ))}
                                  {(pkg as any).included.length > 3 && <li>And more...</li>}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{pkg.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{pkg.duration}</span>
                      </div>
                      {batch && batch.spots_left > 0 ? (
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Next: {format(new Date(batch.start_date), "MMM d")}
                          </span>
                          <span className={`font-medium ${batch.spots_left <= 3 ? "text-destructive" : "text-muted-foreground"}`}>
                            {batch.spots_left} spot{batch.spots_left !== 1 ? "s" : ""} left
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-muted text-muted-foreground">No spots available</Badge>
                        </div>
                      )}
                      {pkg.description && <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-primary fill-primary" />
                          <span className="text-sm font-medium text-foreground">{pkg.rating || "New"}</span>
                          {pkg.review_count ? <span className="text-xs text-muted-foreground">({pkg.review_count})</span> : null}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-heading font-bold text-lg text-foreground">₹{pkg.price.toLocaleString()}</span>
                          {batch && batch.spots_left > 0 ? (
                            <Button size="sm" className="rounded-md">Book</Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">&nbsp;</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Travel Packages" description="Browse curated travel packages across Karnataka, trekking, resorts, corporate retreats, and party destinations." />
      <Navbar />
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-3">Travel Packages</h1>
            <p className="text-muted-foreground text-lg font-body max-w-xl mx-auto">Curated packages for every kind of traveler</p>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search packages or locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {(["price-asc", "price-desc", "rating"] as const).map((s) => (
                <Button key={s} variant={sortBy === s ? "default" : "outline"} size="sm" onClick={() => setSortBy(s)}>
                  {s === "price-asc" ? "Price ↑" : s === "price-desc" ? "Price ↓" : "Top Rated"}
                </Button>
              ))}
              <Button variant={onlyAvailable ? "default" : "outline"} size="sm" onClick={() => setOnlyAvailable((v) => !v)}>
                Only show available
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat.id)}>
                {cat.label}
              </Button>
            ))}
          </div>

          

          {packagesContent}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Packages;
