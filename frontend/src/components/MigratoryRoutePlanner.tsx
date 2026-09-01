"use client";

import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  Truck,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Compass,
  ArrowRight,
  Download,
  CheckCircle2,
  Sparkles,
  Layers,
  Leaf,
  Navigation,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import HoneyChainLogo, { HoneyChainBadge } from "./HoneyChainLogo";

interface FloraBloom {
  id: string;
  name: string;
  botanicalName: string;
  state: string;
  region: string;
  bloomWindow: string;
  months: number[]; // 0 = Jan, 11 = Dec
  nectarRating: "VERY_HIGH" | "HIGH" | "MEDIUM";
  avgYieldPerBoxKg: number;
  giTagStatus: string;
  color: string;
}

interface MigrationRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  transitHours: number;
  departureWindow: string;
  targetFlora: string;
  convoySizeBoxes: number;
  truckRegNumber: string;
  driverName: string;
  driverPhone: string;
  status: "SCHEDULED" | "IN_TRANSIT" | "ARRIVED";
  transitTempLimitC: number;
  currentTransitTempC?: number;
}

const FLORAL_BLOOMS: FloraBloom[] = [
  {
    id: "mustard",
    name: "Mustard / Sarson Bloom",
    botanicalName: "Brassica napus",
    state: "Rajasthan & Haryana",
    region: "Bharatpur, Alwar & Hisar",
    bloomWindow: "October — December",
    months: [9, 10, 11],
    nectarRating: "VERY_HIGH",
    avgYieldPerBoxKg: 24.5,
    giTagStatus: "Geographical Indication Applied",
    color: "#F59E0B",
  },
  {
    id: "litchi",
    name: "Royal Litchi Nectar",
    botanicalName: "Litchi chinensis",
    state: "Bihar & Uttarakhand",
    region: "Muzaffarpur & Dehradun",
    bloomWindow: "February — March",
    months: [1, 2],
    nectarRating: "VERY_HIGH",
    avgYieldPerBoxKg: 18.2,
    giTagStatus: "Shahi Litchi GI Tagged (GI-552)",
    color: "#E11D48",
  },
  {
    id: "acacia",
    name: "Kashmir White Acacia",
    botanicalName: "Robinia pseudoacacia",
    state: "Jammu & Kashmir",
    region: "Anantnag, Pulwama & Kupwara",
    bloomWindow: "April — May",
    months: [3, 4],
    nectarRating: "VERY_HIGH",
    avgYieldPerBoxKg: 14.0,
    giTagStatus: "Kashmir Acacia GI Tagged (GI-731)",
    color: "#0284C7",
  },
  {
    id: "mangrove",
    name: "Sundarbans Wild Mangrove (Khalsi)",
    botanicalName: "Aegiceras corniculatum",
    state: "West Bengal",
    region: "Sundarbans Biosphere Reserve",
    bloomWindow: "April — June",
    months: [3, 4, 5],
    nectarRating: "HIGH",
    avgYieldPerBoxKg: 12.8,
    giTagStatus: "Sundarbans Honey GI Tagged (GI-712)",
    color: "#059669",
  },
  {
    id: "sunflower",
    name: "Deccan Sunflower",
    botanicalName: "Helianthus annuus",
    state: "Karnataka & Maharashtra",
    region: "Belagavi, Bagalkot & Solapur",
    bloomWindow: "July — September",
    months: [6, 7, 8],
    nectarRating: "HIGH",
    avgYieldPerBoxKg: 16.5,
    giTagStatus: "Commercial Agro-Cluster",
    color: "#D97706",
  },
  {
    id: "jamun",
    name: "Western Ghats Jamun / Wild Flora",
    botanicalName: "Syzygium cumini",
    state: "Maharashtra",
    region: "Mahabaleshwar & Satara",
    bloomWindow: "May — June",
    months: [4, 5],
    nectarRating: "MEDIUM",
    avgYieldPerBoxKg: 10.5,
    giTagStatus: "Mahabaleshwar Honey GI Tagged",
    color: "#7C3AED",
  },
];

