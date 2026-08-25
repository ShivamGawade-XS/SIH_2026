"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles, LayoutDashboard, QrCode } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-charcoal/10 bg-alabaster/95 backdrop-blur-sm sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex justify-between items-center h-20">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 border border-charcoal bg-charcoal text-alabaster flex items-center justify-center font-bold text-xs group-hover:border-gold transition-colors duration-500">
            <span className="font-serif italic text-gold text-lg">H</span>
          </div>
          <div>
            <span className="text-sm font-semibold tracking-widest uppercase block">HoneyChain</span>
            <span className="text-[10px] text-warm-grey uppercase tracking-widest block">by TrueTag Platform</span>
          </div>
        </Link>

        {/* Center Pill: Live Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 border border-charcoal/10 bg-white text-[10px] uppercase tracking-widest text-warm-grey">
          <span className="w-1.5 h-1.5 bg-emerald-600 animate-pulse" />
          <span>Polygon Sepolia • Live Registry</span>
        </div>

        {/* Right Navigation */}
        <nav className="flex items-center gap-4 md:gap-8">
          <Link
            href="/verify"
            className="text-xs uppercase tracking-widest text-charcoal hover:text-gold transition-colors duration-300 flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Verify Jar</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-[10px] uppercase tracking-widest font-medium btn-gold-slide flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>KVIC Portal</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
