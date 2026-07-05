import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { MapPin, Star, Clock, Users, ArrowLeft, CalendarIcon, Send, CheckCircle, Loader2, Phone, ChevronDown, Check, ShieldCheck, Zap, Info, Camera, Tent, Coffee, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewSection from "@/components/ReviewSection";
import SEO from "@/components/SEO";
import WeatherWidget from "@/components/WeatherWidget";
import { TREKKING_LOCATIONS, AGUMBE_TEMPLATE } from "@/lib/trekking";
import BEACHES from "@/data/beaches";
import cruiseImages from "@/data/cruiseImages";
import { Calendar } from "@/components/ui/calendar";
import useEmblaCarousel from "embla-carousel-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const localMockPackages: Record<string, any> = {
  "kerala-1": { id: "kerala-1", title: "Kerala Backwaters Retreat", category: "resort", price: 45000, duration: "5 days & 4 nights", location: "Kerala, India", description: "Experience the serenity of the Kerala backwaters on a traditional houseboat. Includes scenic tours and authentic local cuisine.", images: ["/assets/dest-kerala.jpg"], featured: true, rating: 4.9, review_count: 156, max_group_size: 15 },
  "kerala-2": { id: "kerala-2", title: "Munnar Hill Station Getaway", category: "resort", price: 35000, duration: "4 days & 3 nights", location: "Munnar, Kerala", description: "Escape to the beautiful tea gardens of Munnar with breathtaking views and cooling weather.", images: ["https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800"], featured: false, rating: 4.8, review_count: 92, max_group_size: 20 },
  "kerala-3": { id: "kerala-3", title: "Wayanad Nature Trail", category: "trekking", price: 42000, duration: "6 days & 5 nights", location: "Wayanad, Kerala", description: "A combination of wildlife sightings, spice plantations, and forest trails in Wayanad.", images: ["https://images.unsplash.com/photo-1593693397690-362cb9666d6c?q=80&w=800"], featured: false, rating: 4.7, review_count: 120, max_group_size: 12 },
  "raj-1": { id: "raj-1", title: "Royal Jaipur Experience", category: "heritage", price: 55000, duration: "6 days & 5 nights", location: "Jaipur, Rajasthan", description: "Live like royalty and explore the majestic forts and palaces of the Pink City.", images: ["https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800"], featured: true, rating: 4.8, review_count: 210, max_group_size: 25 },
  "raj-2": { id: "raj-2", title: "Udaipur Lakes & Palaces", category: "heritage", price: 48000, duration: "5 days & 4 nights", location: "Udaipur, Rajasthan", description: "Romantic getaways to the city of lakes, filled with spectacular heritage architecture.", images: ["https://images.unsplash.com/photo-1615836245337-f8e28cf69a1b?q=80&w=800"], featured: false, rating: 4.7, review_count: 184, max_group_size: 15 },
  "raj-3": { id: "raj-3", title: "Jaisalmer Desert Safari", category: "adventure", price: 38000, duration: "4 days & 3 nights", location: "Jaisalmer, Rajasthan", description: "Camp under the stars on golden sand dunes, enjoying folk music and desert safaris.", images: ["https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800"], featured: false, rating: 4.9, review_count: 95, max_group_size: 20 },
  
  "him-1": { id: "him-1", title: "Manali Snow Adventure", category: "adventure", price: 45000, duration: "6 days & 5 nights", location: "Manali, Himachal", description: "Thrilling snow activities, skiing, and breathtaking mountain views in Manali.", images: ["https://images.unsplash.com/photo-1605649487212-4dcb1b6b1833?q=80&w=800"], featured: true, rating: 4.8, review_count: 260, max_group_size: 20 },
  "him-2": { id: "him-2", title: "Shimla Valley Escape", category: "resort", price: 38000, duration: "5 days & 4 nights", location: "Shimla, Himachal", description: "A classic retreat to the queen of hills, complete with mall road walks and heritage stays.", images: ["https://images.unsplash.com/photo-1596894002674-0cd3422c5e53?q=80&w=800"], featured: false, rating: 4.6, review_count: 198, max_group_size: 25 },
  "him-3": { id: "him-3", title: "Spiti Valley Road Trip", category: "adventure", price: 65000, duration: "8 days & 7 nights", location: "Spiti Valley, Himachal", description: "An epic road trip through rugged terrains, ancient monasteries, and spectacular heights.", images: ["https://images.unsplash.com/photo-1618774797053-5353d26f6341?q=80&w=800"], featured: false, rating: 4.9, review_count: 112, max_group_size: 12 },
};

