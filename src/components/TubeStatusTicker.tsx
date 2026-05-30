import { useEffect, useState } from "react";
import { Train, AlertTriangle, CheckCircle, MinusCircle, XCircle } from "lucide-react";

type LineStatus = {
  id: string;
  name: string;
  status: string;
  reason?: string;
};

const LINE_COLORS: Record<string, string> = {
  Bakerloo: "#B36305",
  Central: "#E32017",
  Circle: "#FFD300",
  District: "#00782A",
  "Hammersmith & City": "#F3A9BB",
  Jubilee: "#A0A5A9",
  Metropolitan: "#9B0056",
  Northern: "#000000",
  Piccadilly: "#003688",
  Victoria: "#0098D4",
  "Waterloo & City": "#95CDBA",
  Elizabeth: "#6950A1",
  DLR: "#00A4A7",
  Overground: "#EE7C0E",
  "TfL Rail": "#0019A8",
  Tram: "#84B817",
};

const statusIcon = (status: string) => {
  if (status === "Good Service")
    return <CheckCircle className="h-3 w-3 text-green-400 shrink-0" />;
  if (status.includes("Delay") || status.includes("Minor"))
    return <AlertTriangle className="h-3 w-3 text-yellow-400 shrink-0" />;
  if (status.includes("Severe") || status.includes("Suspended"))
    return <XCircle className="h-3 w-3 text-red-400 shrink-0" />;
  return <MinusCircle className="h-3 w-3 text-orange-400 shrink-0" />;
};

const TubeStatusTicker = () => {
  const [lines, setLines] = useState<LineStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          "https://api.tfl.gov.uk/Line/Mode/tube,elizabeth-line,dlr,overground/Status"
        );
        if (!res.ok) throw new Error("TfL API error");
        const data = await res.json();
        const parsed: LineStatus[] = data.map((line: any) => ({
          id: line.id,
          name: line.name,
          status: line.lineStatuses?.[0]?.statusSeverityDescription || "Unknown",
          reason: line.lineStatuses?.[0]?.reason,
        }));
        setLines(parsed);
      } catch {
        setLines([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 120_000); // refresh every 2 min
    return () => clearInterval(interval);
  }, []);

  if (loading || lines.length === 0) return null;

  const disrupted = lines.filter((l) => l.status !== "Good Service");

  return (
    <div className="w-full bg-[hsl(var(--card))] border-t border-border/40 overflow-hidden">
      <div className="flex items-center">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-primary/10 border-r border-border/40">
          <Train className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary tracking-wide uppercase">
            Live Tube
          </span>
          {disrupted.length > 0 && (
            <span className="ml-1 bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {disrupted.length}
            </span>
          )}
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1 relative">
          <div className="animate-ticker flex items-center gap-6 whitespace-nowrap py-2.5 pr-8">
            {/* Duplicate for seamless loop */}
            {[...lines, ...lines].map((line, i) => (
              <span
                key={`${line.id}-${i}`}
                className="inline-flex items-center gap-1.5 text-xs"
                title={line.reason || line.status}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: LINE_COLORS[line.name] || "hsl(var(--primary))" }}
                />
                <span className="font-medium text-foreground/80">{line.name}</span>
                {statusIcon(line.status)}
                <span
                  className={`${
                    line.status === "Good Service"
                      ? "text-muted-foreground/60"
                      : "text-yellow-400 font-medium"
                  }`}
                >
                  {line.status}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TubeStatusTicker;
