"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrCode, LayoutDashboard, Globe, ChevronDown, Menu, X, MapPin, Microscope, PlusCircle, Leaf } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
] as const;

const mobileLinks = [
  { href: "/verify", label: "Verify Honey", icon: QrCode },
  { href: "/dashboard", label: "Officer Portal", icon: LayoutDashboard },
  { href: "/dashboard/register", label: "Register Beekeeper", icon: PlusCircle },
  { href: "/dashboard/migration", label: "Migratory Bloom Planner", icon: MapPin },
  { href: "/dashboard/credits", label: "Green Pollination Credits", icon: Leaf },
  { href: "/dashboard/pollen", label: "Pollen Vision AI", icon: Microscope },
];

export default function Navbar() {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === lang) ?? languages[0];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-base font-bold text-text-primary tracking-tight group-hover:text-brand-amber transition-colors">
            HoneyChain
          </span>
          <span className="hidden sm:inline text-xs text-text-muted font-mono border border-border px-1.5 py-0.5 rounded">
            KVIC
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/verify"
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === "/verify"
                ? "text-brand-amber bg-brand-amber/10"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            )}
          >
            <QrCode className="w-4 h-4" />
            Verify
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors",
              pathname?.startsWith("/dashboard")
                ? "text-brand-amber bg-brand-amber/10"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Portal
          </Link>

          {/* Language dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-text-secondary hover:text-text-primary ml-2"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-medium">{currentLang.label === "English" ? "EN" : currentLang.label}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {languages.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "flex justify-between",
                    lang === l.code && "text-brand-amber"
                  )}
                >
                  <span>{l.label}</span>
                  <span className="text-text-muted text-xs">{l.native}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-5 space-y-1">
          {mobileLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                pathname === href || (href !== "/" && pathname?.startsWith(href))
                  ? "bg-brand-amber/10 text-brand-amber"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-text-muted mb-2 px-3">Language</p>
            <div className="grid grid-cols-3 gap-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded-md transition-colors text-center",
                    lang === l.code
                      ? "bg-brand-amber text-black font-semibold"
                      : "text-text-secondary hover:bg-surface-raised"
                  )}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