interface PackageData {
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
  included?: string[];
  excluded?: string[];
  itinerary?: any;
  pickup_points?: string[];
  things_to_carry?: string[];
  cancellation_policy?: string[];
  video_urls?: string[];
  video_captions?: string[];
}

interface Batch {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  max_capacity: number;
  current_count: number;
  price: number;
  status: string;
}

const PackageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Checkout states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutBatchId, setCheckoutBatchId] = useState<string | null>(null);
  const [travelerCount, setTravelerCount] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [useWallet, setUseWallet] = useState(false);
  
  const mockWalletBalance = 1500; // In a real app, fetch from profile
  const mockAddons = [
    { id: "a1", name: "Premium Travel Insurance", price: 299 },
    { id: "a2", name: "Offloading Backpack (Max 10kg)", price: 800 },
    { id: "a3", name: "Twin Sharing Tent Upgrade", price: 1200 },
  ];
  const [joiningBatch, setJoiningBatch] = useState<string | null>(null);
  const [customizingItinerary, setCustomizingItinerary] = useState(false);
  const [customItineraryResponse, setCustomItineraryResponse] = useState("");
  const [customItineraryRequest, setCustomItineraryRequest] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookingDrawerOpen, setBookingDrawerOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isVideoSrc = (src: string) => {
    if (!src) return false;
    const s = src.toLowerCase();
    return s.endsWith('.mp4') || s.includes('youtube.com') || s.includes('youtu.be') || s.includes('vimeo.com');
  };

  const toEmbedUrl = (src: string) => {
    const url = new URL(src, window.location.origin);
    const autoplay = '1';
    const mute = '1';
    if (src.includes('youtu.be')) {
      const id = url.pathname.replace('/', '');
      return `https://www.youtube.com/embed/${id}?autoplay=${autoplay}&mute=${mute}&playsinline=1&rel=0`;
    }
    if (src.includes('youtube.com/watch')) {
      const videoId = url.searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&mute=${mute}&playsinline=1&rel=0`;
    }
    if (src.includes('youtube.com/embed')) {
      const base = src.split('?')[0];
      return `${base}?autoplay=${autoplay}&mute=${mute}&playsinline=1&rel=0`;
    }
    if (src.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      return `https://player.vimeo.com/video/${id}?autoplay=${autoplay}&muted=${mute}&title=0&byline=0&portrait=0`;
    }
    return src;
  };

  const prevImage = () => goToMedia((currentImageIndex - 1 + galleryItems.length) % galleryItems.length);
  const nextImage = () => goToMedia((currentImageIndex + 1) % galleryItems.length);

  const goToMedia = (index: number) => {
    if (!galleryItems.length) return;
    const nextIndex = (index + galleryItems.length) % galleryItems.length;
    setCurrentImageIndex(nextIndex);
    emblaApi?.scrollTo(nextIndex);
  };

  useEffect(() => {
    if (!imageDialogOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') setImageDialogOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [imageDialogOpen]);

  useEffect(() => {
    if (!emblaApi) return;
    const syncSelectedIndex = () => {
      const selectedIndex = emblaApi.selectedScrollSnap();
      setCurrentImageIndex(selectedIndex);
    };
    syncSelectedIndex();
    emblaApi.on('select', syncSelectedIndex);
    return () => {
      emblaApi.off('select', syncSelectedIndex);
    };
  }, [emblaApi]);

  const handleCustomizeItinerary = async () => {
    if (!customItineraryRequest.trim()) return;
    setCustomizingItinerary(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/ai-recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          preferences: customItineraryRequest,
          promptContext: `You are customizing the itinerary for ${pkg?.title}. Base itinerary: ${JSON.stringify(pkg?.itinerary || [])}. Make it highly specific to the user's request.`
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCustomItineraryResponse(data.recommendation || data.text || "Here is your customized plan...");
    } catch (e) {
      toast.error("Failed to generate custom itinerary.");
    } finally {
      setCustomizingItinerary(false);
    }
  };

  useEffect(() => {
    if (id) fetchPackage();
  }, [id]);

  // Refresh when batches are seeded elsewhere
  useEffect(() => {
    const handler = () => {
      if (id) fetchPackage();
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
  }, [id]);

  const fetchPackage = async () => {
    const [pkgRes, batchRes] = await Promise.all([
      supabase.from("packages").select("*").eq("id", id!).single(),
      supabase.from("batches").select("*").eq("package_id", id!).eq("status", "open").order("start_date"),
    ]);

    if (id && localMockPackages[id]) {
      // If this mock package is the unwanted package, redirect away
      if (localMockPackages[id].title === 'Udupi & Malpe Coast') {
        navigate('/packages');
        setLoading(false);
        return;
      }
      setPkg(localMockPackages[id]);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(tomorrow);
      nextWeek.setDate(nextWeek.getDate() + 7);

      setBatches([
        {
          id: `batch-${id}-1`,
          title: "Upcoming Batch",
          start_date: tomorrow.toISOString(),
          end_date: nextWeek.toISOString(),
          max_capacity: localMockPackages[id].max_group_size || 20,
          current_count: 5,
          price: localMockPackages[id].price,
          status: "open",
        }
      ]);
      setLoading(false);
      return;
    }

    if (pkgRes.data) {
      // If upstream package is a beach package, redirect and do not show
      const upstreamPkg = pkgRes.data as PackageData;
      if (upstreamPkg.title === 'Udupi & Malpe Coast' || upstreamPkg.title === 'Gokarna Beach Bliss' || upstreamPkg.category === 'beach') {
        navigate('/packages');
        setLoading(false);
        return;
      }
      setPkg(upstreamPkg);
    } else if (id?.startsWith('mock-')) {
      // reconstruct mock package client-side — use the same filtered trekking list as Packages.tsx
      const idx = parseInt(id.replace('mock-', ''), 10);
      const trekkingLocations = TREKKING_LOCATIONS.filter((loc) => !/falls/i.test(loc));
      const loc = trekkingLocations[idx];
      if (loc) {
        if (loc === 'Agumbe') {
          setPkg({ ...AGUMBE_TEMPLATE, id } as PackageData);
        } else {
          setPkg({
            id,
            title: `${loc} Trek`,
            category: 'trekking',
            price: 4800,
            duration: '1 Day / 1 Night',
            location: `${loc}, India`,
            description: `Experience trekking at ${loc}.`,
            images: [],
            featured: false,
            rating: 4.3,
            review_count: 0,
            max_group_size: 12,
          } as PackageData);
        }
      }
    }
    else if (id?.startsWith('beach-mock-')) {
      // Reconstruct beach mock packages created in Packages.tsx
      const idx = parseInt(id.replace('beach-mock-', ''), 10);
      const b = BEACHES[idx];
      if (b) {
        setPkg({
          id,
          title: `${b.name} Getaway`,
          category: 'beach',
          price: 3999 + (idx % 4) * 1000,
          duration: `${2 + (idx % 3)} Days / ${1 + (idx % 2)} Nights`,
          location: b.location || b.name,
          description: b.short,
          images: [b.image],
          featured: idx === 0,
          rating: 4.5 - (idx % 3) * 0.1,
          review_count: Math.max(0, 50 - idx * 3),
          max_group_size: 20,
          itinerary: [],
        } as PackageData);
      }
    } else if (id?.startsWith('cruise-mock-')) {
      // Reconstruct cruise mock packages from CRUISES list
      const idx = parseInt(id.replace('cruise-mock-', ''), 10);
      const c = await import("@/data/cruises").then(m => m.default[idx]);
      if (c) {
        const imageUrl = cruiseImages[c] || `https://source.unsplash.com/1200x800/?cruise,ship,sea&sig=${idx}`;
        setPkg({
          id,
          title: c,
          category: 'cruise',
          price: 4999 + (idx % 6) * 2500,
          duration: `${2 + (idx % 5)} Days / ${1 + (idx % 3)} Nights`,
          location: c.includes('Goa') ? 'Goa, India' : `${c.split(' ')[0]}, India`,
          description: `Experience the ${c} with comfortable amenities and scenic views.`,
          images: [imageUrl],
          featured: idx === 0,
          rating: 4.5 - (idx % 4) * 0.1,
          review_count: 40 + (idx % 50),
          max_group_size: 30,
          itinerary: [],
        } as PackageData);
      }
    }
    if (batchRes.data) setBatches(batchRes.data as Batch[]);
    setLoading(false);
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("enquiries").insert({
      name: enquiryName,
      email: enquiryEmail,
      phone: enquiryPhone || null,
      message: enquiryMessage || null,
      source: "form",
      package_id: id,
      user_id: user?.id || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to send enquiry");
    } else {
      setSubmitted(true);
      toast.success("Enquiry sent! We'll get back to you soon.");
    }
  };

  const handleJoinBatch = (batchId: string) => {
    if (!user) {
      toast.error("Please sign in to join a batch");
      navigate("/login");
      return;
    }
    setCheckoutBatchId(batchId);
    setCheckoutStep(1);
    setTravelerCount(1);
    setSelectedAddons([]);
    setUseWallet(false);
    setShowCheckoutModal(true);
  };

  const processActualCheckout = async () => {
    if (!checkoutBatchId || !user || !pkg) return;
    setJoiningBatch(checkoutBatchId);
    
    try {
      const baseAmount = pkg.price * travelerCount;
      const addonsAmount = selectedAddons.reduce((sum, id) => {
        const addon = mockAddons.find(a => a.id === id);
        return sum + (addon ? addon.price : 0);
      }, 0) * travelerCount;
      
      const maxWalletDeduction = Math.min(mockWalletBalance, baseAmount + addonsAmount);
      const appliedWallet = useWallet ? maxWalletDeduction : 0;
      const finalAmount = Math.max(0, baseAmount + addonsAmount - appliedWallet);

      // Call edge function to create Stripe Session
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { 
          batchId: checkoutBatchId, 
          packageId: pkg.id,
          title: pkg.title,
          origin: window.location.origin,
          amount: finalAmount,
          travelerCount,
          addons: selectedAddons,
          useWallet,
          walletAmount: appliedWallet
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        // Fallback or 0 amount handling (free checkout via wallet)
        const { error: directError } = await supabase.rpc("checkout_batch", { 
          p_batch_id: checkoutBatchId, 
          p_user_id: user.id,
          p_travelers_count: travelerCount,
          p_addons: selectedAddons,
          p_wallet_used: appliedWallet,
          p_total_amount: finalAmount
        });
        
        if (directError) throw directError;

        toast.success("Successfully booked using wallet!");
        setShowCheckoutModal(false);
        fetchPackage();
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to process checkout");
    } finally {
      setJoiningBatch(null);
    }
  };

  const handleJoinWaitlist = async (batchId: string) => {
    if (!user) {
      toast.error("Please sign in to join the waitlist");
      navigate("/login");
      return;
    }
    setJoiningBatch(batchId);
    // Use 'any' type cast here for waitlists as typings might not be perfect
    const { error } = await (supabase.from("waitlists" as any) as any).insert({
      batch_id: batchId,
      user_id: user.id,
      status: 'waiting'
    });
    setJoiningBatch(null);
    if (error) {
      if (error.code === "23505") toast.error("You're already on the waitlist for this batch");
      else toast.error("Failed to join waitlist");
    } else {
      toast.success("Added to waitlist! We'll notify you if an opening becomes available.");
    }
  };

  const whatsappLink = pkg ? `https://wa.me/?text=${encodeURIComponent(`Hi! I'm interested in the "${pkg.title}" package. Can you share more details?`)}` : "#";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Package Not Found</h1>
          <Button asChild><Link to="/packages">Browse Packages</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const defaultImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80";
  const images = pkg.images?.length ? pkg.images : [defaultImage, "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80", "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&q=80"];
  const videoSources = pkg.video_urls || [];
  const galleryItems = [...images, ...videoSources];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={pkg.title}
        description={pkg.description || `Explore the ${pkg.title} package — ${pkg.duration} in ${pkg.location}. Starting at ₹${pkg.price.toLocaleString()}.`}
        ogImage={pkg.images?.[0]}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: pkg.title,
          description: pkg.description,
          image: pkg.images?.[0],
          offers: {
            "@type": "Offer",
            price: pkg.price,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
          },
        }}
      />
      <Navbar />

      {/* Thrillophilia style Hero Carousel */}
      <div className="relative h-[50vh] sm:h-[65vh] bg-neutral-900 group">
          <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((img, i) => (
               <div key={i} className="flex-[0_0_100%] min-w-0 relative h-full">
                 <img src={img} alt={`${pkg.title} - ${i}`} className="w-full h-full object-cover cursor-zoom-in" onClick={() => { setCurrentImageIndex(i); setImageDialogOpen(true); }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
               </div>
            ))}
          </div>
        </div>
          {/* Thumbnails removed as requested */}

        {/* Image Lightbox Dialog */}
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogContent className="sm:max-w-4xl p-0 bg-black/90">
            <div className="relative flex items-center justify-center">
              <button onClick={() => setImageDialogOpen(false)} className="absolute top-4 right-4 z-50 text-white bg-black/40 p-2 rounded-full">Close</button>
              <button onClick={prevImage} className="absolute left-4 z-50 text-white bg-black/40 p-2 rounded-full">‹</button>
              <button onClick={nextImage} className="absolute right-4 z-50 text-white bg-black/40 p-2 rounded-full">›</button>
              <div className="w-full max-h-[80vh] flex items-center justify-center">
                {isVideoSrc(images[currentImageIndex]) ? (
                  (images[currentImageIndex].includes('youtube.com') || images[currentImageIndex].includes('youtu.be')) ? (
                    <iframe title={`video-${currentImageIndex}`} src={images[currentImageIndex]} className="w-full h-[70vh]" frameBorder="0" allowFullScreen />
                  ) : (
                    <video src={images[currentImageIndex]} controls className="w-full h-[70vh] object-contain" />
                  )
                ) : (
                  <img src={images[currentImageIndex]} alt={`lightbox-${currentImageIndex}`} className="w-full h-[70vh] object-contain" />
                )}
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-white/90">
                <div className="text-sm font-medium">{pkg.title} — {currentImageIndex + 1}/{images.length}</div>
                <div className="text-xs mt-1">{images[currentImageIndex]}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="absolute top-24 left-0 right-0 z-10 px-4">
            <div className="container flex justify-between items-center">
              <Button variant="outline" size="sm" asChild className="bg-background/80 backdrop-blur-sm border-none shadow-sm hover:bg-background">
                <Link to="/packages">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="bg-background/80 backdrop-blur-sm border-none shadow-sm shadow-black/20 hover:bg-background">
                    <MapPin className="w-4 h-4 mr-2" /> View Map
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{pkg.title} Map Guide</DialogTitle>
                    <DialogDescription>
                      Tap any location below to open it in Google Maps.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 pt-2">
                    {pkg.key_locations && pkg.key_locations.length > 0 ? (
                      Object.entries(
                        pkg.key_locations.reduce<Record<string, typeof pkg.key_locations>>((groups, location) => {
                          if (!groups[location.day]) groups[location.day] = [];
                          groups[location.day].push(location);
                          return groups;
                        }, {})
                      ).map(([day, locations]) => (
                        <div key={day} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{day}</span>
                            <span className="h-px flex-1 bg-border" />
                          </div>
                          <div className="grid gap-3">
                            {locations.map((location, index) => (
                              <a
                                key={`${location.name}-${index}`}
                                href={location.map_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="font-heading font-semibold text-foreground">{location.name}</h4>
                                  </div>
                                  <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{location.description}</p>
                                <p className="mt-3 text-xs font-medium text-primary">Open in Google Maps</p>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No map locations are available for this package.</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 z-10">
          <div className="container">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary/90 text-primary-foreground border-none shadow-sm">Bestseller</Badge>
              {pkg.featured && <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-md border-none">Featured</Badge>}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white mb-4 drop-shadow-md">{pkg.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base font-medium drop-shadow-sm">
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm"><MapPin className="w-4 h-4" />{pkg.location}</span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm"><Clock className="w-4 h-4" />{pkg.duration}</span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm"><Users className="w-4 h-4" />Max {pkg.max_group_size || 20}</span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{pkg.rating || "4.8"} ({pkg.review_count || 0} Reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-10 relative items-start">
          <div className="lg:col-span-2 space-y-10">
            
            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-2xl bg-card/50">
              <div className="flex flex-col items-center gap-2 text-center p-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <span className="text-xs font-medium">Verified Operator</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center p-2">
                <Zap className="w-8 h-8 text-amber-500" />
                <span className="text-xs font-medium">Instant Confirmation</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center p-2">
                <Check className="w-8 h-8 text-green-500" />
                <span className="text-xs font-medium">Free Cancellation*</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center p-2">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="text-xs font-medium">15 looking right now</span>
              </div>
            </div>
            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">About This Package</h2>
              <p className="text-muted-foreground leading-relaxed font-body">{pkg.description || "Contact us for more details about this amazing travel package."}</p>
            </motion.div>

            {/* Included / Excluded */}
            {(pkg.included?.length > 0 || pkg.excluded?.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid sm:grid-cols-2 gap-6">
                {pkg.included?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-3">What's Included</h3>
                    <div className="space-y-2">
                      {pkg.included.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pkg.excluded?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-3">Not Included</h3>
                    <div className="space-y-2">
                      {pkg.excluded.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-4 h-4 flex items-center justify-center text-destructive font-bold flex-shrink-0">✕</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Itinerary */}
            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-heading font-semibold text-foreground">Itinerary</h3>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/5">
                        <Star className="w-3.5 h-3.5" /> Customize this itinerary
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>AI Assistant: Customize {pkg.title}</DialogTitle>
                        <DialogDescription>
                          Tell us what kind of experience you're looking for, and our AI will personalize the perfect itinerary for you!
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {!customItineraryResponse ? (
                          <>
                            <Textarea 
                              placeholder="e.g. Make it more focused on photography and relaxed walking..."
                              value={customItineraryRequest}
                              onChange={(e) => setCustomItineraryRequest(e.target.value)}
                              rows={4}
                            />
                            <Button className="w-full" onClick={handleCustomizeItinerary} disabled={customizingItinerary || !customItineraryRequest.trim()}>
                              {customizingItinerary ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Personalization"}
                            </Button>
                          </>
                        ) : (
                          <div className="bg-muted p-4 rounded-xl text-sm whitespace-pre-wrap">
                            {customItineraryResponse}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative pl-6 ml-3 md:ml-4 border-l-2 border-border/80 space-y-6 mt-6">
                  {pkg.itinerary.map((day: any, di: number) => (
                    <div key={di} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border-2 border-background">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      </div>

                      <details className="bg-card border border-border rounded-xl p-0 overflow-hidden group [&_summary::-webkit-details-marker]:hidden" open={di === 0}>
                        <summary className="flex items-center justify-between cursor-pointer p-5 bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            <span className="font-heading font-bold text-primary min-w-[60px]">{day.day || `Day ${di + 1}`}</span>
                            <span className="text-lg font-medium text-foreground group-open:text-primary transition-colors">{day.title || day.day}</span>
                          </div>
                          <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="p-5 pt-3 border-t border-border/50 text-muted-foreground">
                          <ul className="space-y-3">
                            {day.details.map((d: string, ii: number) => (
                              <li key={ii} className="flex gap-3 text-sm md:text-base leading-relaxed">
                                <CheckCircle className="w-4 h-4 text-primary/60 mt-1 flex-shrink-0" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-5 flex gap-4 border-t border-border/50 pt-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-secondary/50 px-2.5 py-1.5 rounded-md">
                              <Coffee className="w-3.5 h-3.5 text-amber-600" /> Meals Included
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-secondary/50 px-2.5 py-1.5 rounded-md">
                              <Tent className="w-3.5 h-3.5 text-emerald-600" /> Stay Included
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ReviewSection destination={pkg.title} />
            </motion.div>
          </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-4 sticky top-24 self-start">
              <div className="bg-card rounded-2xl border-2 border-primary/10 shadow-lg p-6 space-y-6">
                <div>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-3xl font-heading font-black text-foreground">₹{pkg.price.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm pb-1">/ person</span>
                  </div>
                  <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Available for instant booking
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button className="w-full text-lg h-12 gap-2" size="lg" onClick={() => {
                    document.getElementById('batches')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Check Availability & Book
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full text-zinc-600 border-zinc-200">
                        Send an Enquiry instead
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Enquiry</DialogTitle>
                        <DialogDescription>We will get back to you within 24 hours.</DialogDescription>
                      </DialogHeader>
                      {submitted ? (
                        <div className="text-center py-6 space-y-3">
                          <CheckCircle className="w-12 h-12 text-primary mx-auto" />
                          <h4 className="font-heading font-semibold text-foreground">Enquiry Sent!</h4>
                          <p className="text-sm text-muted-foreground">We'll contact you shortly.</p>
                          <Button variant="outline" onClick={() => setSubmitted(false)}>Send Another</Button>
                        </div>
                      ) : (
                        <form onSubmit={handleEnquiry} className="space-y-3 mt-4">
                          <Input placeholder="Your Name *" value={enquiryName} onChange={(e) => setEnquiryName(e.target.value)} required />
                          <Input placeholder="Email *" type="email" value={enquiryEmail} onChange={(e) => setEnquiryEmail(e.target.value)} required />
                          <Input placeholder="Phone (optional)" value={enquiryPhone} onChange={(e) => setEnquiryPhone(e.target.value)} />
                          <Textarea placeholder="Message..." value={enquiryMessage} onChange={(e) => setEnquiryMessage(e.target.value)} rows={3} />
                          <Button type="submit" className="w-full gap-2" disabled={submitting}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Send Enquiry
                          </Button>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="pt-4 border-t border-border flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2 border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800" asChild>
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <Phone className="w-4 h-4" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    No hidden fees • Secure payment
                  </div>
                </div>
              </div>

              {pkg.location && <WeatherWidget location={pkg.location.split(",")[0].trim()} />}

            {/* Sidebar Details: Pickup, Carry List, Cancellation */}
            {(pkg.pickup_points || pkg.things_to_carry || pkg.cancellation_policy) && (
              <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
                {pkg.pickup_points && pkg.pickup_points.length > 0 && (
                  <div>
                    <h4 className="font-heading font-semibold text-foreground flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" /> Pickup Points
                    </h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      {pkg.pickup_points.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                )}
                {pkg.things_to_carry && pkg.things_to_carry.length > 0 && (
                  <div>
                    <h4 className="font-heading font-semibold text-foreground mb-2">Things To Carry</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      {pkg.things_to_carry.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                )}
                {pkg.cancellation_policy && pkg.cancellation_policy.length > 0 && (
                  <div>
                    <h4 className="font-heading font-semibold text-foreground mb-2">Cancellation Policy</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      {pkg.cancellation_policy.map((rule, i) => <li key={i}>{rule}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex items-center justify-center sm:hidden px-4">
        <div className="w-full max-w-3xl bg-card/95 backdrop-blur-md border border-border rounded-full p-2 flex gap-3 items-center shadow-lg">
          <Button className="flex-1 h-12" onClick={() => { document.getElementById('batches')?.scrollIntoView({ behavior: 'smooth' }); }}>Book Now</Button>
          <Button variant="outline" className="h-12 w-12 p-0" asChild>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"><Phone className="w-5 h-5" /></a>
          </Button>
        </div>
      </div>

      {/* Multi-Step Checkout Dialog */}
      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-card border-border shadow-2xl">
          <div className="bg-muted px-6 py-4 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-lg font-heading font-bold text-foreground">Complete Booking</h2>
              <p className="text-sm text-muted-foreground">{pkg?.title}</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Step {checkoutStep} of 3</div>
              <div className="flex gap-1">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`h-1.5 w-6 rounded-full ${step <= checkoutStep ? 'bg-primary' : 'bg-border'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {checkoutStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in-0 duration-300">
                <div>
                  <h3 className="text-xl font-heading font-semibold mb-2">Traveler Details</h3>
                  <p className="text-sm text-muted-foreground mb-4">How many people are going on this trip?</p>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <span className="font-medium">Number of Travelers</span>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setTravelerCount(Math.max(1, travelerCount - 1))}>-</Button>
                      <span className="font-heading font-bold w-4 text-center">{travelerCount}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setTravelerCount(travelerCount + 1)}>+</Button>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-12 text-lg mt-4" onClick={() => setCheckoutStep(2)}>Continue to Add-ons</Button>
              </div>
            )}

            {checkoutStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in-0 duration-300">
                <div>
                  <h3 className="text-xl font-heading font-semibold mb-2">Enhance your trip</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add these optional upgrades to your booking.</p>
                  
                  <div className="space-y-3">
                    {mockAddons.map(addon => {
                      const isSelected = selectedAddons.includes(addon.id);
                      return (
                        <div 
                          key={addon.id} 
                          className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                            } else {
                              setSelectedAddons([...selectedAddons, addon.id]);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <span className="font-medium text-sm">{addon.name}</span>
                          </div>
                          <span className="font-heading font-semibold text-sm">+₹{addon.price * travelerCount}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button variant="outline" className="flex-1 h-12" onClick={() => setCheckoutStep(1)}>Back</Button>
                  <Button className="flex-[2] h-12 text-lg" onClick={() => setCheckoutStep(3)}>Proceed to Payment</Button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && pkg && (
              <div className="space-y-6 animate-in slide-in-from-right-4 fade-in-0 duration-300">
                <div>
                  <h3 className="text-xl font-heading font-semibold mb-4">Review & Pay</h3>
                  
                  <div className="bg-muted rounded-xl p-4 space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Price ({travelerCount} traveler{travelerCount > 1 ? 's' : ''})</span>
                      <span className="font-medium">₹{(pkg.price * travelerCount).toLocaleString()}</span>
                    </div>
                    {selectedAddons.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Add-ons Total</span>
                        <span className="font-medium">
                          ₹{(selectedAddons.reduce((sum, id) => {
                            const addon = mockAddons.find(a => a.id === id);
                            return sum + (addon ? addon.price : 0);
                          }, 0) * travelerCount).toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t border-border pt-3 mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Wallet className="w-4 h-4 text-primary" /> Use Wallet Balance (₹{mockWalletBalance})
                        </span>
                        <div 
                          className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${useWallet ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                          onClick={() => setUseWallet(!useWallet)}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${useWallet ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>
                      {useWallet && (
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                          <span>Wallet Deduction</span>
                          <span>-₹{Math.min(mockWalletBalance, (pkg.price * travelerCount) + (selectedAddons.reduce((sum, id) => {
                            const addon = mockAddons.find(a => a.id === id);
                            return sum + (addon ? addon.price : 0);
                          }, 0) * travelerCount)).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-3 mt-3 flex justify-between items-end">
                      <span className="font-heading font-semibold">Total Payable</span>
                      <span className="text-2xl font-heading font-black text-primary">
                        ₹{Math.max(0, 
                          (pkg.price * travelerCount) + 
                          (selectedAddons.reduce((sum, id) => {
                            const addon = mockAddons.find(a => a.id === id);
                            return sum + (addon ? addon.price : 0);
                          }, 0) * travelerCount) - 
                          (useWallet ? mockWalletBalance : 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> Secure encrypted payment processing
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12" onClick={() => setCheckoutStep(2)}>Back</Button>
                  <Button 
                    className="flex-[2] h-12 text-lg gap-2" 
                    onClick={processActualCheckout}
                    disabled={!!joiningBatch}
                  >
                    {joiningBatch ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PackageDetail;
