import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHumm } from "@/contexts/HummContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarDays, Loader2, Plus, XCircle, Mail, Clock, MapPin } from "lucide-react";

const TIME_SLOTS = [
  { value: "morning", label: "Morning (9am–12pm)" },
  { value: "afternoon", label: "Afternoon (12–5pm)" },
  { value: "evening", label: "Evening (5–7pm)" },
];

type Booking = {
  id: string;
  property_address: string;
  property_url: string | null;
  agent_name: string | null;
  agent_email: string | null;
  viewing_date: string | null;
  viewing_time: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export default function ViewingsCalendar() {
  const navigate = useNavigate();
  const { isLoggedIn, userId } = useHumm();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState("");
  const [url, setUrl] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("morning");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth?redirect=/viewings", { replace: true });
      return;
    }
    fetchBookings();
  }, [isLoggedIn]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("viewing_bookings" as any)
      .select("*")
      .order("viewing_date", { ascending: true });
    setBookings((data as any as Booking[]) || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Property address is required");
      return;
    }
    if (!userId) return;
    setSubmitting(true);
    const { error } = await supabase.from("viewing_bookings" as any).insert({
      user_id: userId,
      property_address: address.trim(),
      property_url: url.trim() || null,
      agent_name: agentName.trim() || null,
      agent_email: agentEmail.trim() || null,
      viewing_date: date || null,
      viewing_time: time,
      notes: notes.trim() || null,
    } as any);
    setSubmitting(false);
    if (error) {
      toast.error("Failed to book viewing", { description: error.message });
      return;
    }
    toast.success("Viewing booked!");
    setAddress("");
    setUrl("");
    setAgentName("");
    setAgentEmail("");
    setDate("");
    setTime("morning");
    setNotes("");
    fetchBookings();
  };

  const handleCancel = async (id: string) => {
    await supabase.from("viewing_bookings" as any).update({ status: "cancelled" } as any).eq("id", id);
    toast.success("Viewing cancelled");
    fetchBookings();
  };

  const statusStyle = (s: string) => {
    if (s === "confirmed") return "bg-emerald-500/15 text-emerald-400";
    if (s === "cancelled") return "bg-muted/50 text-muted-foreground";
    return "bg-amber-500/15 text-amber-400";
  };

  const timeLabel = (t: string | null) =>
    TIME_SLOTS.find((s) => s.value === t)?.label || t || "—";

  return (
    <>
      <SEOHead title="Viewings | Hummm" description="Book and manage property viewings." noindex />
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays size={22} className="text-primary" /> Viewings
          </h1>

          {/* ── Book a viewing form ── */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Book a Viewing</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Property address *" value={address} onChange={(e) => setAddress(e.target.value)} required />
              <Input type="url" placeholder="Property URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} />
              <Input placeholder="Agent name" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
              <Input type="email" placeholder="Agent email" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Book Viewing
            </Button>
          </form>

          {/* ── Upcoming viewings ── */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming Viewings</h2>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-primary" /></div>
            ) : bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No viewings booked yet.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate flex items-center gap-1.5">
                          <MapPin size={13} className="text-primary shrink-0" />
                          {b.property_address}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {b.viewing_date && (
                            <span className="flex items-center gap-1">
                              <CalendarDays size={12} />
                              {new Date(b.viewing_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {timeLabel(b.viewing_time)}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${statusStyle(b.status)}`}>
                        {b.status}
                      </span>
                    </div>

                    {(b.agent_name || b.agent_email) && (
                      <p className="text-xs text-muted-foreground">
                        {b.agent_name && <span className="font-medium">{b.agent_name}</span>}
                        {b.agent_email && (
                          <a href={`mailto:${b.agent_email}`} className="ml-1.5 text-primary hover:underline inline-flex items-center gap-0.5">
                            <Mail size={10} /> {b.agent_email}
                          </a>
                        )}
                      </p>
                    )}

                    {b.notes && <p className="text-[11px] text-muted-foreground/70">{b.notes}</p>}

                    {b.status !== "cancelled" && (
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive gap-1 h-7 text-xs" onClick={() => handleCancel(b.id)}>
                        <XCircle size={12} /> Cancel
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
