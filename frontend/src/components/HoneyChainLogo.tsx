"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "icon" | "full" | "seal";
  showEndorsement?: boolean;
}

export default function HoneyChainLogo({
  size = "md",
  variant = "full",
  showEndorsement = true,
}: LogoProps) {
  const sizeMap = {
    sm: { icon: "w-8 h-8", text: "text-xs", sub: "text-[8px]", badge: "text-[7px] py-0.5 px-1.5" },
    md: { icon: "w-10 h-10", text: "text-sm", sub: "text-[9px]", badge: "text-[8px] py-0.5 px-2" },
    lg: { icon: "w-14 h-14", text: "text-xl", sub: "text-[11px]", badge: "text-[9px] py-1 px-2.5" },
    xl: { icon: "w-20 h-20", text: "text-3xl", sub: "text-xs", badge: "text-[10px] py-1 px-3" },
  };

  const currentSize = sizeMap[size];

  // SVG Hexagonal Blockchain Comb + Golden Nectar Core
  const HexIcon = (
    <div className={`relative ${currentSize.icon} shrink-0 group`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full filter drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Hexagon (Charcoal & Gold Outline) */}
        <polygon
          points="50,4 92,27 92,73 50,96 8,73 8,27"
          fill="#141414"
          stroke="#D4AF37"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Guilloche Security Grid */}
        <polygon
          points="50,14 83,33 83,67 50,86 17,67 17,33"
          stroke="rgba(212, 175, 55, 0.25)"
          strokeWidth="1.2"
          strokeDasharray="2 2"
        />

        {/* Blockchain Node Link Lines */}
        <line x1="50" y1="4" x2="50" y2="25" stroke="#D4AF37" strokeWidth="2" />
        <line x1="92" y1="27" x2="74" y2="38" stroke="#D4AF37" strokeWidth="2" />
        <line x1="92" y1="73" x2="74" y2="62" stroke="#D4AF37" strokeWidth="2" />
        <line x1="50" y1="96" x2="50" y2="75" stroke="#D4AF37" strokeWidth="2" />
        <line x1="8" y1="73" x2="26" y2="62" stroke="#D4AF37" strokeWidth="2" />
        <line x1="8" y1="27" x2="26" y2="38" stroke="#D4AF37" strokeWidth="2" />

        {/* Golden Honey Drop with Polygon Facets */}
        <path
          d="M50 25 C50 25, 33 46, 33 60 C33 70, 41 78, 50 78 C59 78, 67 70, 67 60 C67 46, 50 25, 50 25 Z"
          fill="url(#goldGradient)"
        />

        {/* Cryptographic 'H' Monogram in Drop */}
        <text
          x="50"
          y="63"
          textAnchor="middle"
          fill="#141414"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="22"
          fontWeight="bold"
          fontStyle="italic"
        >
          H
        </text>

        {/* Linear Gradient Definitions */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3E5AB" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#997A15" />
          </linearGradient>
        </defs>
      </svg>

      {/* Pulsing Micro-Ledger Verification Dot */}
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-black/10 animate-pulse" />
    </div>
  );

  if (variant === "icon") {
    return HexIcon;
  }

  if (variant === "seal") {
    return (
      <div className="inline-flex flex-col items-center p-4 border-2 border-charcoal/20 bg-white shadow-sm text-center">
        {HexIcon}
        <div className="mt-3">
          <span className="font-serif font-bold tracking-widest text-sm text-charcoal uppercase block">
            HoneyChain
          </span>
          <span className="text-[9px] uppercase tracking-ultra text-warm-grey font-mono block mt-0.5">
            TrueTag • KVIC Provenance
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
          <span className={`font-bold tracking-widest uppercase text-charcoal font-sans ${currentSize.text}`}>
            Honey<span className="text-gold">Chain</span>
          </span>
          {showEndorsement && (
            <span className={`border border-charcoal/30 bg-alabaster uppercase tracking-widest text-charcoal font-mono font-semibold ${currentSize.badge}`}>
              TrueTag™
            </span>
          )}
        </div>
        <span className={`text-warm-grey uppercase tracking-ultra font-medium ${currentSize.sub}`}>
          KVIC • National Bee Board
        </span>
      </div>
    </div>
  );
}
