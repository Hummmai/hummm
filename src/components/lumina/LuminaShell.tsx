import { Link, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Hummm Home — uses the main hummm.pro brand tokens (deep navy + teal + off-white)
 * so the service pages match the rest of the site. The LUMINA_* constants are kept
 * as alias names for backwards compatibility with existing pages that import them.
 */

// Mapped to the main hummm.pro tokens
export const LUMINA_NAVY = "#0F1B2E";        // matches hsl(222 47% 11%) main bg
export const LUMINA_NAVY_DEEP = "#0A1422";   // deeper surface
export const LUMINA_GOLD = "#2DD4A8";        // brand teal (accent)
export const LUMINA_GOLD_SOFT = "#72F1B8";   // teal glow
export const LUMINA_CREAM = "#F5F7FA";       // off-white text
export const LUMINA_INK = "#06101D";         // shadow ink

// Headlines use the same Cormorant Garamond serif as the homepage hero.
// Body uses the main Inter sans stack.
export const luminaSerif = { fontFamily: '"Cormorant Garamond","Playfair Display",Georgia,serif' };
export const luminaSans = { fontFamily: '"Inter","Helvetica Neue",Arial,sans-serif' };

const navItems = [
  { to: "/hummm-home", label: "Home" },
  { to: "/hummm-home-sell", label: "Sell" },
  { to: "/hummm-home-let", label: "Let" },
  { to: "/hummm-home-manage", label: "Management" },
  { to: "/free-valuation", label: "Book Valuation" },
];

export function LuminaLogo({ size = 22 }: { size?: number }) {
  return (
    <Link to="/hummm-home" className="inline-flex items-center gap-3 group">
      <span
        className="inline-flex items-center justify-center rounded-full border transition-transform group-hover:scale-105"
        style={{
          width: size + 14,
          height: size + 14,
          borderColor: LUMINA_GOLD,
          background: `radial-gradient(circle, ${LUMINA_GOLD}22 0%, transparent 70%)`,
        }}
      >
        <span
          style={{
            ...luminaSerif,
            color: LUMINA_GOLD,
            fontSize: size,
            lineHeight: 1,
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >H</span>
      </span>
      <span className="flex flex-col leading-none">
        <span
          style={{ ...luminaSerif, color: LUMINA_CREAM, fontSize: 18, letterSpacing: "0.18em", fontWeight: 500 }}
          className="uppercase"
        >Hummm</span>
        <span
          style={{ ...luminaSans, color: LUMINA_GOLD_SOFT, fontSize: 9, letterSpacing: "0.42em", marginTop: 2 }}
          className="uppercase"
        >Home</span>
      </span>
    </Link>
  );
}

function LuminaNav() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? `${LUMINA_NAVY_DEEP}EE` : `${LUMINA_NAVY}CC`,
        backdropFilter: "blur(18px)",
        borderBottom: `1px solid ${LUMINA_GOLD}22`,
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
        <LuminaLogo />

        <nav className="hidden lg:flex items-center gap-9">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative text-[11px] uppercase transition-colors"
                style={{
                  ...luminaSans,
                  letterSpacing: "0.28em",
                  color: active ? LUMINA_GOLD : `${LUMINA_CREAM}CC`,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute -bottom-2 left-0 right-0 h-px"
                    style={{ background: LUMINA_GOLD }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/"
            className="text-[10px] uppercase transition-opacity hover:opacity-80"
            style={{ ...luminaSans, letterSpacing: "0.28em", color: `${LUMINA_CREAM}80` }}
          >
            ← Hummm AI
          </Link>
          <Link
            to="/free-valuation"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase border transition-all hover:scale-[1.02]"
            style={{
              ...luminaSans,
              letterSpacing: "0.24em",
              borderColor: LUMINA_GOLD,
              color: LUMINA_NAVY_DEEP,
              background: `linear-gradient(135deg, ${LUMINA_GOLD_SOFT}, ${LUMINA_GOLD})`,
              fontWeight: 600,
            }}
          >
            Book Valuation
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2"
          style={{ color: LUMINA_CREAM }}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div
          className="lg:hidden border-t"
          style={{ background: LUMINA_NAVY_DEEP, borderColor: `${LUMINA_GOLD}22` }}
        >
          <div className="px-6 py-5 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between py-3 border-b"
                style={{
                  ...luminaSans,
                  borderColor: `${LUMINA_GOLD}15`,
                  color: LUMINA_CREAM,
                  letterSpacing: "0.22em",
                  fontSize: 12,
                }}
              >
                <span className="uppercase">{item.label}</span>
                <ChevronRight size={14} style={{ color: LUMINA_GOLD }} />
              </Link>
            ))}
            <Link
              to="/"
              className="block py-3 text-center mt-3"
              style={{ ...luminaSans, color: `${LUMINA_CREAM}80`, fontSize: 11, letterSpacing: "0.28em" }}
            >
              ← BACK TO HUMMM AI
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function LuminaFooter() {
  return (
    <footer
      className="px-6 sm:px-12 pt-20 pb-10"
      style={{ background: LUMINA_NAVY_DEEP, borderTop: `1px solid ${LUMINA_GOLD}22` }}
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-14">
        <div className="md:col-span-2">
          <LuminaLogo />
          <p
            className="mt-6 max-w-md leading-relaxed"
            style={{ ...luminaSerif, color: `${LUMINA_CREAM}99`, fontSize: 17, fontStyle: "italic" }}
          >
            Traditional excellence. Powered by AI. A new standard in British property representation.
          </p>
          <p
            className="mt-6 text-xs"
            style={{ ...luminaSans, color: `${LUMINA_CREAM}55`, letterSpacing: "0.1em" }}
          >
            Hummm Home · 128 City Road, London EC1V 2NX
          </p>
        </div>
        <FooterCol heading="Services" links={[
          { to: "/hummm-home-sell", label: "Sell With Hummm Home" },
          { to: "/hummm-home-let", label: "Let With Hummm Home" },
          { to: "/hummm-home-manage", label: "Management" },
          { to: "/free-valuation", label: "Book Valuation" },
        ]} />
        <FooterCol heading="Powered By" links={[
          { to: "/", label: "Hummm AI" },
          { to: "/negotiate-for-me", label: "AI Negotiator" },
          { to: "/free-valuation", label: "AI Valuation" },
          { to: "/privacy-policy", label: "Privacy" },
        ]} />
      </div>
      <div
        className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px]"
        style={{ ...luminaSans, color: `${LUMINA_CREAM}55`, letterSpacing: "0.18em", borderTop: `1px solid ${LUMINA_GOLD}15` }}
      >
        <span>© 2026 LUMINA ESTATES · A HUMMM AI COMPANY</span>
        <span>REGISTERED IN ENGLAND & WALES · TPO MEMBER</span>
      </div>
    </footer>
  );
}

function FooterCol({ heading, links }: { heading: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4
        className="mb-5 uppercase"
        style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 10, letterSpacing: "0.32em", fontWeight: 600 }}
      >{heading}</h4>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="transition-colors hover:opacity-100"
              style={{ ...luminaSans, color: `${LUMINA_CREAM}AA`, fontSize: 13 }}
            >{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LuminaShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

// Reusable section title
export function LuminaEyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      className="uppercase mb-5 inline-flex items-center gap-3"
      style={{ ...luminaSans, color: LUMINA_GOLD, fontSize: 10, letterSpacing: "0.42em", fontWeight: 600 }}
    >
      <span className="inline-block w-8 h-px" style={{ background: LUMINA_GOLD }} />
      {children}
    </p>
  );
}

export function LuminaHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`leading-[1.05] ${className}`}
      style={{ ...luminaSerif, color: LUMINA_CREAM, fontWeight: 500, letterSpacing: "-0.01em" }}
    >{children}</h2>
  );
}

