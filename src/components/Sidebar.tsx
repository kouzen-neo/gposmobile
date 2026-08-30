import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, BarChart3 } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kasir", label: "Kasir", icon: ShoppingCart },
  { href: "/item", label: "Item", icon: Package },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 pb-2.5 border-t border-border bg-brand text-surface lg:static lg:inset-auto lg:h-screen lg:w-56 lg:flex-col lg:border-r lg:border-t-0 lg:pb-0 lg:h-auto">
      <div className="hidden px-4 py-4 font-display text-xl font-bold lg:flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-accent inline-block" />
        gPOS
      </div>
      <div className="flex flex-1 flex-row lg:flex-col lg:flex-none">
        {links.map(({ href, label, icon: Icon }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={`motion flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-surface/75 hover:bg-surface/15 lg:flex-none lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-3.5 ${
                active ? "text-surface font-semibold" : ""
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium lg:text-sm">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
