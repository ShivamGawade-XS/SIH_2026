"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, QrCode, LayoutDashboard, Microscope } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="w-5 h-5" />,
      active: pathname === "/",
    },
    {
      href: "/verify",
      label: "Verify QR",
      icon: <QrCode className="w-5 h-5" />,
      active: pathname.startsWith("/verify"),
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      active: pathname.startsWith("/dashboard") && !pathname.includes("/quality"),
    },
    {
      href: "/dashboard/quality",
      label: "AI Lab",
      icon: <Microscope className="w-5 h-5" />,
      active: pathname.includes("/quality"),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#141414]/95 backdrop-blur-lg border-t border-charcoal text-alabaster shadow-2xl safe-area-pb">
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              item.active ? "text-gold font-bold" : "text-warm-grey hover:text-alabaster"
            }`}
          >
            {item.active && (
              <span className="absolute top-0 w-8 h-0.5 bg-gold" />
            )}
            {item.icon}
            <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
