"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, QrCode, Menu, X, Globe, ShieldCheck, Microscope, PlusCircle } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

import HoneyChainLogo from "@/components/HoneyChainLogo";

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [
    { code: "en", label: "EN" },
    { code: "hi", label: "हिंदी" },
    { code: "bn", label: "বাংলা" },
    { code: "ta", label: "தமிழ்" },
    { code: "kn", label: "ಕನ್ನಡ" },
  ] as const;

  return (
    <header className="border-b-2 border-charcoal/15 bg-[#F9F8F6]/95 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center h-20">
        {/* Brand */}
        <Link href="/" className="group">
          <HoneyChainLogo size="md" variant="full" />
        </Link>

        {/* Center Pill: Live Status (Desktop only) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-charcoal/20 bg-white text-[10px] uppercase tracking-widest text-charcoal font-semibold shadow-xs">
          <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
          <span>{t("liveStatus")}</span>
        </div>

        {/* Right Navigation + Language Switcher */}
        <nav className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* Desktop Language Switcher */}
          <div className="hidden sm:flex items-center border border-charcoal/30 bg-white text-[10px] font-bold shadow-xs">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2 py-1 transition-colors ${
                  lang === l.code ? "bg-charcoal text-gold" : "text-charcoal hover:bg-alabaster"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Mobile compact language selector */}
          <div className="sm:hidden flex items-center border border-charcoal/30 bg-white shadow-xs px-1 py-0.5">
            <Globe className="w-3 h-3 text-gold mr-1 shrink-0" />
            <select
              id="navbar-mobile-lang"
              name="language"
              aria-label="Language Selector"
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-transparent text-[10px] font-bold text-charcoal focus:outline-none py-0.5"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Direct Verify Link */}
          <Link
            href="/verify"
            className="hidden md:flex text-xs uppercase tracking-widest font-bold text-charcoal hover:text-gold transition-colors duration-300 items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-gold" />
            <span>{t("verifyNav")}</span>
          </Link>

          {/* Portal Button */}
          <Link
            href="/dashboard"
            className="hidden xs:flex px-3 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold btn-gold-slide items-center gap-1.5 shadow-xs"
          >
            <LayoutDashboard className="w-3 h-3 text-gold" />
            <span className="hidden sm:inline">KVIC Portal</span>
            <span className="sm:hidden">Portal</span>
          </Link>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-charcoal/30 bg-white text-charcoal hover:border-gold transition-colors md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-charcoal" /> : <Menu className="w-4 h-4 text-charcoal" />}
          </button>
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal/15 bg-white px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal/10">
            <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">Navigation Menu</span>
            <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
              Polygon PoS Live
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Link
              href="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-gold" />
                <span>Verify Honey Batch QR</span>
              </div>
              <span className="text-gold">→</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-gold" />
                <span>KVIC Operations Dashboard</span>
              </div>
              <span className="text-gold">→</span>
            </Link>

            <Link
              href="/dashboard/register"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-gold" />
                <span>Register Beekeeper (GPS)</span>
              </div>
              <span className="text-gold">→</span>
            </Link>

            <Link
              href="/dashboard/migration"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🗺️</span>
                <span>Migratory Bloom Planner</span>
              </div>
              <span className="text-gold">→</span>
            </Link>

            <Link
              href="/dashboard/credits"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🌿</span>
                <span>Green Pollination Credits</span>
              </div>
              <span className="text-gold">→</span>
            </Link>

            <Link
              href="/dashboard/pollen"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-2">
                <Microscope className="w-4 h-4 text-gold" />
                <span>Pollen Vision AI</span>
              </div>
              <span className="text-gold">→</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
