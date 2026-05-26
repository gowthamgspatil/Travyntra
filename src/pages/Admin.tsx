import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Loader2, Users, MapPin, Star, DollarSign, BarChart3, Shield, Package, MessageSquare, Building2, Layers, Settings, Plus, Trash2, Save, X, CalendarDays, TrendingUp } from "lucide-react";
import BookingCalendar from "@/components/admin/BookingCalendar";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import ImageUpload from "@/components/admin/ImageUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  new: "bg-blue-100 text-blue-800 border-blue-200",
  responded: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-muted text-muted-foreground border-border",
};

type Tab = "overview" | "analytics" | "bookings" | "calendar" | "reviews" | "packages" | "enquiries" | "resorts" | "services" | "content";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [resorts, setResorts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/login"); return; }
    if (user) checkAdmin();
  }, [user, authLoading]);

  const checkAdmin = async () => {
    const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
    if (data) { setIsAdmin(true); fetchAllData(); } else { setIsAdmin(false); }
    setChecking(false);
  };

  const fetchAllData = async () => {
    const [b, r, p, e, res, s, c] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("packages").select("*").order("created_at", { ascending: false }),
      supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("resorts").select("*").order("name"),
      supabase.from("services").select("*").order("created_at"),
      supabase.from("site_content").select("*").order("section"),
    ]);
    if (b.data) setBookings(b.data);
    if (r.data) setReviews(r.data);
    if (p.data) setPackages(p.data);
    if (e.data) setEnquiries(e.data);
    if (res.data) setResorts(res.data);
    if (s.data) setServices(s.data);
    if (c.data) setSiteContent(c.data);
    setLoading(false);
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error("Failed"); else { toast.success(`Status updated`); setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b)); }
  };

  const updateEnquiryStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Updated"); setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e)); }
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Review deleted"); setReviews(prev => prev.filter(r => r.id !== id)); }
  };

  // Generic CRUD for packages/resorts/services
  const saveItem = async (table: string, data: any, isNew: boolean) => {
    setSaving(true);
    const { id, ...rest } = data;
    let result;
    if (isNew) {
      result = await (supabase.from(table as any) as any).insert(rest).select().single();
    } else {
      result = await (supabase.from(table as any) as any).update(rest).eq("id", id).select().single();
    }
    setSaving(false);
    if (result.error) { toast.error("Failed to save"); return; }
    toast.success("Saved!");
    setShowForm(false);
    fetchAllData();
  };

  const seedOpenBatches = async () => {
    if (!user) { toast.error('No user'); return; }
    setSaving(true);
    try {
      const sample = packages.slice(0, 6);
      const inserts = sample.map((p, i) => ({
        package_id: p.id,
        start_date: new Date(Date.now() + (7 * (i + 1)) * 24 * 60 * 60 * 1000).toISOString(),
        max_capacity: p.max_group_size || 20,
        current_count: 0,
        status: 'open',
        created_by: user.id,
      }));
      const { error } = await supabase.from('batches').insert(inserts);
      if (error) { toast.error('Seeding batches failed'); } else { toast.success('Seeded open batches'); fetchAllData(); }
      if (!error) {
        // notify other pages to refresh
        try { window.dispatchEvent(new Event('batches:seeded')); } catch (e) {}
        try { new BroadcastChannel('sync-channel').postMessage('batches:seeded'); } catch (e) {}
      }
    } finally { setSaving(false); }
  };

  const deleteItem = async (table: string, id: string) => {
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", id);
    if (error) toast.error("Failed"); else { toast.success("Deleted"); fetchAllData(); }
  };

  const saveSiteContent = async (section: string, content: any) => {
    setSaving(true);
    const existing = siteContent.find(c => c.section === section);
    if (existing) {
      await supabase.from("site_content").update({ content, updated_by: user!.id }).eq("id", existing.id);
    } else {
      await supabase.from("site_content").insert({ section, content, updated_by: user!.id });
    }
    setSaving(false);
    toast.success("Content saved!");
    fetchAllData();
  };

  if (authLoading || checking) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have admin privileges.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const totalBookings = bookings.length;
  const paidBookings = bookings.filter(b => b.status === "paid").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";
  const revenue = bookings.reduce((sum, b) => b.status === "paid" ? sum + (b.total_amount || b.price || 0) : sum, 0); // Mock revenue logic
  const topDestinations = Object.entries(bookings.reduce((acc: Record<string, number>, b) => { acc[b.destination] = (acc[b.destination] || 0) + 1; return acc; }, {})).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 5);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "bookings", label: "Bookings", icon: DollarSign },
    { id: "packages", label: "Packages", icon: Package },
    { id: "enquiries", label: "Enquiries", icon: MessageSquare },
    { id: "resorts", label: "Resorts", icon: Building2 },
    { id: "services", label: "Services", icon: Layers },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "content", label: "Content", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-heading font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Revenue", value: `₹${(revenue || 0).toLocaleString()}`, icon: DollarSign, trend: "+12%" },
            { label: "Bookings", value: totalBookings, icon: BarChart3, trend: "+5%" },
            { label: "Active Users", value: paidBookings + pendingBookings, icon: Users, trend: "+18%" },
            { label: "Packages", value: packages.length, icon: Package, trend: "0%" },
            { label: "Enquiries", value: enquiries.length, icon: MessageSquare, trend: "-2%" },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="w-16 h-16" />
              </div>
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              </div>
              <div className="flex items-end gap-3 mt-4 relative z-10">
                <p className="text-3xl font-heading font-extrabold text-foreground">{stat.value}</p>
                <span className={`text-xs font-semibold mb-1 ${stat.trend.startsWith('+') ? 'text-green-500' : stat.trend.startsWith('-') ? 'text-red-500' : 'text-zinc-500'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-6 border-b border-border pb-3">
          {tabs.map(tab => (
            <Button key={tab.id} variant={activeTab === tab.id ? "default" : "ghost"} size="sm" onClick={() => { setActiveTab(tab.id); setShowForm(false); }} className="gap-1.5">
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-heading font-semibold text-foreground mb-4">Top Destinations</h3>
                  <div className="space-y-3">
                    {topDestinations.map(([dest, count], i) => (
                      <div key={dest} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{dest}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{count as number}</span>
                      </div>
                    ))}
                    {topDestinations.length === 0 && <p className="text-sm text-muted-foreground">No bookings yet</p>}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-heading font-semibold text-foreground mb-4">Recent Enquiries</h3>
                  <div className="space-y-3">
                    {enquiries.slice(0, 5).map(e => (
                      <div key={e.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{e.name}</p>
                          <p className="text-xs text-muted-foreground">{e.email}</p>
                        </div>
                        <Badge className={`text-xs ${statusColors[e.status] || ""}`}>{e.status}</Badge>
                      </div>
                    ))}
                    {enquiries.length === 0 && <p className="text-sm text-muted-foreground">No enquiries yet</p>}
                  </div>
                </div>
              </div>
            )}

            {/* CALENDAR */}
            {activeTab === "analytics" && <AnalyticsDashboard />}

            {/* CALENDAR */}
            {activeTab === "calendar" && <BookingCalendar />}

            {/* BOOKINGS */}
            {activeTab === "bookings" && (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-heading font-semibold text-foreground">{b.destination}</span>
                        <Badge className={`text-xs capitalize ${statusColors[b.status] || ""}`}>{b.status}</Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Travel: {format(new Date(b.travel_date), "MMM d, yyyy")}</span>
                        <span>Group: {b.group_size}</span>
                      </div>
                    </div>
                    <Select value={b.status} onValueChange={val => updateBookingStatus(b.id, val)}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["pending", "confirmed", "paid", "cancelled"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-center text-muted-foreground py-8">No bookings</p>}
              </div>
            )}

            {/* PACKAGES */}
            {activeTab === "packages" && (
              <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={() => { setFormData({ title: "", category: "karnataka", price: 0, duration: "1 Day", location: "", description: "", images: [], featured: false, included: [], excluded: [] }); setShowForm(true); }} className="gap-2">
                      <Plus className="w-4 h-4" /> Add Package
                    </Button>
                    <Button variant="outline" onClick={seedOpenBatches} className="gap-2">Seed Open Batches</Button>
                  </div>
                {showForm && (
                  <PackageForm data={formData} onChange={setFormData} onSave={() => saveItem("packages", formData, !formData.id)} onCancel={() => setShowForm(false)} saving={saving} />
                )}
                <div className="space-y-3">
                  {packages.map(p => (
                    <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold text-foreground">{p.title}</span>
                          <Badge variant="secondary" className="capitalize text-xs">{p.category}</Badge>
                          {p.featured && <Badge className="bg-primary/10 text-primary text-xs">Featured</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.location} · {p.duration} · ₹{p.price.toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setFormData(p); setShowForm(true); }}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteItem("packages", p.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ENQUIRIES */}
            {activeTab === "enquiries" && (
              <div className="space-y-3">
                {enquiries.map(e => (
                  <div key={e.id} className="bg-card border border-border rounded-xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-heading font-semibold text-foreground">{e.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">{e.email}</span>
                        {e.phone && <span className="text-sm text-muted-foreground ml-2">· {e.phone}</span>}
                      </div>
                      <Select value={e.status} onValueChange={val => updateEnquiryStatus(e.id, val)}>
                        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["new", "responded", "closed"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {e.message && <p className="text-sm text-muted-foreground">{e.message}</p>}
                    <p className="text-xs text-muted-foreground/60">Source: {e.source} · {format(new Date(e.created_at), "MMM d, yyyy")}</p>
                  </div>
                ))}
                {enquiries.length === 0 && <p className="text-center text-muted-foreground py-8">No enquiries</p>}
              </div>
            )}

            {/* RESORTS */}
            {activeTab === "resorts" && (
              <div className="space-y-4">
                <Button onClick={() => { setFormData({ name: "", location: "", description: "", images: [], contact: "", website: "", is_partner: false, amenities: [], price_range: "" }); setShowForm(true); }} className="gap-2">
                  <Plus className="w-4 h-4" /> Add Resort
                </Button>
                {showForm && (
                  <ResortForm data={formData} onChange={setFormData} onSave={() => saveItem("resorts", formData, !formData.id)} onCancel={() => setShowForm(false)} saving={saving} />
                )}
                <div className="space-y-3">
                  {resorts.map(r => (
                    <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-semibold text-foreground">{r.name}</span>
                          {r.is_partner && <Badge className="bg-primary/10 text-primary text-xs">Partner</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{r.location}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setFormData(r); setShowForm(true); }}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteItem("resorts", r.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SERVICES */}
            {activeTab === "services" && (
              <div className="space-y-4">
                <Button onClick={() => { setFormData({ type: "vehicle", title: "", description: "", image: "", price_range: "", features: [] }); setShowForm(true); }} className="gap-2">
                  <Plus className="w-4 h-4" /> Add Service
                </Button>
                {showForm && (
                  <ServiceForm data={formData} onChange={setFormData} onSave={() => saveItem("services", formData, !formData.id)} onCancel={() => setShowForm(false)} saving={saving} />
                )}
                <div className="space-y-3">
                  {services.map(s => (
                    <div key={s.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <span className="font-heading font-semibold text-foreground">{s.title}</span>
                        <Badge variant="secondary" className="capitalize text-xs ml-2">{s.type}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setFormData(s); setShowForm(true); }}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteItem("services", s.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-heading font-semibold text-foreground">{r.destination}</span>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />)}</div>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                      <p className="text-xs text-muted-foreground/60">{format(new Date(r.created_at), "MMM d, yyyy")}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteReview(r.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-center text-muted-foreground py-8">No reviews</p>}
              </div>
            )}

            {/* CONTENT */}
            {activeTab === "content" && (
              <ContentEditor content={siteContent} onSave={saveSiteContent} saving={saving} />
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

// Sub-components for forms
const PackageForm = ({ data, onChange, onSave, onCancel, saving }: any) => (
  <div className="bg-card border border-border rounded-xl p-5 space-y-4">
    <h3 className="font-heading font-semibold text-foreground">{data.id ? "Edit" : "Add"} Package</h3>
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-1.5"><Label>Title *</Label><Input value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Category</Label>
        <Select value={data.category} onValueChange={v => onChange({ ...data, category: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["karnataka", "trekking", "resort", "corporate", "party"].map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5"><Label>Price (₹)</Label><Input type="number" value={data.price} onChange={e => onChange({ ...data, price: Number(e.target.value) })} /></div>
      <div className="space-y-1.5"><Label>Duration</Label><Input value={data.duration} onChange={e => onChange({ ...data, duration: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Location *</Label><Input value={data.location} onChange={e => onChange({ ...data, location: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Max Group Size</Label><Input type="number" value={data.max_group_size || 20} onChange={e => onChange({ ...data, max_group_size: Number(e.target.value) })} /></div>
    </div>
    <div className="space-y-1.5"><Label>Description</Label><Textarea value={data.description || ""} onChange={e => onChange({ ...data, description: e.target.value })} rows={3} /></div>
    <div className="space-y-1.5">
      <Label>Images</Label>
      <ImageUpload images={data.images || []} onChange={imgs => onChange({ ...data, images: imgs })} folder="packages" />
    </div>
    <div className="space-y-1.5"><Label>Included (comma-separated)</Label><Input value={(data.included || []).join(", ")} onChange={e => onChange({ ...data, included: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></div>
    <div className="space-y-1.5"><Label>Excluded (comma-separated)</Label><Input value={(data.excluded || []).join(", ")} onChange={e => onChange({ ...data, excluded: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></div>
    <div className="flex items-center gap-2">
      <input type="checkbox" checked={data.featured} onChange={e => onChange({ ...data, featured: e.target.checked })} id="featured" />
      <Label htmlFor="featured">Featured</Label>
    </div>
    <div className="flex gap-2">
      <Button onClick={onSave} disabled={saving} className="gap-2"><Save className="w-4 h-4" />{saving ? "Saving..." : "Save"}</Button>
      <Button variant="outline" onClick={onCancel}><X className="w-4 h-4" /></Button>
    </div>
  </div>
);

const ResortForm = ({ data, onChange, onSave, onCancel, saving }: any) => (
  <div className="bg-card border border-border rounded-xl p-5 space-y-4">
    <h3 className="font-heading font-semibold text-foreground">{data.id ? "Edit" : "Add"} Resort</h3>
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-1.5"><Label>Name *</Label><Input value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Location *</Label><Input value={data.location} onChange={e => onChange({ ...data, location: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Contact</Label><Input value={data.contact || ""} onChange={e => onChange({ ...data, contact: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Website</Label><Input value={data.website || ""} onChange={e => onChange({ ...data, website: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Price Range</Label><Input value={data.price_range || ""} onChange={e => onChange({ ...data, price_range: e.target.value })} /></div>
    </div>
    <div className="space-y-1.5"><Label>Description</Label><Textarea value={data.description || ""} onChange={e => onChange({ ...data, description: e.target.value })} rows={3} /></div>
    <div className="space-y-1.5">
      <Label>Images</Label>
      <ImageUpload images={data.images || []} onChange={imgs => onChange({ ...data, images: imgs })} folder="resorts" />
    </div>
    <div className="space-y-1.5"><Label>Amenities (comma-separated)</Label><Input value={(data.amenities || []).join(", ")} onChange={e => onChange({ ...data, amenities: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></div>
    <div className="flex items-center gap-2">
      <input type="checkbox" checked={data.is_partner} onChange={e => onChange({ ...data, is_partner: e.target.checked })} id="partner" />
      <Label htmlFor="partner">Partner Resort</Label>
    </div>
    <div className="flex gap-2">
      <Button onClick={onSave} disabled={saving} className="gap-2"><Save className="w-4 h-4" />{saving ? "Saving..." : "Save"}</Button>
      <Button variant="outline" onClick={onCancel}><X className="w-4 h-4" /></Button>
    </div>
  </div>
);

const ServiceForm = ({ data, onChange, onSave, onCancel, saving }: any) => (
  <div className="bg-card border border-border rounded-xl p-5 space-y-4">
    <h3 className="font-heading font-semibold text-foreground">{data.id ? "Edit" : "Add"} Service</h3>
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-1.5"><Label>Title *</Label><Input value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} /></div>
      <div className="space-y-1.5"><Label>Type</Label>
        <Select value={data.type} onValueChange={v => onChange({ ...data, type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["vehicle", "stay", "contracting"].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5"><Label>Price Range</Label><Input value={data.price_range || ""} onChange={e => onChange({ ...data, price_range: e.target.value })} /></div>
      <div className="space-y-1.5">
        <Label>Image</Label>
        <ImageUpload images={data.image ? [data.image] : []} onChange={imgs => onChange({ ...data, image: imgs[0] || "" })} folder="services" multiple={false} />
      </div>
    </div>
    <div className="space-y-1.5"><Label>Description</Label><Textarea value={data.description || ""} onChange={e => onChange({ ...data, description: e.target.value })} rows={3} /></div>
    <div className="space-y-1.5"><Label>Features (comma-separated)</Label><Input value={(data.features || []).join(", ")} onChange={e => onChange({ ...data, features: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></div>
    <div className="flex gap-2">
      <Button onClick={onSave} disabled={saving} className="gap-2"><Save className="w-4 h-4" />{saving ? "Saving..." : "Save"}</Button>
      <Button variant="outline" onClick={onCancel}><X className="w-4 h-4" /></Button>
    </div>
  </div>
);

const ContentEditor = ({ content, onSave, saving }: { content: any[]; onSave: (section: string, data: any) => void; saving: boolean }) => {
  const sections = ["about", "vision", "mission", "hero"];
  const [editSection, setEditSection] = useState("");
  const [editData, setEditData] = useState<{ title: string; body: string }>({ title: "", body: "" });

  const startEdit = (section: string) => {
    const existing = content.find(c => c.section === section);
    setEditSection(section);
    setEditData(existing?.content || { title: "", body: "" });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-foreground">Edit Homepage Content</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {sections.map(section => {
          const existing = content.find(c => c.section === section);
          return (
            <div key={section} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h4 className="font-heading font-medium text-foreground capitalize">{section}</h4>
              {editSection === section ? (
                <div className="space-y-3">
                  <Input placeholder="Title" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} />
                  <Textarea placeholder="Content..." value={editData.body} onChange={e => setEditData({ ...editData, body: e.target.value })} rows={4} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { onSave(section, editData); setEditSection(""); }} disabled={saving}><Save className="w-3.5 h-3.5 mr-1" />Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditSection("")}><X className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{existing?.content?.title || "Not set"}</p>
                  <p className="text-xs text-muted-foreground/60 line-clamp-2">{existing?.content?.body || ""}</p>
                  <Button size="sm" variant="outline" onClick={() => startEdit(section)}>Edit</Button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Admin;
