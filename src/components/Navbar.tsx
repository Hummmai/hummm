import { useState, useEffect, useRef } from "react";
import { Menu, X, Sparkles, User, Shield, Search, Handshake, Building2, ChevronDown, Target, Key, Home, LogOut, MessageSquare, Calculator } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import hummLogo from "@/assets/logo-hummm.png";
import GoldHummm from "@/components/GoldHummm";

import { useHumm } from "@/contexts/HummContext";
import { useToast } from "@/hooks/use-toast";

const ROLE_ROUTES: Record<string, string> = {
  buyer: "/dashboard/buyer",
  landlord: "/dashboard/landlord",
  seller: "/dashboard/seller",
  tenant: "/dashboard/tenant",
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoConfirmOpen, setDemoConfirmOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn, isGold, currentRole, userEmail, switchRole, signOut } = useHumm();

  useEffect(() => {
    setDemoMode(localStorage.getItem("hummm_demo_access") === "HUMMM2026");
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setDemoConfirmOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExitDemo = () => {
    localStorage.removeItem("hummm_demo_access");
    setDemoMode(false);
    setDemoConfirmOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSwitchRole = async (roleKey: string) => {
    await switchRole(roleKey);
    setProfileOpen(false);
    navigate(ROLE_ROUTES[roleKey] || "/dashboard");
  };

  const handleSignOut = async () => {
    await signOut();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/");
    toast({ title: "Successfully Signed Out", description: "See you soon! 🐦" });
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const navLinkClass = (href: string) =>
    `relative text-[11px] font-semibold tracking-[0.16em] uppercase transition-all duration-300 hover:after:scale-x-100 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[1.5px] after:bg-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 ${
      isActive(href) ? "text-white after:scale-x-100 drop-shadow-[0_0_6px_rgba(114,241,184,0.4)]" : "text-white/90 hover:text-white hover:drop-shadow-[0_0_6px_rgba(114,241,184,0.3)]"
    }`;

  // ── Dashboard Links ──
  const dashboardLinks = [
    { label: "Buyer Command Centre", description: "Offers, mortgage & negotiations", href: "/dashboard", icon: Home, gold: false },
    { label: "Renter Command Centre", description: "Tenancy, rights & rental tools", href: "/dashboard", icon: Key, gold: false },
  ];

  const renderDropdownItem = (item: { label: string; description: string; href: string; icon: any; gold: boolean; external?: boolean; sameTab?: boolean }) => {
    const Icon = item.icon;
    const showGold = item.gold && isGold;
    const isItemActive = !item.external && isActive(item.href);
    const content = (
      <div
        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group cursor-pointer ${
          isItemActive ? "bg-primary/10" : showGold ? "hover:bg-lime-400/10" : "hover:bg-primary/5"
        }`}
      >
        <div className={`shrink-0 w-1.5 h-1.5 rounded-full transition-all ${isItemActive ? "bg-primary" : "bg-transparent"}`} />
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
          showGold ? "bg-gradient-to-br from-lime-200/20 via-lime-400/20 to-lime-500/20" : "bg-muted/30 group-hover:bg-primary/10"
        }`}>
          <Icon size={15} className={`transition-all duration-300 ${showGold ? "text-emerald-300" : "text-primary group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_hsl(168_100%_45%/0.6)]"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[13px] font-semibold tracking-wide ${
            showGold ? "bg-gradient-to-r from-white to-lime-400 bg-clip-text text-transparent" : "text-foreground"
          }`}>{item.label}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{item.description}</p>
        </div>
      </div>
    );
    if (item.external) {
      const linkProps = item.sameTab ? {} : { target: "_blank" as const, rel: "noopener noreferrer" };
      return <a key={item.label} href={item.href} {...linkProps}>{content}</a>;
    }
    return <Link key={item.label} to={item.href}>{content}</Link>;
  };

  const DropdownSection = ({ title, icon: SectionIcon, items }: { title: string; icon?: any; items: typeof dashboardLinks }) => (
    <div className="px-1.5 pb-1">
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
        {SectionIcon && <SectionIcon size={10} className="text-primary/60" />}
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-primary/60">{title}</p>
      </div>
      {items.map(renderDropdownItem)}
    </div>
  );

  const activeRoleLabel = currentRole
    ? { buyer: "Buyer Sniper", landlord: "Property Shield", seller: "Seller Mission Control", tenant: "Tenant Flex" }[currentRole] || "Dashboard"
    : null;

  return (
    <nav className="fixed top-3 sm:top-4 left-0 right-0 z-50 section-padding pointer-events-none">
      <div
        className={`pointer-events-auto mx-auto transition-all duration-500 rounded-2xl sm:rounded-full ${
          scrolled
            ? "bg-background/95 backdrop-blur-2xl border border-border/20 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]"
            : "bg-background/40 backdrop-blur-xl border border-border/10"
        }`}
      >
        <div className="flex items-center justify-between pl-2 pr-4 sm:pr-6 py-2.5 sm:py-3">
        {/* Logo */}
        <div className="shrink-0 flex items-center">
          <Link to="/" className="relative inline-flex items-center leading-none">
            <img
              src={hummLogo}
              alt="Hummm AI"
              loading="eager"
              decoding="async"
              className="h-24 sm:h-24 md:h-28 lg:h-28 w-auto drop-shadow-[0_0_24px_rgba(114,241,184,0.22)]"
            />
          </Link>
        </div>

        {/* ─── Desktop: Three Zones ─── */}
        <div className="hidden lg:flex items-center flex-1 ml-6">

          {/* ZONE 1: Intelligent Property Consultants Nav */}
          <div className="flex items-center gap-x-7">
            <Link to="/" className={`${navLinkClass("/")} flex items-center justify-center h-8`}>
              <span className="whitespace-nowrap">Home</span>
            </Link>
            <Link to="/sell-with-hummm" className={`${navLinkClass("/sell-with-hummm")} flex items-center justify-center h-8`}>
              <span className="whitespace-nowrap">Sell</span>
            </Link>
            <Link to="/let-with-hummm" className={`${navLinkClass("/let-with-hummm")} flex items-center justify-center h-8`}>
              <span className="whitespace-nowrap">Let</span>
            </Link>
            <Link to="/manage-with-hummm" className={`${navLinkClass("/manage-with-hummm")} flex items-center justify-center h-8`}>
              <span className="whitespace-nowrap">Manage</span>
            </Link>
            {isLoggedIn && (
              <Link
                to="/my-hummm"
                className="relative flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-[11px] font-bold tracking-[0.16em] uppercase text-primary border border-primary/40 bg-primary/10 hover:bg-primary/15 hover:border-primary/60 transition-all"
              >
                <Sparkles size={11} className="text-primary" />
                <span className="whitespace-nowrap">My Hummm</span>
              </Link>
            )}
            <Link
              to="/hummm-negotiator"
              className="relative flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-full text-[11px] font-bold tracking-[0.16em] uppercase text-primary border border-primary/40 bg-primary/10 hover:bg-primary/15 hover:border-primary/60 transition-all"
            >
              <Sparkles size={11} className="text-primary" />
              <span className="whitespace-nowrap">Negotiator</span>
            </Link>
            <Link to="/areas" className={`${navLinkClass("/areas")} flex items-center justify-center h-8`}>
              <span className="whitespace-nowrap">Areas</span>
            </Link>
            {isLoggedIn && (
              <Link to="/dashboard" className={`${navLinkClass("/dashboard")} flex items-center justify-center h-8`}>
                <span className="whitespace-nowrap">Dashboard</span>
              </Link>
            )}
          </div>

          {/* ZONE 3: Unified Command Center — pushed right */}
          <div className="ml-auto flex items-center gap-4">
            {demoMode && (
              <div ref={demoRef} className="relative">
                <button
                  onClick={() => setDemoConfirmOpen(!demoConfirmOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Demo Mode
                </button>
                {demoConfirmOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-border/30 bg-background/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-3 animate-fade-in z-50">
                    <p className="text-xs text-foreground mb-2.5">Exit demo mode?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleExitDemo}
                        className="flex-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDemoConfirmOpen(false)}
                        className="flex-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-muted/40 text-foreground/80 hover:bg-muted/60 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!isLoggedIn ? (
              <Link
                to="/auth"
                className="inline-flex items-center gap-x-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-white/90 hover:text-white hover:drop-shadow-[0_0_6px_rgba(114,241,184,0.3)] transition-all"
              >
              <User size={14} />
                Hummm
              </Link>
            ) : (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/60 bg-muted/20 hover:bg-muted/40 transition-all ${isGold ? "shadow-[0_0_15px_rgba(114,241,184,0.2)]" : ""}`}
                >
                  {isGold && <GoldHummm size={16} pulse={false} />}
                  <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <User size={13} className="text-primary" />
                  </div>
                  <ChevronDown size={12} className={`text-primary transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute top-full right-0 mt-3 w-[340px] rounded-2xl border border-border/30 bg-gradient-to-b from-background/95 to-background/90 backdrop-blur-2xl shadow-[0_20px_60px_-15px_hsl(168_100%_45%/0.15),0_0_0_0.5px_hsl(var(--border)/0.3)] overflow-hidden animate-fade-in">
                    {/* The Hummm Pulse Header */}
                    <div className="px-4 pt-4 pb-3 border-b border-border/20 bg-gradient-to-br from-primary/5 to-transparent">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                          {isGold ? <GoldHummm size={18} pulse={false} /> : <User size={15} className="text-primary" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{userEmail || "User"}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">
                            {currentRole === "landlord" ? "⚠️ Action Required: 31 Days to Reform" : "✅ Portfolio Status: Optimal"}
                          </p>
                        </div>
                      </div>
                      {isGold && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black rounded-full border border-[#72F1B8]/40 bg-[#72F1B8]/10 text-emerald-300 shadow-[0_0_12px_rgba(114,241,184,0.15)]">
                          <Sparkles size={9} className="animate-pulse" /> Hummm
                        </div>
                      )}
                      {activeRoleLabel && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <p className="text-[10px] text-primary font-semibold">{activeRoleLabel}</p>
                        </div>
                      )}
                    </div>

                    {/* Zoned Sections */}
                    <div className="max-h-[420px] overflow-y-auto">
                      <DropdownSection title="My Dashboard" icon={Target} items={dashboardLinks} />
                    </div>

                    {/* Sign Out */}
                    <div className="p-1.5 border-t border-border/20">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-left text-destructive hover:bg-destructive/10 group"
                      >
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-destructive/10 group-hover:bg-destructive/15 flex items-center justify-center transition-colors">
                          <LogOut size={15} className="text-destructive" />
                        </div>
                        <p className="text-[13px] font-semibold tracking-wide">Sign Out</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-foreground p-3 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/[0.05] active:bg-white/[0.08] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ─── Mobile Menu ─── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border px-5 pb-5 pt-3 space-y-0">
          <Link to="/" className="block py-3 text-sm font-semibold tracking-widest uppercase text-white/90 hover:text-primary transition-colors border-b border-border/30">Home</Link>
          <Link to="/sell-with-hummm" className="block py-3 text-sm font-semibold tracking-widest uppercase text-white/90 hover:text-primary transition-colors border-b border-border/30">Sell with Hummm</Link>
          <Link to="/let-with-hummm" className="block py-3 text-sm font-semibold tracking-widest uppercase text-white/90 hover:text-primary transition-colors border-b border-border/30">Let with Hummm</Link>
          <Link to="/manage-with-hummm" className="block py-3 text-sm font-semibold tracking-widest uppercase text-white/90 hover:text-primary transition-colors border-b border-border/30">Manage with Hummm</Link>
          {isLoggedIn && (
            <Link to="/my-hummm" className="flex items-center justify-between py-3 text-sm font-bold tracking-widest uppercase text-primary hover:opacity-90 transition-colors border-b border-border/30">
              <span className="inline-flex items-center gap-2"><Sparkles size={13} /> My Hummm</span>
              <span className="text-[10px] font-black uppercase tracking-wider">Agent</span>
            </Link>
          )}
          <Link to="/hummm-negotiator" className="flex items-center justify-between py-3 text-sm font-bold tracking-widest uppercase text-primary hover:opacity-90 transition-colors border-b border-border/30">
            <span className="inline-flex items-center gap-2"><Sparkles size={13} /> Hummm Negotiator</span>
            <span className="text-[10px] font-black uppercase tracking-wider">First Free</span>
          </Link>
          <Link to="/areas" className="block py-3 text-sm font-semibold tracking-widest uppercase text-white/90 hover:text-primary transition-colors border-b border-border/30">Areas We Cover</Link>

          {isLoggedIn ? (
            <>
              <p className="pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-primary/60">My Dashboard</p>
              {dashboardLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.label} to={item.href} className={`flex items-center gap-3 py-3 text-sm font-medium tracking-wide transition-colors border-b border-border/30 ${active ? "text-primary" : "text-foreground/70 hover:text-primary"}`}>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    <Icon size={15} /> {item.label}
                  </Link>
                );
              })}

              {/* Mobile Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 py-3 text-sm font-semibold tracking-wide text-red-500 hover:text-red-400 transition-colors mt-2"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 py-3 text-sm font-semibold tracking-widest uppercase text-white/90 hover:text-primary transition-colors border-b border-border/30">
              <User size={14} /> Hummm
            </Link>
          )}

        </div>
      </div>
      </div>
    </nav>
  );
};

export default Navbar;

function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const items: { to: string; label: string; sub: string }[] = [
    { to: "/sell-for-me", label: "Sell For Me", sub: "0.75% full AI estate agent" },
    { to: "/let-for-me", label: "Let For Me", sub: "Full AI letting service" },
    { to: "/manage-for-me", label: "Manage For Me", sub: "AI property management" },
  ];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-8 text-[11px] font-semibold tracking-[0.16em] uppercase text-white/85 hover:text-white transition-colors"
      >
        Services
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-3 w-72 rounded-2xl border border-border/40 bg-background/95 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in z-50">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/20 last:border-b-0 hover:bg-primary/5 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.sub}</p>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 uppercase tracking-wider shrink-0">
                Soon
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
