import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, Save, Loader2, Award, Share2, Copy, Wallet, History, Settings, ChevronRight, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MyBookings from "@/components/MyBookings";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);
  const [referralCode, setReferralCode] = useState<string>("");
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) fetchProfile();
  }, [user, authLoading]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .single();

    if (data) {
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url);
      setBadges(data.badges || ["Monsoon Trekker", "Early Bird"]); // Mocking if undefined from local un-pushed schema
      setReferralCode(data.referral_code || `TRAV-${user!.id.slice(0, 5).toUpperCase()}`);
      setTotalReferrals(data.total_referrals || 0);
      setWalletBalance((data as any).wallet_balance || Math.floor(Math.random() * 1500) + 500); // Mocking wallet balance
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user!.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload avatar");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("user_id", user!.id);

    if (updateError) {
      toast.error("Failed to update profile");
    } else {
      setAvatarUrl(newUrl);
      toast.success("Avatar updated!");
    }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("user_id", user!.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated!");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4 bg-muted/20">
        <div className="container max-w-4xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground tracking-tight">Welcome back, {displayName || 'Traveler'}</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your bookings, wallet, and settings.</p>
            </div>
            {/* Quick Wallet Summary Pill */}
            <div className="bg-primary/10 text-primary border border-primary/20 px-5 py-3 rounded-2xl flex items-center gap-4 self-start md:self-auto shadow-sm">
              <div className="bg-primary/20 p-2 rounded-full">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider opacity-80">Travyntra Cash</div>
                <div className="text-xl font-black">₹{walletBalance.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="bookings" className="space-y-8">
            <TabsList className="bg-card border border-border shadow-sm rounded-xl p-1 h-auto grid grid-cols-3 max-w-md w-full">
              <TabsTrigger value="bookings" className="py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Bookings</TabsTrigger>
              <TabsTrigger value="wallet" className="py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Wallet</TabsTrigger>
              <TabsTrigger value="profile" className="py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Profile</TabsTrigger>
            </TabsList>

            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-8">
                {/* Avatar */}
                <div className="flex flex-col items-start sm:flex-row gap-6 mb-8 pb-8 border-b border-border">
                  <div className="relative group flex-shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-secondary border-4 border-background shadow-md">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground bg-primary/5">
                          {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 border-2 border-background"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-heading">{displayName}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <Badge variant="secondary" className="mt-3 bg-amber-500/10 text-amber-700 border-amber-500/20">Explorer Level</Badge>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSave} className="space-y-5 max-w-xl">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="email" className="text-muted-foreground">Registered Email</Label>
                      <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted text-muted-foreground border-transparent" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Your full name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="bio">Travel Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Where do you want to go next?"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="bg-background resize-none"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="gap-2" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* BOOKINGS TAB */}
            <TabsContent value="bookings" className="outline-none">
              <MyBookings />
            </TabsContent>

            {/* WALLET & REWARDS TAB */}
            <TabsContent value="wallet" className="space-y-6">
              <div className="grid md:grid-cols-5 gap-6">
                
                {/* Main Wallet Card */}
                <div className="md:col-span-3 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl shadow-card p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                    <div>
                      <div className="text-zinc-400 font-medium tracking-wide text-sm flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4" /> AVAILABLE BALANCE
                      </div>
                      <div className="text-5xl font-black tracking-tight">₹{walletBalance.toLocaleString()}</div>
                      <p className="text-zinc-400 text-sm mt-3">Can be used fully on your next booking during checkout.</p>
                    </div>

                    <div className="flex gap-3">
                      <Button className="bg-white text-zinc-900 hover:bg-zinc-200">Recharge</Button>
                      <Button variant="outline" className="border-zinc-700 text-black hover:bg-white hover:text-black">View History</Button>
                    </div>
                  </div>
                </div>

                {/* Refer and Earn */}
                <div className="md:col-span-2 bg-card rounded-2xl border border-border shadow-card p-6 flex flex-col justify-center">
                  <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2">Refer & Earn ₹500</h3>
                  <p className="text-sm text-muted-foreground mb-6">Invite friends to Travyntra. They get ₹250 off their first trip, and you get ₹500 in your wallet!</p>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Code</Label>
                    <div className="flex gap-2">
                      <Input value={referralCode} readOnly className="bg-muted font-mono tracking-wider font-bold" />
                      <Button variant="default" onClick={() => {
                        navigator.clipboard.writeText(`Use my code ${referralCode} to get ₹250 off on Travyntra!`);
                        toast.success("Referral link copied!");
                      }}><Share2 className="w-4 h-4 mr-2" /> Share</Button>
                    </div>
                  </div>
                </div>
                
                {/* Badges / Gamification */}
                <div className="md:col-span-5 bg-card rounded-2xl border border-border shadow-card p-6">
                  <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" /> My Achievements
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {badges.map((b, i) => (
                      <div key={i} className="flex flex-col items-center justify-center p-4 border border-border/50 bg-secondary/30 rounded-xl gap-3 text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-200 to-amber-500 p-0.5 shadow-sm">
                          <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                            <Award className="w-6 h-6 text-amber-500" />
                          </div>
                        </div>
                        <span className="font-semibold text-sm font-heading">{b}</span>
                      </div>
                    ))}
                    <div className="flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-xl gap-3 text-center opacity-60 grayscale">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Award className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <span className="font-semibold text-sm font-heading">Himalayan Hero</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Locked</span>
                    </div>
                  </div>
                </div>

              </div>
            </TabsContent>
          </Tabs>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
