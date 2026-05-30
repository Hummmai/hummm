import { useState, useEffect } from "react";
import {
  GraduationCap, Train, TrendingUp, MapPin, Loader2, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LifeMetrics {
  transport: {
    nearestStation: { name: string; distance: number; walkMinutes: number; modes: string[] } | null;
    commuteMinutes: number | null;
    commuteDestination: string | null;
  } | null;
  schools: { name: string; type: string; distance: number | null; ofsted: string }[];
  vibe: { region: string; district: string; ward: string } | null;
  summary: {
    education: string;
    connectivity: string;
    commute: string | null;
    area: string;
  };
}

interface Props {
  postcode: string;
  className?: string;
}

export default function LifestyleCard({ postcode, className = "" }: Props) {
  const [metrics, setMetrics] = useState<LifeMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!postcode) return;
    setLoading(true);
    setError(false);

    supabase.functions
      .invoke("life-metrics", { body: { postcode } })
      .then(({ data, error: fnErr }) => {
        if (fnErr || data?.error) {
          setError(true);
        } else {
          setMetrics(data);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [postcode]);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-border bg-card/40 p-6 text-center ${className}`}>
        <Loader2 size={20} className="animate-spin text-primary mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Loading lifestyle data...</p>
      </div>
    );
  }

  if (error || !metrics) return null;

  const items = [
    {
      icon: GraduationCap,
      label: "Education",
      value: metrics.summary.education,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Train,
      label: "Connectivity",
      value: metrics.summary.connectivity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: TrendingUp,
      label: "Vibe",
      value: metrics.vibe?.district
        ? `${metrics.vibe.district} · ${metrics.summary.area}`
        : metrics.summary.area,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  if (metrics.summary.commute) {
    items.splice(1, 0, {
      icon: MapPin,
      label: "Commute",
      value: metrics.summary.commute,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    });
  }

  return (
    <div className={`rounded-2xl border border-border bg-card/40 p-6 ${className}`}
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.12)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-primary" />
        <h3 className="text-sm font-bold">Hummm Lifestyle</h3>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                <Icon size={14} className={item.color} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-foreground">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schools list */}
      {metrics.schools.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Nearby Schools
          </p>
          <div className="space-y-1.5">
            {metrics.schools.slice(0, 3).map((school, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs text-foreground truncate">{school.name}</span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    school.ofsted === "Outstanding"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : school.ofsted === "Good"
                      ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}
                >
                  {school.ofsted}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Export a hook for other components to use the metrics data */
export function useLifeMetrics(postcode: string) {
  const [metrics, setMetrics] = useState<LifeMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!postcode) return;
    setLoading(true);
    supabase.functions
      .invoke("life-metrics", { body: { postcode } })
      .then(({ data, error }) => {
        if (!error && !data?.error) setMetrics(data);
      })
      .finally(() => setLoading(false));
  }, [postcode]);

  return { metrics, loading };
}
