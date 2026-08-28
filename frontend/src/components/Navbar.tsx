"use client";

import Link from "next/link";
import { LayoutDashboard, QrCode } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="border-b-2 border-charcoal/15 bg-[#F9F8F6]/95 backdrop-blur-md sticky top-0 z-40 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex justify-between items-center h-20">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 border-2 border-charcoal bg-charcoal text-alabaster flex items-center justify-center font-bold text-xs group-hover:border-gold transition-colors duration-500 shadow-sm">
            <span className="font-serif italic text-gold text-lg">H</span>
          </div>
          <div>
            <span className="text-sm font-bold tracking-widest uppercase block text-charcoal">{t("brandName")}</span>
            <span className="text-[10px] text-warm-grey uppercase tracking-widest block font-medium">{t("brandTag")}</span>
          </div>
        </Link>

        {/* Center Pill: Live Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-charcoal/20 bg-white text-[10px] uppercase tracking-widest text-charcoal font-semibold shadow-xs">
          <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
          <span>{t("liveStatus")}</span>
        </div>

        {/* Right Navigation + Language Switcher */}
        <nav className="flex items-center gap-3 sm:gap-6">
          {/* Indic Language Switcher — Connected to LanguageContext */}
          <div className="flex items-center border border-charcoal/30 bg-white text-[10px] font-bold shadow-xs overflow-x-auto">
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 transition-colors ${lang === "en" ? "bg-charcoal text-gold" : "text-charcoal hover:bg-alabaster"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-2 py-1 transition-colors ${lang === "hi" ? "bg-charcoal text-gold" : "text-charcoal hover:bg-alabaster"}`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang("bn")}
              className={`px-2 py-1 transition-colors ${lang === "bn" ? "bg-charcoal text-gold" : "text-charcoal hover:bg-alabaster"}`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLang("ta")}
              className={`px-2 py-1 transition-colors ${lang === "ta" ? "bg-charcoal text-gold" : "text-charcoal hover:bg-alabaster"}`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLang("kn")}
              className={`px-2 py-1 transition-colors ${lang === "kn" ? "bg-charcoal text-gold" : "text-charcoal hover:bg-alabaster"}`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          <Link
            href="/verify"
            className="text-xs uppercase tracking-widest font-bold text-charcoal hover:text-gold transition-colors duration-300 flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">{t("verifyNav")}</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-4 sm:px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold btn-gold-slide flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3 h-3 text-gold" />
            <span className="hidden sm:inline">KVIC Portal</span>
            <span className="sm:hidden">Portal</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
