"use client";

import { useState } from "react";
import Link from "next/link";
import HoneyChainLogo from "@/components/HoneyChainLogo";
import { useLanguage } from "@/lib/LanguageContext";
import { QrCode, LayoutDashboard, Menu, X, PlusCircle, Microscope, Globe } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 md:px-12 flex justify-between items-center h-16 sm:h-20 gap-1.5 sm:gap-4">
        {/* Brand */}
        <Link href="/" className="group flex items-center shrink-0">
          <HoneyChainLogo size="sm" variant="full" showEndorsement={false} className="sm:hidden" />
          <HoneyChainLogo size="md" variant="full" className="hidden sm:flex" />
        </Link>

        {/* Center Pill: Live Status (Desktop only) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-charcoal/20 bg-white text-[10px] uppercase tracking-widest text-charcoal font-semibold shadow-xs shrink-0">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
          <span>{t("liveStatus")}</span>
        </div>

        {/* Right Navigation & Action Items */}
        <nav className="flex items-center gap-1 sm:gap-2.5 md:gap-4 shrink-0">
          {/* Desktop Language Switcher */}
          <div className="hidden md:flex items-center border border-charcoal/30 bg-white text-[10px] font-bold shadow-2xs">
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

          {/* Mobile & Tablet compact language selector */}
          <div className="md:hidden flex items-center border border-charcoal/30 bg-white shadow-2xs px-1 py-1 shrink-0">
            <Globe className="w-3 h-3 text-gold mr-0.5 shrink-0" />
            <label htmlFor="navbar-mobile-lang" className="sr-only">Language Selector</label>
            <select
              id="navbar-mobile-lang"
              name="language"
              aria-label="Language Selector"
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-transparent text-[10px] font-bold text-charcoal focus:outline-none cursor-pointer"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Direct Verify Link (Icon on mobile, Full on desktop) */}
          <Link
            href="/verify"
            title={t("verifyNav")}
            className="flex items-center gap-1 px-1.5 sm:px-3 py-1.5 border border-charcoal/20 hover:border-gold bg-white text-charcoal hover:text-gold transition-colors text-[10px] uppercase tracking-wider font-bold shadow-2xs shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="hidden sm:inline">{t("verifyNav")}</span>
          </Link>

          {/* Portal Button (Visible on all screens) */}
          <Link
            href="/dashboard"
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest font-bold btn-gold-slide flex items-center gap-1 shadow-2xs shrink-0"
          >
            <LayoutDashboard className="w-3 h-3 text-gold shrink-0" />
            <span className="hidden sm:inline">KVIC Portal</span>
            <span className="sm:hidden">Portal</span>
          </Link>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 border border-charcoal/30 bg-white text-charcoal hover:border-gold transition-colors md:hidden shrink-0"
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
              className="p-4 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-sm md:text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-gold" />
                <span>Verify Honey Batch QR</span>
              </div>
              <span className="text-gold text-lg">→</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="p-4 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-sm md:text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5 text-gold" />
                <span>KVIC Operations Dashboard</span>
              </div>
              <span className="text-gold text-lg">→</span>
            </Link>

            <Link
              href="/dashboard/register"
              onClick={() => setMobileMenuOpen(false)}
              className="p-4 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-sm md:text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 text-gold" />
                <span>Register Beekeeper (GPS)</span>
              </div>
              <span className="text-gold text-lg">→</span>
            </Link>

            <Link
              href="/dashboard/migration"
              onClick={() => setMobileMenuOpen(false)}
              className="p-4 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-sm md:text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🗺️</span>
                <span>Migratory Bloom Planner</span>
              </div>
              <span className="text-gold text-lg">→</span>
            </Link>

            <Link
              href="/dashboard/credits"
              onClick={() => setMobileMenuOpen(false)}
              className="p-4 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-sm md:text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🌿</span>
                <span>Green Pollination Credits</span>
              </div>
              <span className="text-gold text-lg">→</span>
            </Link>

            <Link
              href="/dashboard/pollen"
              onClick={() => setMobileMenuOpen(false)}
              className="p-4 border border-charcoal/15 bg-alabaster/50 hover:bg-alabaster flex items-center justify-between text-sm md:text-xs font-bold text-charcoal uppercase tracking-wider"
            >
              <div className="flex items-center gap-3">
                <Microscope className="w-5 h-5 text-gold" />
                <span>Pollen Vision AI</span>
              </div>
              <span className="text-gold text-lg">→</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
