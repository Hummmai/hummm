import { Home, TrendingUp, Key, Shield } from "lucide-react";
import HummLogo from "@/components/HummLogo";

const roles = [
  {
    key: "buyer",
    label: "Buyer",
    icon: Home,
    desc: "Find and negotiate the best property deals",
    welcome: "Ready to find your next home?",
  },
  {
    key: "seller",
    label: "Seller",
    icon: TrendingUp,
    desc: "Sell your property at the highest price",
    welcome: "Let's get your property sold.",
  },
  {
    key: "landlord",
    label: "Landlord",
    icon: Shield,
    desc: "Manage your portfolio, compliance & tenants",
    welcome: "Your portfolio, on autopilot.",
  },
  {
    key: "renter",
    label: "Renter",
    icon: Key,
    desc: "Find, manage, and protect your rental",
    welcome: "Let's find your perfect rental.",
  },
];

interface Props {
  onSelect: (role: string) => void;
}

export default function RoleSelector({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="max-w-xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <HummLogo logoHeight="h-12" linkHome={false} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-balance">
          What best describes you?
        </h1>
        <p className="text-sm text-gray-500 mb-10 max-w-sm mx-auto">
          Choose your role to get a personalised experience.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => onSelect(r.key)}
              className="group flex flex-col items-center gap-3 p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white hover:border-primary hover:shadow-[0_8px_30px_-8px_hsl(168_100%_45%/0.2)] transition-all duration-300 active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <r.icon size={24} className="text-primary" />
              </div>
              <span className="text-base font-bold text-gray-900">{r.label}</span>
              <span className="text-xs text-gray-500 leading-relaxed">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { roles };
