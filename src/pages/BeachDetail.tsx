import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BEACHES, { getBeachBySlug } from "@/data/beaches";

const BeachDetail = () => {
  const { slug } = useParams();
  const beach = slug ? getBeachBySlug(slug) : null;

  if (!beach) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-heading">Beach not found</h2>
          <p className="text-muted-foreground mt-3">Try selecting a beach from the list.</p>
          <Link to="/experiences/beach-holidays" className="mt-4 inline-block">
            <Button>Back to Beaches</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative">
        <div className="h-64 md:h-96 w-full overflow-hidden">
          <img src={beach.image} alt={beach.name} className="w-full h-full object-cover" />
        </div>
        <div className="container -mt-12">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-heading font-bold">{beach.name}</h1>
                <p className="text-sm text-muted-foreground mt-2">{beach.location} • Best time: {beach.best_time}</p>
                <p className="mt-4 text-muted-foreground">{beach.short}</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Highlights</h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground mt-2">
                      {beach.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Activities</h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground mt-2">
                      {beach.activities.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Link to={`/packages?search=${encodeURIComponent(beach.name)}`}>
                    <Button>View Packages</Button>
                  </Link>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(beach.name + ' ' + (beach.location || ''))}`} target="_blank" rel="noreferrer">
                    <Button variant="outline">View on Map</Button>
                  </a>
                </div>
              </div>

              <aside className="w-full md:w-64">
                <div className="bg-muted rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Quick Facts</h5>
                  <p className="text-sm text-muted-foreground">Best time: {beach.best_time}</p>
                  <p className="text-sm text-muted-foreground mt-2">Popular activities: {beach.activities.slice(0,3).join(', ')}</p>
                </div>

                <div className="mt-4">
                  <h5 className="font-semibold">Other Beaches</h5>
                  <ul className="mt-2 space-y-1 text-sm">
                    {BEACHES.filter(b => b.slug !== beach.slug).slice(0,6).map(b => (
                      <li key={b.slug}><Link to={`/experiences/beach/${b.slug}`} className="text-primary">{b.name}</Link></li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BeachDetail;
