import { useState, useEffect } from "react";
import { Footprints, Train, Briefcase, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CommuteTimelineProps {
  postcode: string;
  workPostcode?: string;
}

type TimelineData = {
  walkMins: number;
  stationName: string;
  commuteMinsDest: number | null;
  destination: string | null;
};

const CommuteTimeline = ({ postcode, workPostcode }: CommuteTimelineProps) => {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postcode) return;
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      try {
        const { data: res } = await supabase.functions.invoke("life-metrics", {
          body: { postcode, work_postcode: workPostcode },
        });
        if (cancelled) return;
        const station = res?.transport?.nearestStation;
        if (station) {
          setData({
            walkMins: station.walkMinutes ?? Math.round(station.distance / 80),
            stationName: station.name,
            commuteMinsDest: res.transport.commuteMinutes,
            destination: res.transport.commuteDestination,
          });
        }
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [postcode, workPostcode]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card/40 p-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading commute data…
      </div>
    );
  }

  if (!data) return null;

  const nodes = [
    { icon: Footprints, label: "Walk", value: `${data.walkMins} min` },
    { icon: Train, label: data.stationName, value: null },
    ...(data.commuteMinsDest && data.destination
      ? [{ icon: Briefcase, label: data.destination, value: `${data.commuteMinsDest} min` }]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.12)" }}>
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
        Commute Timeline
      </h3>

      <div className="flex items-center gap-0">
        {nodes.map((node, i) => {
          const Icon = node.icon;
          const isLast = i === nodes.length - 1;

          return (
            <div key={i} className="flex items-center">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5 min-w-[56px]">
                <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[10px] font-semibold text-foreground/80 text-center leading-tight max-w-[64px] truncate">
                  {node.label}
                </span>
              </div>

              {/* Connector line + time */}
              {!isLast && (
                <div className="flex flex-col items-center mx-1 flex-1 min-w-[40px]">
                  <span className="text-[10px] font-bold text-primary tabular-nums mb-1">
                    {nodes[i + 1]?.value || node.value || ""}
                  </span>
                  <div className="w-full h-[2px] bg-primary rounded-full relative">
                    <div className="absolute inset-0 bg-primary animate-pulse rounded-full opacity-40" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommuteTimeline;
