import { Link } from "react-router-dom";
import Disclaimer from "@/components/Disclaimer";

const productLinks = [
  { label: "Deep AI Audit", to: "/humm-ai-negotiator" },
  { label: "Negotiate For Me — First Free", to: "/negotiate-for-me" },
  { label: "Pricing", to: "/pricing" },
];

const forYouLinks = [
  { label: "Buyers", to: "/auth" },
  { label: "Sellers", to: "/auth" },
  { label: "Landlords", to: "/auth" },
  { label: "Renters", to: "/auth" },
];

const companyLinks = [
  { label: "About", to: "/#about" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Contact", to: "/#contact" },
];

const LinkColumn = ({ heading, links }: { heading: string; links: { label: string; to: string }[] }) => (
  <div>
    <h4 className="text-white/20 text-xs uppercase tracking-widest font-medium mb-3">{heading}</h4>
    <ul className="space-y-2.5">
      {links.map((l) => (
        <li key={l.label}>
          <Link to={l.to} className="text-sm text-white/40 hover:text-white/70 transition-colors">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="px-5 sm:px-8 lg:px-24 pt-16 sm:pt-20 pb-10" style={{ background: "hsl(222, 47%, 4%)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Top columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="relative inline-flex items-center">
              <img src="/logo-transparent.png" alt="Hummm" className="h-7 w-auto mb-4" />
            </Link>
            <p className="text-white/30 text-sm leading-relaxed">
              The AI property expert for buyers, sellers, landlords and renters.
            </p>
            <p className="text-white/25 text-xs leading-relaxed mt-4">
              <span className="block font-semibold text-white/40">Hummm AI</span>
              Registered Office: 128 City Road,<br />London EC1V 2NX, United Kingdom
            </p>
          </div>

          <LinkColumn heading="Product" links={productLinks} />
          <LinkColumn heading="For you" links={forYouLinks} />
          <LinkColumn heading="Company" links={companyLinks} />
        </div>

        <Disclaimer />

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-6 mt-12 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/20 text-xs">© 2025 Hummm AI · 128 City Road, London EC1V 2NX, UK · All rights reserved.</p>
          <div className="flex items-center gap-3 text-white/20 text-xs">
            <span>GDPR Compliant</span>
            <span>·</span>
            <span>Powered by Land Registry data</span>
            <span>·</span>
            <button
              onClick={() => { localStorage.removeItem("humm_cookie_consent"); window.location.reload(); }}
              className="hover:text-white/40 transition-colors"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
