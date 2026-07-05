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
import BEACHES from "@/data/beaches";
import CRUISES from "@/data/cruises";
import cruiseImages from "@/data/cruiseImages";
import EttinaImg from "@/assets/Ettina Bhuja.png";

const categories = [
  { id: "all", label: "All Packages" },
  { id: "karnataka", label: "India" },
  { id: "beach", label: "Beach Holidays" },
  { id: "cruise", label: "Cruises" },
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
  'https://muddietrails.com/wp-content/uploads/2024/01/Agumbe-2.webp',
];

const AGUMBE_TEMPLATE: Package = {
  id: 'agumbe-template',
  title: 'Agumbe Rainforest Trek',
  category: 'trekking',
  price: 5200,
  duration: '1 Day / 1 Night',
  location: 'Agumbe, India',
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
    // Exclude the unwanted package entirely from listings
    .filter((p) => p.title !== 'Udupi & Malpe Coast')
    // Exclude specific beach package (remove from site)
    .filter((p) => p.title !== 'Gokarna Beach Bliss')
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return (b.rating || 0) - (a.rating || 0);
    });

  const defaultImage = DEFAULT_TREK_IMAGE;
  const kudremukhImage = "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/23/b6/ec/pic-4.jpg?w=1200&h=1200&s=1";
  const gokarnaImage = "https://s7ap1.scene7.com/is/image/incredibleindia/om-beach-gokarna-karnataka-tri-hero?qlt=82&ts=1727164538227";
  const kumaraImage = "https://www.treknomads.com/system/images/000/351/246/56a9a393c09a880ae651a3d05f51a086/banner/Kumara_Parvata___TrekNomads.png";
  const kuntiImage = "https://media1.thrillophilia.com/filestore/2b0angi3ymzyz64ghywmen12nm8h_1466066165_DSC_9895.jpg";
  const kurinjalImage = "https://i.ytimg.com/vi/18JpUZaN9-M/maxresdefault.jpg";
  const madhugiriImage = "https://i.ytimg.com/vi/_kTFXBw_X9I/maxresdefault.jpg";
  const mullayanagiriImage = "https://res.cloudinary.com/dyiffrkzh/image/upload/v1678274411/bbj/j65bc6yhe9tpko5tvhzj.jpg";
  const nandiImage = "https://media2.thrillophilia.com/images/photos/000/141/304/original/1547808516_shutterstock_682915852.jpg?gravity=center&width=1280&height=642&crop=fill&quality=auto&fetch_format=auto&flags=strip_profile&format=jpg&sign_url=true";
  const nishaniImage = "https://highape.com/_next/image?url=https%3A%2F%2Fhighape.blr1.cdn.digitaloceanspaces.com%2Fevents%2F7853c452%2Fkaqcygiyurtdnlaipwqc.jpg&w=2560&q=75";
  const ramadevaraImage = "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/72/bd/a1/scenery.jpg?w=1200&h=-1&s=1";
  const savandurgaImage = "https://d10y46cwh6y6x1.cloudfront.net/images/1934D373-7B5A-4C84-A999-FC1F8C31C1F4.png";
  const skandagiriImage = "https://www.explorebees.com/uploads/activities/Skandagiri+Sunrise+Trek_2.jpg";
  const tadiandamolImage = "https://api.trekpanda.in/uploads/tadiandamol-trek-trekpanda.jpeg";

  const resolveTrekImage = (title: string, location: string, fallbackImage: string) => {
    if (/Gokarna/i.test(title) || /Gokarna/i.test(location)) return gokarnaImage;
    if (/Kumara Parvatha|Kumara/i.test(title) || /Kumara Parvatha|Kumara/i.test(location)) return kumaraImage;
    if (/Kudremukh/i.test(title) || /Kudremukh/i.test(location)) return kudremukhImage;
    if (/Kunti Betta|Kunti/i.test(title) || /Kunti Betta|Kunti/i.test(location)) return kuntiImage;
    if (/Kurinjal/i.test(title) || /Kurinjal/i.test(location)) return kurinjalImage;
    if (/Madhugiri/i.test(title) || /Madhugiri/i.test(location)) return madhugiriImage;
    if (/Mullayanagiri/i.test(title) || /Mullayanagiri/i.test(location)) return mullayanagiriImage;
    if (/Nandi Hills/i.test(title) || /Nandi Hills/i.test(location)) return nandiImage;
    if (/Nishani Motte/i.test(title) || /Nishani Motte/i.test(location)) return nishaniImage;
    if (/Ramadevara Betta/i.test(title) || /Ramadevara Betta/i.test(location)) return ramadevaraImage;
    if (/Savandurga/i.test(title) || /Savandurga/i.test(location)) return savandurgaImage;
    if (/Skandagiri/i.test(title) || /Skandagiri/i.test(location)) return skandagiriImage;
    if (/Tadiandamol/i.test(title) || /Tadiandamol/i.test(location)) return tadiandamolImage;
    return fallbackImage;
  };

  // When viewing trekking category, show these locations as package-like mock cards
  const trekkingMockPackages = trekkingLocations.map((loc, idx) => {
    // allow specific TripAdvisor images for certain treks, otherwise fall back to default
    const ballalaImage = "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/93/b2/86/ballalarayana-durga-fort.jpg?w=900&h=500&s=1";
    const bilikalImage = "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/3c/5d/1a/caption.jpg?w=1100&h=1100&s=1";
    const brahmagiriImage = "https://res.cloudinary.com/kmadmin/image/upload/v1723636434/kiomoi/Brahmagiri_Hill_3581.jpg";
    const devarayanadurgaImage = "https://i.redd.it/scenic-view-of-devarayanadurga-hills-tumkur-karnataka-v0-mxjzeeyzycid1.jpg?width=4080&format=pjpg&auto=webp&s=deeae402673df70fc5adbcdab9796c0079d87fee";
    const antharagangeImage = "https://tripbae.com/wp-content/uploads/2024/05/Antharagange-trek-from-Bangalore-Antharagange-night-trek-Antharagange-cave-trek-Antharagange-trek-package-Antharagange-sunrise-trek-1.jpg";
    const jenukalImage = "https://d26dp53kz39178.cloudfront.net/media/uploads/products/mohamed-meqath-mani-rkgEbxmqW78-unsplash-1666779052330.jpg";
    const kaiwaraImage = "https://karnatakaecotourism.com/assets/img/treks/89_kaiwara-betta.jpg";
    const kodachadriImage = "https://www.treknomads.com/system/images/000/351/240/fd5c17046a902895731562d0ed1c911a/banner/Kodachadri__TrekNomads.png";
    const kudremukhImage = "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/23/b6/ec/pic-4.jpg?w=1200&h=1200&s=1";
    const kuntiImage = "https://media1.thrillophilia.com/filestore/2b0angi3ymzyz64ghywmen12nm8h_1466066165_DSC_9895.jpg";
    const kurinjalImage = "https://i.ytimg.com/vi/18JpUZaN9-M/maxresdefault.jpg";
    const madhugiriImage = "https://i.ytimg.com/vi/_kTFXBw_X9I/maxresdefault.jpg";
    const mullayanagiriImage = "https://res.cloudinary.com/dyiffrkzh/image/upload/v1678274411/bbj/j65bc6yhe9tpko5tvhzj.jpg";
    const nandiImage = "https://media2.thrillophilia.com/images/photos/000/141/304/original/1547808516_shutterstock_682915852.jpg?gravity=center&width=1280&height=642&crop=fill&quality=auto&fetch_format=auto&flags=strip_profile&format=jpg&sign_url=true";
    const ettinaImage = EttinaImg;
    let imageForLoc = defaultImage;
    if (/Ballalarayana/i.test(loc)) imageForLoc = ballalaImage;
    if (/Bilikal/i.test(loc)) imageForLoc = bilikalImage;
    if (/Brahmagiri/i.test(loc)) imageForLoc = brahmagiriImage;
    if (/Jenukal/i.test(loc)) imageForLoc = jenukalImage;
    if (/Kaiwara/i.test(loc)) imageForLoc = kaiwaraImage;
    if (/Kudremukh/i.test(loc)) imageForLoc = kudremukhImage;
    if (/Kodachadri/i.test(loc)) imageForLoc = kodachadriImage;
    if (/Ettina/i.test(loc)) imageForLoc = ettinaImage;
    if (/Antharagange/i.test(loc)) imageForLoc = antharagangeImage;
    if (/Kunti Betta|Kunti/i.test(loc)) imageForLoc = kuntiImage;
    if (/Kurinjal/i.test(loc)) imageForLoc = kurinjalImage;
    if (/Madhugiri/i.test(loc)) imageForLoc = madhugiriImage;
    if (/Mullayanagiri/i.test(loc)) imageForLoc = mullayanagiriImage;
    if (/Nandi Hills/i.test(loc)) imageForLoc = nandiImage;
    if (/Devarayanadurga/i.test(loc)) imageForLoc = devarayanadurgaImage;
    if (/Skandagiri/i.test(loc)) imageForLoc = skandagiriImage;
    if (/Tadiandamol/i.test(loc)) imageForLoc = tadiandamolImage;

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
      location: loc + ", India",
      description: `Experience trekking at ${loc}.`,
      images: [imageForLoc],
      featured: false,
      rating: 4.5,
      review_count: 0,
      max_group_size: 12,
    };
  });

  // Beach mock packages for quick demo when user filters by beach category
  const beaches = [
    'Baga Beach',
    'Calangute Beach',
    'Palolem Beach',
    'Malpe Beach',
    'Kovalam Beach',
    'Tarkarli Beach',
    'Radhanagar Beach',
    'Elephant Beach',
    "Corbyn's Cove Beach",
    'Puri Beach'
  ];

  const beachMockPackages = beaches.map((b, idx) => ({
    id: `beach-mock-${idx}`,
    title: `${b} Getaway`,
    category: 'beach',
    price: 3999 + (idx % 4) * 1000,
    duration: `${2 + (idx % 3)} Days / ${1 + (idx % 2)} Nights`,
    location: `${b}, India`,
    description: `Relax at ${b} — sandy shores, local seafood, and sunsets.`,
    // Find matching beach info by name to avoid index misalignment
    images: [
      ((): string => {
        const key = b.replace(/['"]/g, '').replace(/\s*Beach$/i, '').trim().toLowerCase();
        const info = BEACHES.find((bi) => bi.name.replace(/['"]/g, '').toLowerCase().includes(key));
        return info?.image || `https://source.unsplash.com/collection/190727/1200x800?${encodeURIComponent(b)}`;
      })(),
    ],
    featured: idx === 0,
    rating: 4.5 - (idx % 3) * 0.1,
    review_count: 50 - idx * 3,
    max_group_size: 20,
  }));

  // Cruise mock packages for quick demo when user filters by cruise category
  const cruiseMockPackages = CRUISES.map((c, idx) => {
    const suppliedAlleppeyImage = 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/06/f7/69/2a.jpg';
    const suppliedAndamanImage = 'https://www.andamantourism.org/wp-content/uploads/2023/12/ITT-Majestic-Ferry.jpg';
    const suppliedAntaraImage = 'https://www.steppestravel.com/app/uploads/2019/12/exterior-ganges-voyager-india.jpg';
    const suppliedAshtamudiImage = 'https://kollamtourismblog.files.wordpress.com/2016/11/kollam-back5.jpg?w=1000&h=';
    const suppliedBengalGangaImage = 'https://www.cruisingjournal.com/wp-content/uploads/2024/10/bengalganga-scaled.jpg';
    const suppliedBhitarkanikaImage = 'https://media.assettype.com/outlooktraveller/2025-04-15/ftcj4u1j/antaara120250415.jpg?w=1000&auto=format%2Ccompress&fit=max&format=webp&dpr=1.0';
    const suppliedBrahmaputraImage = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/ed/bb/e7/brahmaputra-cruise.jpg?w=1200&h=-1&s=1';
    const suppliedChennaiSriLankaImage = 'https://res.cloudinary.com/dyiffrkzh/image/upload/c_fill,f_auto,fl_progressive.strip_profile,g_center,h_400,q_auto,w_700/v1717221536/bbj/sxdqmqk0ysjwtiqknocq.jpg';
    const suppliedCharaidewImage = 'https://www.nationalgeographic.com/content/dam/expeditions/transports/charaidew-ii/charaidew-ii-exterior-hero.jpg';
    const suppliedChilikaImage = 'https://assets.telegraphindia.com/telegraph/2022/Jun/1654887519_11boat_5c.gif';
    const suppliedCoralLakshadweepImage = 'https://flywelltours.com/wp-content/uploads/2024/11/Lakshadweep-waterspots.webp';
    const suppliedCordeliaImage = 'https://media1.thrillophilia.com/filestore/ckshbs23x8tnjhwtun9xsbjfqv2h_oh5nfwf1fqz3iho3w1wkxaqmoc49_Cordelia%20Cruises%20-%20Mock%20Up%20Creative%20-%2022.12.2020%20(1).png.jpeg?w=753&h=450&dpr=2.0';
    const suppliedDalLakeImage = 'https://media-cdn.tripadvisor.com/media/photo-s/06/95/df/20/dal-lake.jpg';
    const suppliedDolphinGoaImage = 'https://www.cruisesingoa.com/images/dolphin-trips-goa-1.jpg';
    const imageUrl = cruiseImages[c] || `https://source.unsplash.com/1200x800/?cruise,ship,sea&sig=${idx}`;
    return {
      id: `cruise-mock-${idx}`,
      title: c,
      category: 'cruise',
      price: 4999 + (idx % 6) * 2500,
      duration: `${2 + (idx % 5)} Days / ${1 + (idx % 3)} Nights`,
      location: c.includes('Goa') ? 'Goa, India' : `${c.split(' ')[0]}, India`,
      description: `Experience the ${c} with comfortable amenities, scenic views, and curated experiences.`,
      images: [imageUrl],
      featured: idx === 0,
      rating: 4.5 - (idx % 4) * 0.1,
      review_count: 40 + (idx % 50),
      max_group_size: 30,
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
  } else if (activeCategory === 'trekking' || activeCategory === 'beach' || activeCategory === 'cruise') {
    // Merge real 'filtered' trekking packages with mock list, preferring real packages and avoiding duplicates
    const realIds = new Set((filtered || []).map((p) => p.id));

    // Show mocks for trekking/beach even if there are real packages with different ids.
    // Only hide mocks when user explicitly wants onlyAvailable.
    const missingMocks = onlyAvailable ? [] : (activeCategory === 'trekking' ? trekkingMockPackages : activeCategory === 'beach' ? beachMockPackages : cruiseMockPackages).filter((m) => !realIds.has(m.id));

    const list = [...(filtered || []), ...missingMocks];
    // Remove the real package titled 'Kudremukh Peak Trek' but keep the mock 'Kudremukh Trek'
    const filteredList = list.filter((p) => p.title !== 'Kudremukh Peak Trek' && p.title !== 'Udupi & Malpe Coast' && !( /Kumara Parvatha/i.test(p.title) && p.price === 5000 ));
    // Sort alphabetically by title
    filteredList.sort((a, b) => a.title.localeCompare(b.title));

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
          {filteredList.map((pkg, i) => {
            const batch = batchMap[pkg.id];
            const displayImage = pkg.category === 'beach' ? (pkg.images?.[0] || defaultImage) : resolveTrekImage(pkg.title, pkg.location, pkg.images?.[0] || defaultImage);
            return (
              <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/packages/${pkg.id}`} className="group block">
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
                    <div className="relative h-48 overflow-hidden">
                      <img src={displayImage} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      {pkg.featured && (
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
                      )}
                      <Badge variant="secondary" className="absolute top-3 right-3 capitalize">{pkg.category}</Badge>
                    </div>
                    <div className="p-5 space-y-3">
                      
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">{String(pkg.title).replace(/^#\s*/, '')}</h3>
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
            const displayImage = resolveTrekImage(pkg.title, pkg.location, pkg.images?.[0] || defaultImage);
            return (
              <motion.div key={pkg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/packages/${pkg.id}`} className="group block">
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
                    <div className="relative h-48 overflow-hidden">
                      <img src={displayImage} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      {pkg.featured && (
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
                      )}
                      <Badge variant="secondary" className="absolute top-3 right-3 capitalize">{pkg.category}</Badge>
                    </div>
                    <div className="p-5 space-y-3">
                      
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">{String(pkg.title).replace(/^#\s*/, '')}</h3>
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
      <SEO title="Travel Packages" description="Browse curated travel packages across India, trekking, resorts, corporate retreats, and party destinations." />
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
