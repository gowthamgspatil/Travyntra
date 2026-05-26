import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ExperiencesSection from "@/components/ExperiencesSection";
import DestinationTabs from "@/components/DestinationTabs";
import WeekendTripsSection from "@/components/WeekendTripsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Home"
        description="Explore expert-led, personalised multi-day tours across the world. Book curated travel packages, weekend getaways, and adventure trips with Travyntra."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: "Travyntra",
          description: "Expert-led, personalised multi-day tours across the world.",
          url: window.location.origin,
        }}
      />
      <Navbar />
      <HeroSection />
      <ExperiencesSection />
      <DestinationTabs />
      <WeekendTripsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
