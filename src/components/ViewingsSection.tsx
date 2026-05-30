import AnimatedSection from "@/components/AnimatedSection";
import {
  Eye, Users, CheckCircle, Clock, MessageSquare, Scan,
} from "lucide-react";

const bullets = [
  {
    icon: Scan,
    text: "Explore the property anytime with our high-quality 360° virtual tours and AI-guided videos",
  },
  {
    icon: CheckCircle,
    text: "Our AI pre-qualifies all interested buyers and tenants to ensure only serious viewers book physical viewings",
  },
  {
    icon: Users,
    text: "Physical viewings are arranged efficiently with our team or trusted local partners",
  },
  {
    icon: Clock,
    text: "We offer flexible options: accompanied viewings or convenient self-access slots using smart locks (where appropriate)",
  },
  {
    icon: MessageSquare,
    text: "All viewings are professionally managed with detailed feedback collected by our AI",
  },
];

const outcomes = [
  "You waste far less time on unsuitable viewings",
  "Serious buyers/tenants get the in-person experience they need",
  "Faster overall process from listing to offer",
];

interface ViewingsSectionProps {
  /** Render a compact card version for the homepage */
  compact?: boolean;
}

const ViewingsSection = ({ compact = false }: ViewingsSectionProps) => {
  if (compact) {
    return (
      <AnimatedSection>
        <div className="relative rounded-2xl border border-border bg-card p-8 md:p-10 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
                <Eye size={20} className="text-primary" />
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
                <Users size={20} className="text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-3">
              How Viewings Work
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              We combine 360° virtual tours with AI-qualified physical viewings — so only serious buyers and tenants see your property in person. Flexible options include accompanied viewings and smart-lock self-access.
            </p>
            <p className="text-xs font-medium text-primary italic">
              Technology removes hassle — not human connection where it matters most.
            </p>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <section className="py-20 section-padding">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 justify-center mb-6">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10">
                <Eye size={24} className="text-primary" />
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10">
                <Users size={24} className="text-primary" />
              </div>
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4 text-balance">
              How Viewings Work with Hummm
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We combine the power of AI with the importance of physical viewings.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-4 mb-10">
          {bullets.map((b, i) => (
            <AnimatedSection key={i} delay={i * 60}>
              <div className="group flex items-start gap-4 rounded-xl p-5 border border-border bg-card hover:border-primary/40 transition-all">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
                  <b.icon size={18} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                  {b.text}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={350}>
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-primary/5 p-8 md:p-10">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            <h3 className="text-lg font-bold tracking-tight mb-5 relative z-10">
              This hybrid approach means:
            </h3>
            <ul className="space-y-3 relative z-10 mb-6">
              {outcomes.map((o, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle size={16} className="text-primary shrink-0" />
                  {o}
                </li>
              ))}
            </ul>
            <p className="text-sm font-medium text-foreground italic relative z-10">
              We believe technology should remove hassle — not replace human connection where it matters most.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ViewingsSection;
