import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, ChevronDown, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6 xl:gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-heading font-extrabold text-gradient-primary">Travyntra</span>
          </Link>
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
