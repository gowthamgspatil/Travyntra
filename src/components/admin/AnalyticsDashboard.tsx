import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay } from "date-fns";
import { Loader2, TrendingUp, MessageSquare, Package as PackageIcon, DollarSign } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [enquiryTrend, setEnquiryTrend] = useState<any[]>([]);
  const [bookingTrend, setBookingTrend] = useState<any[]>([]);
  const [popularPackages, setPopularPackages] = useState<any[]>([]);
  const [bookingStatus, setBookingStatus] = useState<any[]>([]);
  const [enquirySources, setEnquirySources] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEnquiries: 0, totalBookings: 0, paidBookings: 0, conversionRate: 0 });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const [enqRes, bookRes, pkgRes] = await Promise.all([
      supabase.from("enquiries").select("id, created_at, status, source, package_id"),
      supabase.from("bookings").select("id, created_at, status, destination"),
      supabase.from("packages").select("id, title"),
    ]);
    const enquiries = enqRes.data || [];
    const bookings = bookRes.data || [];
    const packages = pkgRes.data || [];

    // 30-day trend
    const days = Array.from({ length: 30 }).map((_, i) => startOfDay(subDays(new Date(), 29 - i)));
    const trendEnq = days.map((d) => ({
      date: format(d, "MMM d"),
      count: enquiries.filter((e: any) => format(startOfDay(new Date(e.created_at)), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")).length,
    }));
    const trendBook = days.map((d) => ({
      date: format(d, "MMM d"),
      count: bookings.filter((b: any) => format(startOfDay(new Date(b.created_at)), "yyyy-MM-dd") === format(d, "yyyy-MM-dd")).length,
    }));
    setEnquiryTrend(trendEnq);
    setBookingTrend(trendBook);

    // Popular packages (by enquiry count)
    const pkgCount: Record<string, number> = {};
    enquiries.forEach((e: any) => {
      if (e.package_id) pkgCount[e.package_id] = (pkgCount[e.package_id] || 0) + 1;
    });
    const popular = Object.entries(pkgCount)
      .map(([id, count]) => ({ name: packages.find((p: any) => p.id === id)?.title?.slice(0, 22) || "Unknown", count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    setPopularPackages(popular);

    // Booking status pie
    const statusCount: Record<string, number> = {};
    bookings.forEach((b: any) => (statusCount[b.status] = (statusCount[b.status] || 0) + 1));
    setBookingStatus(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

    // Enquiry sources
    const srcCount: Record<string, number> = {};
    enquiries.forEach((e: any) => (srcCount[e.source || "form"] = (srcCount[e.source || "form"] || 0) + 1));
    setEnquirySources(Object.entries(srcCount).map(([name, value]) => ({ name, value })));

    const paid = bookings.filter((b: any) => b.status === "paid").length;
    setStats({
      totalEnquiries: enquiries.length,
      totalBookings: bookings.length,
      paidBookings: paid,
      conversionRate: enquiries.length ? Math.round((bookings.length / enquiries.length) * 100) : 0,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    { label: "Total Enquiries", value: stats.totalEnquiries, icon: MessageSquare },
    { label: "Total Bookings", value: stats.totalBookings, icon: PackageIcon },
    { label: "Paid Bookings", value: stats.paidBookings, icon: DollarSign },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <c.icon className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Enquiries — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={enquiryTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Bookings — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={bookingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
          <h3 className="font-heading font-semibold text-foreground mb-4">Most Enquired Packages</h3>
          {popularPackages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No package enquiries yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={popularPackages} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={150} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Booking Status</h3>
          {bookingStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={bookingStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {bookingStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-heading font-semibold text-foreground mb-4">Enquiry Sources</h3>
          {enquirySources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enquiries yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={enquirySources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {enquirySources.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