export function LuminaButton({
  to,
  href,
  children,
  variant = "primary",
  onClick,
}: {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  onClick?: () => void;
}) {
  const styles = variant === "primary"
    ? {
        background: `linear-gradient(135deg, ${LUMINA_GOLD_SOFT}, ${LUMINA_GOLD})`,
        color: LUMINA_NAVY_DEEP,
        border: `1px solid ${LUMINA_GOLD}`,
      }
    : {
        background: "transparent",
        color: LUMINA_CREAM,
        border: `1px solid ${LUMINA_GOLD}66`,
      };
  const cls = "inline-flex items-center justify-center gap-2 px-7 py-3.5 uppercase transition-all hover:scale-[1.02]";
  const inner = (
    <span className={cls} style={{ ...luminaSans, ...styles, letterSpacing: "0.22em", fontSize: 11, fontWeight: 600 }}>
      {children}
    </span>
  );
  if (to) return <Link to={to} onClick={onClick}>{inner}</Link>;
  if (href) return <a href={href} onClick={onClick}>{inner}</a>;
  return <button onClick={onClick}>{inner}</button>;
}

export function LuminaCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`p-8 transition-all hover:scale-[1.01] ${className}`}
      style={{
        background: `linear-gradient(180deg, ${LUMINA_NAVY}AA, ${LUMINA_NAVY_DEEP}AA)`,
        border: `1px solid ${LUMINA_GOLD}22`,
        borderRadius: 2,
        boxShadow: `0 30px 60px -30px ${LUMINA_INK}AA`,
      }}
    >
      {children}
    </div>
  );
}