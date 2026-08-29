"use client";

import React, { useId } from "react";

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
  const uid = useId().replace(/:/g, "");

  const sizeMap = {
    sm: { icon: "w-8 h-8", text: "text-xs", sub: "text-[8px]", badge: "text-[7px] py-0.5 px-1.5" },
    md: { icon: "w-10 h-10", text: "text-sm", sub: "text-[9px]", badge: "text-[8px] py-0.5 px-2" },
    lg: { icon: "w-14 h-14", text: "text-xl", sub: "text-[11px]", badge: "text-[9px] py-1 px-2.5" },
    xl: { icon: "w-20 h-20", text: "text-3xl", sub: "text-xs", badge: "text-[10px] py-1 px-3" },
  };

  const currentSize = sizeMap[size];

  // Colors based on theme
  const isDark = theme === "dark";
  const primaryTextColor = isDark ? "text-alabaster" : "text-charcoal";
  const subTextColor = isDark ? "text-taupe/70" : "text-warm-grey";
  const badgeBg = isDark ? "bg-charcoal/80 text-gold border-gold/40" : "bg-alabaster text-charcoal border-charcoal/30";

  // Nature-Forward Organic SVG Icon: Honeycomb + Leaf-Wing Bee + Amber Drop + Emerald Sprout + Node Links
  const HexIcon = (
    <div className={`relative ${currentSize.icon} shrink-0 group ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-md transition-transform duration-500 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Amber Honey Glow Gradient */}
          <linearGradient id={`goldGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Organic Emerald Leaf Gradient */}
          <linearGradient id={`leafGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Hexagon Surface Gradient */}
          <linearGradient id={`hexBg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1C1917" />
            <stop offset="100%" stopColor="#0C0A09" />
          </linearGradient>

          {/* Radial Nectar Core Flare */}
          <radialGradient id={`nectarFlare-${uid}`} cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#FBBF24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Outer Honeycomb Hexagon Frame */}
        <polygon
          points="50,4 92,27 92,73 50,96 8,73 8,27"
          fill={`url(#hexBg-${uid})`}
          stroke={`url(#goldGrad-${uid})`}
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* Inner Geometric Security Contour */}
        <polygon
          points="50,12 85,31 85,69 50,88 15,69 15,31"
          stroke="#F59E0B"
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeDasharray="3 2"
        />

        {/* Blockchain Node Link Struts */}
        <line x1="50" y1="4" x2="50" y2="14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="92" y1="27" x2="83" y2="32" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="92" y1="73" x2="83" y2="68" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="96" x2="50" y2="86" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="73" x2="17" y2="68" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="27" x2="17" y2="32" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />

        {/* Corner Blockchain Micro-Nodes */}
        <circle cx="50" cy="4" r="2.2" fill="#FEF3C7" />
        <circle cx="92" cy="27" r="2.2" fill="#FEF3C7" />
        <circle cx="92" cy="73" r="2.2" fill="#FEF3C7" />
        <circle cx="50" cy="96" r="2.2" fill="#FEF3C7" />
        <circle cx="8" cy="73" r="2.2" fill="#FEF3C7" />
        <circle cx="8" cy="27" r="2.2" fill="#FEF3C7" />

        {/* Organic Honey Nectar Droplet */}
        <path
          d="M50 20 C50 20, 31 43, 31 59 C31 70, 39.5 78, 50 78 C60.5 78, 69 70, 69 59 C69 43, 50 20, 50 20 Z"
          fill={`url(#goldGrad-${uid})`}
        />
        {/* Nectar Specular Highlight */}
        <ellipse cx="44" cy="48" rx="5" ry="10" transform="rotate(-25 44 48)" fill="#FFFBEB" opacity="0.45" />

        {/* Left Leaf-Wing */}
        <path
          d="M48 40 C34 32, 22 40, 24 53 C26 62, 38 60, 48 48 Z"
          fill="#1C1917"
          stroke={`url(#goldGrad-${uid})`}
          strokeWidth="1.5"
          opacity="0.95"
        />
        {/* Left Wing Botanical Veins */}
        <path d="M26 50 C33 46, 42 45, 47 44" stroke="#F59E0B" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
        <path d="M30 55 C36 52, 42 49, 46 47" stroke="#F59E0B" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />

        {/* Right Leaf-Wing */}
        <path
          d="M52 40 C66 32, 78 40, 76 53 C74 62, 62 60, 52 48 Z"
          fill="#1C1917"
          stroke={`url(#goldGrad-${uid})`}
          strokeWidth="1.5"
          opacity="0.95"
        />
        {/* Right Wing Botanical Veins */}
        <path d="M74 50 C67 46, 58 45, 53 44" stroke="#F59E0B" strokeWidth="0.9" strokeLinecap="round" opacity="0.8" />
        <path d="M70 55 C64 52, 58 49, 54 47" stroke="#F59E0B" strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />

        {/* Bee Central Thorax & Abdomen Body */}
        {/* Head & Antennae */}
        <path d="M48 30 C46 25, 42 24, 40 25" stroke="#FEF3C7" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M52 30 C54 25, 58 24, 60 25" stroke="#FEF3C7" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="50" cy="33" r="3.2" fill="#1C1917" stroke="#FEF3C7" strokeWidth="1.2" />

        {/* Thorax */}
        <ellipse cx="50" cy="41" rx="4.5" ry="4" fill="#F59E0B" stroke="#1C1917" strokeWidth="1" />

        {/* Abdomen with Golden & Dark Striped Segments */}
        <path
          d="M45.5 45 C45.5 45, 44 57, 50 63 C56 57, 54.5 45, 54.5 45 Z"
          fill="#1C1917"
        />
        {/* Abdomen Amber Stripes */}
        <path d="M46 48 Q50 51 54 48" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M46.8 53 Q50 56 53.2 53" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M48 58 Q50 60 52 58" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />

        {/* Botanical Organic Leaf Sprout on Bottom Right Accent */}
        <path
          d="M62 65 C72 63, 76 72, 73 78 C65 78, 62 72, 62 65 Z"
          fill={`url(#leafGrad-${uid})`}
          stroke="#065F46"
          strokeWidth="0.8"
        />
        <path d="M64 72 Q69 70 72 75" stroke="#D1FAE5" strokeWidth="0.7" strokeLinecap="round" opacity="0.8" />
      </svg>

      {/* Pulsing Live Ledger Verification Dot */}
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-black/10 animate-pulse" />
    </div>
  );

  if (variant === "icon") {
    return HexIcon;
  }

  if (variant === "seal") {
    return (
      <div className={`inline-flex flex-col items-center p-5 border-2 ${isDark ? "border-gold/30 bg-charcoal text-alabaster" : "border-charcoal/20 bg-white text-charcoal"} shadow-sm text-center relative overflow-hidden group`}>
        {/* Decorative Golden Seal Corner Accents */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-gold/60" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-gold/60" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-gold/60" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-gold/60" />

        {HexIcon}

        <div className="mt-3.5">
          <span className="font-serif font-bold tracking-widest text-sm uppercase block">
            Honey<span className="text-gold">Chain</span>
          </span>
          <span className="text-[9px] uppercase tracking-ultra text-warm-grey font-mono block mt-1 flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Organic • KVIC Provenance
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {HexIcon}
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
