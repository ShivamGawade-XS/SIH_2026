"use client";

import React from "react";
import Image from "next/image";

export type LogoVariant = "icon" | "full" | "seal" | "badge" | "stacked";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type LogoTheme = "light" | "dark" | "auto";

export interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  theme?: LogoTheme;
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
  const sizeMap: Record<LogoSize, { icon: string; px: number; text: string; sub: string; badge: string }> = {
    xs: { icon: "w-6 h-6", px: 24, text: "text-[11px]", sub: "text-[7px]", badge: "text-[6px] py-0.2 px-1" },
    sm: { icon: "w-8 h-8", px: 32, text: "text-xs", sub: "text-[8px]", badge: "text-[7px] py-0.5 px-1.5" },
    md: { icon: "w-10 h-10", px: 40, text: "text-sm", sub: "text-[9px]", badge: "text-[8px] py-0.5 px-2" },
    lg: { icon: "w-14 h-14", px: 56, text: "text-xl", sub: "text-[11px]", badge: "text-[9px] py-1 px-2.5" },
    xl: { icon: "w-20 h-20", px: 80, text: "text-3xl", sub: "text-xs", badge: "text-[10px] py-1 px-3" },
    "2xl": { icon: "w-28 h-28", px: 112, text: "text-4xl", sub: "text-sm", badge: "text-xs py-1.5 px-3.5" },
  };

  const currentSize = sizeMap[size];

  // Contrast adjustments for light vs dark surfaces
  const isDark = theme === "dark";
  const primaryTextColor = isDark ? "text-alabaster" : "text-charcoal";
  const subTextColor = isDark ? "text-taupe/70" : "text-warm-grey";
  const badgeBg = isDark
    ? "bg-charcoal/80 text-gold border-gold/40"
    : "bg-alabaster text-charcoal border-charcoal/30";

  // 1. MINIMAL APP ICON (Honey Drop + Leaf Wing inside Carbon Hexagon)
  const LogoIcon = (
    <div className={`relative ${currentSize.icon} shrink-0 group ${className}`}>
      <div className="w-full h-full relative rounded-xl overflow-hidden border border-gold/50 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-gold group-hover:shadow-md bg-[#121212]">
        <Image
          src="/honeychain_app_icon.jpg"
          alt="HoneyChain App Icon"
          width={currentSize.px}
          height={currentSize.px}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />
      </div>

      {/* Pulsing Live Verification Dot */}
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-black/10 animate-pulse z-10" />
    </div>
  );

  // 2. EMBLEM BADGE (Circular/Hexagonal Floral Bee Luxury Seal)
  const LogoBadge = (
    <div className={`relative ${currentSize.icon} shrink-0 group ${className}`}>
      <div className="w-full h-full relative rounded-2xl overflow-hidden border-2 border-gold/70 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-gold bg-[#121212]">
        <Image
          src="/honeychain_logo_badge.jpg"
          alt="HoneyChain Emblem Badge"
          width={currentSize.px}
          height={currentSize.px}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-2xl pointer-events-none" />
      </div>
    </div>
  );

  if (variant === "icon") {
    return LogoIcon;
  }

  if (variant === "badge") {
    return LogoBadge;
  }

  // 3. OFFICIAL PROVENANCE SEAL (With Corner Brackets & Credential Subtitle)
  if (variant === "seal") {
    const sealDim = size === "xl" ? "w-36 h-36" : size === "2xl" ? "w-48 h-48" : "w-28 h-28";
    const sealPx = size === "xl" ? 144 : size === "2xl" ? 192 : 112;

    return (
      <div
        className={`inline-flex flex-col items-center p-4 border-2 ${
          isDark ? "border-gold/30 bg-[#141414] text-alabaster" : "border-charcoal/20 bg-white text-charcoal"
        } shadow-md text-center relative rounded-2xl overflow-hidden group ${className}`}
      >
        {/* Decorative Golden Corner Accents */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-gold/70" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-gold/70" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-gold/70" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-gold/70" />

        {/* Emblem Image Asset */}
        <div className={`${sealDim} relative rounded-xl overflow-hidden border border-gold/40 shadow-sm transition-transform duration-500 group-hover:scale-102 bg-[#121212]`}>
          <Image
            src="/honeychain_logo_badge.jpg"
            alt="HoneyChain Organic Emblem"
            width={sealPx}
            height={sealPx}
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

  // 4. CENTERED STACKED LOCKUP (Used in Auth/Hero/Modals)
  if (variant === "stacked") {
    return (
      <div className={`inline-flex flex-col items-center text-center gap-3 ${className}`}>
        <div className="relative">
          <div className={`${currentSize.icon} relative rounded-2xl overflow-hidden border-2 border-gold/60 shadow-md bg-[#121212] transition-transform group-hover:scale-105`}>
            <Image
              src="/honeychain_logo_badge.jpg"
              alt="HoneyChain Brand"
              width={currentSize.px}
              height={currentSize.px}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-black/10 animate-pulse" />
        </div>

        <div className="flex flex-col items-center">
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
          <span className={`uppercase tracking-ultra font-medium ${subTextColor} ${currentSize.sub} mt-0.5`}>
            KVIC • National Bee Board
          </span>
        </div>
      </div>
    );
  }

  // 5. STANDARD HORIZONTAL LOCKUP (Default — Navbars, Footers, Headers)
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

// Named exports for quick convenience
export function HoneyChainIcon(props: Omit<LogoProps, "variant">) {
  return <HoneyChainLogo {...props} variant="icon" />;
}

export function HoneyChainBadge(props: Omit<LogoProps, "variant">) {
  return <HoneyChainLogo {...props} variant="badge" />;
}

export function HoneyChainSeal(props: Omit<LogoProps, "variant">) {
  return <HoneyChainLogo {...props} variant="seal" />;
}
