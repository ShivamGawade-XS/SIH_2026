"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "icon" | "full" | "seal";
  theme?: "light" | "dark" | "auto";
  showEndorsement?: boolean;
  className?: string;
}

export default function HoneyChainLogo({
  size = "md",
  variant = "full",
  theme = "auto",
  showEndorsement = true,
  className = "",
}: LogoProps) {
  const sizeMap = {
    sm: { icon: "w-8 h-8", px: 32, text: "text-xs", sub: "text-[8px]", badge: "text-[7px] py-0.5 px-1.5" },
    md: { icon: "w-10 h-10", px: 40, text: "text-sm", sub: "text-[9px]", badge: "text-[8px] py-0.5 px-2" },
    lg: { icon: "w-14 h-14", px: 56, text: "text-xl", sub: "text-[11px]", badge: "text-[9px] py-1 px-2.5" },
    xl: { icon: "w-20 h-20", px: 80, text: "text-3xl", sub: "text-xs", badge: "text-[10px] py-1 px-3" },
  };

  const currentSize = sizeMap[size];

  // Colors based on theme
  const isDark = theme === "dark";
  const primaryTextColor = isDark ? "text-alabaster" : "text-charcoal";
  const subTextColor = isDark ? "text-taupe/70" : "text-warm-grey";
  const badgeBg = isDark ? "bg-charcoal/80 text-gold border-gold/40" : "bg-alabaster text-charcoal border-charcoal/30";

  // High-Resolution Nature-Forward Brand Icon Asset
  const LogoIcon = (
    <div className={`relative ${currentSize.icon} shrink-0 group ${className}`}>
      <div className="w-full h-full relative rounded-xl overflow-hidden border border-gold/50 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-gold group-hover:shadow-md bg-[#121212]">
        <Image
          src="/honeychain_app_icon.jpg"
          alt="HoneyChain Logo"
          width={currentSize.px}
          height={currentSize.px}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />
      </div>

      {/* Pulsing Live Ledger Verification Dot */}
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-black/10 animate-pulse z-10" />
    </div>
  );

  if (variant === "icon") {
    return LogoIcon;
  }

  // Full Emblem Seal
  if (variant === "seal") {
    return (
      <div className={`inline-flex flex-col items-center p-4 border-2 ${isDark ? "border-gold/30 bg-[#141414] text-alabaster" : "border-charcoal/20 bg-white text-charcoal"} shadow-md text-center relative rounded-2xl overflow-hidden group`}>
        {/* Decorative Golden Corner Accents */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-gold/70" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-gold/70" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-gold/70" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-gold/70" />

        {/* Emblem Image Asset */}
        <div className="w-36 h-36 relative rounded-xl overflow-hidden border border-gold/40 shadow-sm transition-transform duration-500 group-hover:scale-102 bg-[#121212]">
          <Image
            src="/honeychain_logo_badge.jpg"
            alt="HoneyChain Organic Emblem"
            width={144}
            height={144}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-xl pointer-events-none" />
        </div>

        <div className="mt-3">
          <span className="font-serif font-bold tracking-widest text-sm uppercase block">
            Honey<span className="text-gold">Chain</span>
          </span>
          <span className="text-[9px] uppercase tracking-ultra text-warm-grey font-mono block mt-1 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Organic • KVIC Provenance
          </span>
        </div>
      </div>
    );
  }

  // Full Horizontal Brand Lockup
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {LogoIcon}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-widest uppercase font-sans ${currentSize.text} ${primaryTextColor}`}>
            Honey<span className="text-gold">Chain</span>
          </span>
          {showEndorsement && (
            <span className={`border uppercase tracking-widest font-mono font-semibold ${badgeBg} ${currentSize.badge}`}>
              TrueTag™
            </span>
          )}
        </div>
        <span className={`uppercase tracking-ultra font-medium ${subTextColor} ${currentSize.sub}`}>
          KVIC • National Bee Board
        </span>
      </div>
    </div>
  );
}
