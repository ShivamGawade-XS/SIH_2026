"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  QrCode,
  LayoutDashboard,
  Compass,
  Sparkles,
  X,
  Volume2,
  Leaf,
  Microscope,
  Mic,
  ShieldCheck,
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [showToolsSheet, setShowToolsSheet] = useState(false);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Verify", href: "/verify", icon: QrCode, highlight: true },
    { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
    { label: "Map", href: "/dashboard/migration", icon: Compass },
    {
      label: "AI Tools",
      onClick: () => setShowToolsSheet(true),
      icon: Sparkles,
      isAction: true,
    },
  ];

  const aiTools = [
    {
      title: "Bio-Acoustic Spectrogram",
      desc: "Swarm risk & frequency diagnostics",
      href: "/dashboard#acoustic",
      icon: Volume2,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Pollen Vision AI",
      desc: "Melissopalynology slide classifier",
      href: "/dashboard/pollen",
      icon: Microscope,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Green Pollination Credits",
      desc: "Carbon offset & impact tokenizer",
      href: "/dashboard/credits",
      icon: Leaf,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Voice Field Assistant",
      desc: "6-language speech assistant",
      href: "/dashboard#voice",
      icon: Mic,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Quality Predictor",
      desc: "FSSAI IS 4941 NMR scoring",
      href: "/dashboard/quality",
      icon: ShieldCheck,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
  ];

  return (
    <>
      {/* ─── STICKY BOTTOM NAV BAR (Mobile Only: md:hidden) ───────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 shadow-2xl safe-area-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href ? pathname === item.href : false;

            if (item.isAction) {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center py-1 px-2.5 min-w-[56px] text-warm-grey hover:text-gold active:scale-95 transition-all"
                >
                  <div className="relative p-1 rounded-full text-gold">
                    <Icon className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-mono tracking-tight mt-0.5 text-gold font-bold">
                    {item.label}
                  </span>
                </button>
              );
            }

            if (item.highlight) {
              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className="flex flex-col items-center justify-center py-1 px-3 -mt-4 group active:scale-95 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-gold text-charcoal border-2 border-[#121212] shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-tight mt-0.5 text-alabaster">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`flex flex-col items-center justify-center py-1 px-2.5 min-w-[56px] active:scale-95 transition-all ${
                  isActive ? "text-gold font-bold" : "text-warm-grey/80 hover:text-alabaster"
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? "bg-gold/10" : ""}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono tracking-tight mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── QUICK AI TOOLS BOTTOM SHEET (Mobile Modal) ───────────────── */}
      {showToolsSheet && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setShowToolsSheet(false)}
          />

          <div className="relative bg-[#1A1918] border-t-2 border-gold/40 rounded-t-2xl p-5 pb-8 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-2" />

            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <h3 className="text-base serif font-bold text-alabaster">
                  HoneyChain AI Tool Suite
                </h3>
              </div>
              <button
                onClick={() => setShowToolsSheet(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-warm-grey flex items-center justify-center hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {aiTools.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <Link
                    key={tool.title}
                    href={tool.href}
                    onClick={() => setShowToolsSheet(false)}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-gold/50 active:scale-[0.98] transition-all flex items-center gap-3.5"
                  >
                    <div className={`w-10 h-10 rounded-lg ${tool.bgColor} ${tool.color} flex items-center justify-center shrink-0`}>
                      <ToolIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-alabaster truncate">
                        {tool.title}
                      </h4>
                      <p className="text-[11px] font-mono text-warm-grey truncate">
                        {tool.desc}
                      </p>
                    </div>
                    <span className="text-xs text-gold font-mono font-bold shrink-0">
                      Launch →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
