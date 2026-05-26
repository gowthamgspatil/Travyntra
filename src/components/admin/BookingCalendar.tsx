import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Users, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BatchWithPackage {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  max_capacity: number;
  current_count: number;
  status: string;
  price: number;
  package_title?: string;
}

const BookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [batches, setBatches] = useState<BatchWithPackage[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [batchRes, bookingRes] = await Promise.all([
      supabase.from("batches").select("*, packages(title)").order("start_date"),
      supabase.from("bookings").select("*").order("travel_date"),
    ]);

    if (batchRes.data) {
      setBatches(batchRes.data.map((b: any) => ({
        ...b,
        package_title: b.packages?.title,
      })));
    }
    if (bookingRes.data) setBookings(bookingRes.data);
    setLoading(false);
  };

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });

    // Pad start to align to week grid
    const startDay = start.getDay();
    const padBefore = Array.from({ length: startDay }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() - (startDay - i));
      return d;
    });

    // Pad end
    const endDay = end.getDay();
    const padAfter = Array.from({ length: 6 - endDay }, (_, i) => {
      const d = new Date(end);
      d.setDate(d.getDate() + i + 1);
      return d;
    });

    return [...padBefore, ...allDays, ...padAfter];
  }, [currentMonth]);

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const dayBatches = batches.filter(b => dateStr >= b.start_date && dateStr <= b.end_date);
    const dayBookings = bookings.filter(b => b.travel_date === dateStr);
    return { batches: dayBatches, bookings: dayBookings };
  };

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : null;

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-foreground text-lg flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Booking Calendar
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-heading font-medium text-foreground min-w-[140px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="ml-2">Today</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const events = getEventsForDay(day);
                const hasEvents = events.batches.length > 0 || events.bookings.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const inMonth = isSameMonth(day, currentMonth);

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`relative min-h-[72px] p-1.5 border-b border-r border-border text-left transition-colors
                      ${!inMonth ? "bg-muted/30" : "hover:bg-accent/50"}
                      ${isSelected ? "bg-primary/10 ring-1 ring-primary" : ""}
                      ${isToday(day) ? "bg-accent/30" : ""}
                    `}
                  >
                    <span className={`text-xs font-medium ${!inMonth ? "text-muted-foreground/40" : isToday(day) ? "text-primary font-bold" : "text-foreground"}`}>
                      {format(day, "d")}
                    </span>
                    {hasEvents && (
                      <div className="mt-0.5 space-y-0.5">
                        {events.batches.slice(0, 2).map(b => (
                          <div key={b.id} className="bg-primary/20 text-primary text-[9px] font-medium px-1 py-0.5 rounded truncate">
                            {b.package_title || b.title}
                          </div>
                        ))}
                        {events.bookings.slice(0, 1).map(b => (
                          <div key={b.id} className="bg-blue-100 text-blue-700 text-[9px] font-medium px-1 py-0.5 rounded truncate">
                            {b.destination}
                          </div>
                        ))}
                        {(events.batches.length + events.bookings.length > 3) && (
                          <div className="text-[9px] text-muted-foreground">+{events.batches.length + events.bookings.length - 3} more</div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary/20" /> Batch/Trip</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100" /> Booking</span>
          </div>
        </div>

        {/* Sidebar: selected day details */}
        <div className="bg-card border border-border rounded-xl p-5">
          {selectedDate && selectedEvents ? (
            <div className="space-y-4">
              <h4 className="font-heading font-semibold text-foreground">
                {format(selectedDate, "EEEE, MMM d, yyyy")}
              </h4>

              {selectedEvents.batches.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Batches</p>
                  {selectedEvents.batches.map(b => {
                    const spotsLeft = Math.max(0, (b.max_capacity || 0) - (b.current_count || 0));
                    return (
                    <div key={b.id} className="border border-border rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-foreground">{b.package_title || b.title}</span>
                        <Badge variant="secondary" className="text-[10px] capitalize">{b.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{b.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.current_count}/{b.max_capacity} · <span className={spotsLeft <= 3 ? "text-destructive font-semibold" : ""}>{spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</span></span>
                        <span>₹{b.price.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60">
                        {format(new Date(b.start_date), "MMM d")} – {format(new Date(b.end_date), "MMM d")}
                      </p>
                    </div>
                    );
                  })}
                </div>
              )}

              {selectedEvents.bookings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bookings</p>
                  {selectedEvents.bookings.map(b => (
                    <div key={b.id} className="border border-border rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-foreground">{b.destination}</span>
                        <Badge className={`text-[10px] capitalize ${b.status === "paid" ? "bg-green-100 text-green-800" : b.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{b.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Group: {b.group_size}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedEvents.batches.length === 0 && selectedEvents.bookings.length === 0 && (
                <p className="text-sm text-muted-foreground">No events on this day.</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Click a date to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