const MIGRATION_ROUTES: MigrationRoute[] = [
  {
    id: "R-01",
    name: "Northern Brassica ➔ Shahi Litchi Corridor",
    origin: "Bharatpur, Rajasthan",
    destination: "Muzaffarpur, Bihar",
    distanceKm: 860,
    transitHours: 18,
    departureWindow: "Late January (Night Transit)",
    targetFlora: "Royal Litchi Nectar (GI-552)",
    convoySizeBoxes: 450,
    truckRegNumber: "RJ-05-GA-8821",
    driverName: "Sardar Manjit Singh",
    driverPhone: "+91 98765 43210",
    status: "IN_TRANSIT",
    transitTempLimitC: 34.0,
    currentTransitTempC: 27.4,
  },
  {
    id: "R-02",
    name: "Punjab Plains ➔ Himalayan Acacia Transit",
    origin: "Ludhiana, Punjab",
    destination: "Anantnag, Jammu & Kashmir",
    distanceKm: 470,
    transitHours: 12,
    departureWindow: "Mid April (Pre-Dawn Transit)",
    targetFlora: "Kashmir White Acacia (GI-731)",
    convoySizeBoxes: 600,
    truckRegNumber: "PB-10-CX-4102",
    driverName: "Gurpreet Singh",
    driverPhone: "+91 98123 45678",
    status: "SCHEDULED",
    transitTempLimitC: 32.0,
    currentTransitTempC: 24.1,
  },
  {
    id: "R-03",
    name: "Deccan Sunflower ➔ Mahabaleshwar Forest",
    origin: "Belagavi, Karnataka",
    destination: "Mahabaleshwar, Maharashtra",
    distanceKm: 310,
    transitHours: 7.5,
    departureWindow: "Early May (Overnight)",
    targetFlora: "Western Ghats Jamun & Karvi",
    convoySizeBoxes: 320,
    truckRegNumber: "KA-22-B-9014",
    driverName: "Basavaraj Patil",
    driverPhone: "+91 94481 23456",
    status: "ARRIVED",
    transitTempLimitC: 35.0,
    currentTransitTempC: 22.8,
  },
];

