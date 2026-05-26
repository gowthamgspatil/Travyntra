import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search, User, ChevronDown, LogOut, Heart, MapPin, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { TREKKING_LOCATIONS } from "@/lib/trekking";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Packages", href: "/packages" },
  { label: "AI Picks", href: "/recommend" },
  { label: "Destinations", href: "/destinations" },
  { label: "Experiences", href: "/experiences" },
];

const moreItems = [
  { label: "Services", href: "/services" },
  { label: "Partners", href: "/partners" },
  { label: "Weekend Trips", href: "/weekend-trips" },
  { label: "Enquiry", href: "/enquiry" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/packages?search=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
  };

  // Autocomplete mock data based on query
  const searchResults = (searchQuery.trim().length > 1) 
    ? [
        ...TREKKING_LOCATIONS.filter(loc => loc.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3).map(loc => ({ type: 'destination', title: loc, icon: <MapPin className="w-4 h-4 text-muted-foreground mr-2"/>, link: `/packages?search=${loc}` })),
        { type: 'activity', title: `${searchQuery} Trekking`, icon: <Compass className="w-4 h-4 text-muted-foreground mr-2"/>, link: `/packages?category=trekking&search=${searchQuery}` },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6 xl:gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-heading font-extrabold text-gradient-primary">Travyntra</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:block relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-64 lg:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search destinations, tours..." 
                className="pl-9 bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 h-10 rounded-full"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              />
            </form>
            
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Results</div>
                {searchResults.map((res, i) => (
                  <Link key={i} to={res.link} className="flex items-center px-4 py-2.5 hover:bg-secondary cursor-pointer transition-colors text-sm">
                    {res.icon}
                    <span className="font-medium text-foreground">{res.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.label} to={item.href} className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md hover:bg-secondary">
              {item.label}
            </Link>
          ))}
          <div className="relative group">
            <button className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-md hover:bg-secondary flex items-center gap-1">
              More <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-card shadow-card-hover rounded-lg border border-border py-2 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              {moreItems.map((item) => (
                <Link key={item.label} to={item.href} className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-secondary transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-secondary transition-colors md:hidden" onClick={() => setMobileOpen(true)}>
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          {user && (
            <Link to="/wishlist" className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Heart className="w-5 h-5 text-muted-foreground" />
            </Link>
          )}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary truncate max-w-[120px] transition-colors">
                {user.email}
              </Link>
              <Button size="sm" variant="outline" onClick={handleSignOut} className="gap-1">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Button>
            </div>
          ) : (
            <Button size="sm" className="hidden sm:flex gap-2" asChild>
              <Link to="/login"><User className="w-4 h-4" /> Login / Signup</Link>
            </Button>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-md hover:bg-secondary">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-border bg-background animate-slide-in">
          <div className="container py-4 flex flex-col gap-1">
            {[...navItems, ...moreItems].map((item) => (
              <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary rounded-md transition-colors">
                {item.label}
              </Link>
            ))}
            {user ? (
              <div className="flex flex-col gap-1 mt-2 sm:hidden">
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-secondary rounded-md transition-colors flex items-center gap-2">
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Button size="sm" variant="outline" onClick={() => { handleSignOut(); setMobileOpen(false); }} className="gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <Button size="sm" className="mt-3 gap-2 sm:hidden" asChild>
                <Link to="/login" onClick={() => setMobileOpen(false)}><User className="w-4 h-4" /> Login / Signup</Link>
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