export default function MigratoryRoutePlanner() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedRouteId, setSelectedRouteId] = useState<string>("R-01");
  const [showPassModal, setShowPassModal] = useState<boolean>(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const activeBlooms = FLORAL_BLOOMS.filter((b) => b.months.includes(selectedMonth));
  const selectedRoute = MIGRATION_ROUTES.find((r) => r.id === selectedRouteId) || MIGRATION_ROUTES[0];

  const passVerifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/dashboard/migration?pass_id=KVIC-MIG-${selectedRoute.id}-2026`
    : `https://honeychain-truetag.vercel.app/dashboard/migration?pass_id=KVIC-MIG-${selectedRoute.id}-2026`;

  return (
    <div className="border-2 border-charcoal/20 bg-white shadow-luxury-card overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-charcoal text-alabaster border-b border-charcoal flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-gold bg-[#121212] rounded-xl flex items-center justify-center text-gold">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-ultra text-gold font-mono font-bold">
                KVIC National Apiculture Logistics
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[8px] font-mono uppercase font-bold">
                1.5M+ Active Colonies
              </span>
            </div>
            <h2 className="text-xl serif text-alabaster font-normal">
              Pan-India Floral Bloom Calendar & Migratory Route Planner
            </h2>
          </div>
        </div>

        <button
          onClick={() => setShowPassModal(true)}
          className="px-4 py-2 bg-gold text-charcoal hover:bg-gold/90 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Generate KVIC Transit Pass</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Month Selector Bar */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="text-[10px] uppercase tracking-widest text-warm-grey font-bold font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>Select Flowering Calendar Month (Active Blooming Seasons):</span>
            </div>
            <span className="text-xs font-mono font-bold text-charcoal bg-alabaster px-2.5 py-1 border border-charcoal/15">
              Selected: <strong className="text-gold font-sans">{months[selectedMonth]}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {months.map((m, idx) => {
              const isSelected = selectedMonth === idx;
              const hasBlooms = FLORAL_BLOOMS.some((b) => b.months.includes(idx));

              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(idx)}
                  className={`py-2 px-1 text-center border text-[11px] font-mono font-bold transition-all relative ${
                    isSelected
                      ? "bg-charcoal text-gold border-charcoal shadow-sm scale-105 z-10"
                      : hasBlooms
                      ? "bg-gold/10 border-gold/40 text-charcoal hover:bg-gold/20"
                      : "bg-white border-charcoal/15 text-warm-grey/70 hover:border-charcoal/30"
                  }`}
                >
                  <span className="block truncate">{m.slice(0, 3)}</span>
                  {hasBlooms && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mx-auto mt-0.5 block" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Flora Cards for Selected Month */}
        <div>
          <h3 className="text-sm serif font-bold text-charcoal mb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>Nectar Flow & Floral Foraging Zones in {months[selectedMonth]}:</span>
          </h3>

          {activeBlooms.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-charcoal/20 bg-alabaster text-center text-warm-grey text-xs">
              No primary commercial migratory blooms recorded for {months[selectedMonth]}. Colony maintenance & sugar-syrup supplementary feeding season.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBlooms.map((bloom) => (
                <div
                  key={bloom.id}
                  className="p-4 border-2 border-charcoal/15 bg-[#FDFCF7] hover:border-gold transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[9px] uppercase tracking-ultra text-warm-grey font-mono font-bold">
                        {bloom.state}
                      </span>
                      <span
                        className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase"
                        style={{ backgroundColor: `${bloom.color}20`, color: bloom.color, border: `1px solid ${bloom.color}50` }}
                      >
                        {bloom.nectarRating} Nectar
                      </span>
                    </div>

                    <h4 className="text-base serif font-bold text-charcoal mb-0.5">{bloom.name}</h4>
                    <p className="text-[10px] font-serif italic text-warm-grey mb-3">{bloom.botanicalName}</p>

                    <div className="space-y-1 text-xs font-mono mb-3">
                      <p className="flex justify-between text-warm-grey">
                        <span>Hub:</span>
                        <strong className="text-charcoal">{bloom.region}</strong>
                      </p>
                      <p className="flex justify-between text-warm-grey">
                        <span>Flow Window:</span>
                        <strong className="text-charcoal">{bloom.bloomWindow}</strong>
                      </p>
                      <p className="flex justify-between text-warm-grey">
                        <span>Avg. Honey Yield:</span>
                        <strong className="text-gold font-bold">{bloom.avgYieldPerBoxKg} kg / box</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-charcoal/10 flex items-center justify-between text-[10px] text-warm-grey">
                    <span className="truncate">{bloom.giTagStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── ACTIVE MIGRATION ROUTES & CONVOYS ─────────────────────────── */}
        <div className="pt-4 border-t-2 border-charcoal/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold font-mono">
                Interstate Convoy Monitoring
              </span>
              <h3 className="text-lg serif font-bold text-charcoal">
                Active & Scheduled Migration Convoys
              </h3>
            </div>
            <span className="text-xs font-mono text-warm-grey">
              Transit Safety Standard: <strong className="text-emerald-700">Night Hauling &lt; 34°C</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {MIGRATION_ROUTES.map((route) => {
              const isSelected = selectedRouteId === route.id;
              const statusColor =
                route.status === "IN_TRANSIT"
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : route.status === "ARRIVED"
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-blue-100 text-blue-900 border-blue-300";

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-5 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-charcoal bg-white shadow-md scale-[1.01]"
                      : "border-charcoal/15 bg-[#F9F8F6] hover:border-charcoal/40"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-mono font-bold text-gold">ROUTE #{route.id}</span>
                      <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase border ${statusColor}`}>
                        {route.status.replace("_", " ")}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-charcoal mb-2">{route.name}</h4>

                    <div className="p-3 bg-alabaster border border-charcoal/10 rounded mb-3 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-charcoal font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{route.origin}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-warm-grey pl-5">
                        <ArrowRight className="w-3 h-3 text-gold" />
                        <span className="text-[10px]">{route.distanceKm} km ({route.transitHours} hrs)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-charcoal font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{route.destination}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-warm-grey mb-3">
                      <p className="flex justify-between">
                        <span>Convoy Payload:</span>
                        <strong className="text-charcoal">{route.convoySizeBoxes} Bee Boxes</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Truck Number:</span>
                        <strong className="text-charcoal">{route.truckRegNumber}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Transit Temp:</span>
                        <strong className="text-emerald-600">{route.currentTransitTempC}°C (Safe &lt; {route.transitTempLimitC}°C)</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-charcoal/10 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-warm-grey">Driver: {route.driverName}</span>
                    <span className="text-gold font-bold">Select Pass →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── KVIC MIGRATION TRANSIT PASS MODAL ──────────────────────────── */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border-4 border-charcoal bg-[#FDFCF7] max-w-xl w-full p-4 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Outer Security Border Trim */}
            <div className="absolute inset-2 border border-gold/60 pointer-events-none" />

            <div className="text-center border-b-2 border-charcoal/20 pb-4 mb-4">
              <div className="flex justify-center mb-2">
                <HoneyChainLogo size="sm" variant="icon" />
              </div>
              <span className="text-[8px] uppercase tracking-ultra text-warm-grey font-bold block">
                Govt. of India • Ministry of MSME • KVIC
              </span>
              <h3 className="text-xl serif font-bold text-charcoal">
                Interstate Bee Migration Transit Pass
              </h3>
              <p className="text-[9px] font-mono text-gold font-bold mt-0.5">
                PASS ID: KVIC-MIG-{selectedRoute.id}-2026-NBB
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="sm:col-span-2 space-y-2 text-xs font-mono">
                <p><span className="text-warm-grey">Origin:</span> <strong className="text-charcoal">{selectedRoute.origin}</strong></p>
                <p><span className="text-warm-grey">Destination:</span> <strong className="text-charcoal">{selectedRoute.destination}</strong></p>
                <p><span className="text-warm-grey">Transit Route:</span> <strong className="text-charcoal">{selectedRoute.name}</strong></p>
                <p><span className="text-warm-grey">Payload:</span> <strong className="text-charcoal">{selectedRoute.convoySizeBoxes} Apis mellifera Colonies</strong></p>
                <p><span className="text-warm-grey">Truck Reg:</span> <strong className="text-charcoal">{selectedRoute.truckRegNumber}</strong></p>
                <p><span className="text-warm-grey">Authorized Driver:</span> <strong className="text-charcoal">{selectedRoute.driverName} ({selectedRoute.driverPhone})</strong></p>
                <p><span className="text-warm-grey">Target Nectar:</span> <strong className="text-gold font-bold">{selectedRoute.targetFlora}</strong></p>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-white border border-charcoal/20">
                <QRCodeSVG
                  value={passVerifyUrl}
                  size={100}
                  level="H"
                  imageSettings={{
                    src: "/honeychain_app_icon.jpg",
                    height: 22,
                    width: 22,
                    excavate: true,
                  }}
                />
                <span className="text-[8px] font-mono text-warm-grey mt-1 text-center">Highway Checkpoint Scan</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-800 mb-6">
              ✓ Verified by KVIC State Apiculture Officer under National Bee Board Interstate Transit Protocol (Gazette 2020). Highway authorities are requested to grant priority clearance.
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowPassModal(false)}
                className="px-4 py-2 border border-charcoal text-xs uppercase tracking-widest font-mono font-bold text-charcoal hover:bg-alabaster"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-charcoal text-gold hover:bg-black text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Print Official Transit Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
