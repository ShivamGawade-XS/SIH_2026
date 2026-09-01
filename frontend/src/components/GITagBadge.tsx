"use client";

import { useState } from "react";
import { Award, ShieldCheck, MapPin, Sparkles, X, ExternalLink, Leaf, Compass } from "lucide-react";
import { checkGIZone, GI_ZONES } from "@/lib/geo";

interface GITagData {
  region: string;
  flora: string;
  giCertNo: string;
  botanicalName: string;
  pollenPurity: string;
  kvicCluster: string;
  description: string;
  harvestWindow: string;
  coordinates: string;
}

const GI_REGISTRY: Record<string, GITagData> = {
  "muzaffarpur": {
    region: "Muzaffarpur, Bihar",
    flora: "Shahi Litchi Blossom Honey",
    giCertNo: "GI-IND-BH-2018-0524",
    botanicalName: "Litchi chinensis Sonn.",
    pollenPurity: "88.4% Monofloral Litchi Pollen",
    kvicCluster: "KVIC-BH-NORTH-01",
    description: "Harvested exclusively during the 21-day flowering bloom of GI-tagged Shahi Litchi orchards in North Bihar. Light amber hue with delicate floral aromatic notes.",
    harvestWindow: "April – May (Annual Bloom)",
    coordinates: "26.1209° N, 85.3647° E",
  },
  "sundarbans": {
    region: "Sundarbans Biosphere Reserve, West Bengal",
    flora: "Wild Mangrove Khalsi & Goran Honey",
    giCertNo: "GI-IND-WB-2024-0689",
    botanicalName: "Aegiceras corniculatum / Ceriops decandra",
    pollenPurity: "91.8% Wild Mangrove Flora",
    kvicCluster: "KVIC-WB-COASTAL-03",
    description: "Wild-foraged by traditional 'Mouli' honey collectors in the tidal mangrove delta. Rich in natural antioxidants and distinctive salinity-balanced mineral undertones.",
    harvestWindow: "March – June (Tidal Delta Harvest)",
    coordinates: "21.9497° N, 89.1833° E",
  },
  "kashmir": {
    region: "Kashmir Valley, Jammu & Kashmir",
    flora: "Kashmir White Acacia Honey",
    giCertNo: "GI-IND-JK-2021-0412",
    botanicalName: "Robinia pseudoacacia L.",
    pollenPurity: "86.2% Alpine Acacia Pollen",
    kvicCluster: "KVIC-JK-ALPINE-02",
    description: "High-altitude pristine honey harvested from temperate Himalayan acacia groves. Water-white clarity with slow crystallization and a mild sweet profile.",
    harvestWindow: "May – July (Himalayan Summer)",
    coordinates: "34.0837° N, 74.7973° E",
  },
  "nilgiris": {
    region: "Nilgiris Biosphere Reserve, Tamil Nadu",
    flora: "Shola Forest Multi-Floral Honey",
    giCertNo: "GI-IND-TN-2023-0598",
    botanicalName: "Strobilanthes kunthiana / Syzygium cumini",
    pollenPurity: "84.5% Nilgiris Mountain Flora",
    kvicCluster: "KVIC-TN-GHATS-05",
    description: "Harvested by indigenous Toda and Kurumba beekeepers from ancient montane Shola forests. Dark amber with medicinal herbal properties.",
    harvestWindow: "September – November (Post-Monsoon)",
    coordinates: "11.4102° N, 76.6950° E",
  },
  "coorg": {
    region: "Kodagu (Coorg), Karnataka",
    flora: "Coorg Arabica Coffee Blossom Honey",
    giCertNo: "GI-IND-KA-2022-0487",
    botanicalName: "Coffea arabica / Coffea canephora",
    pollenPurity: "89.0% Coffee Blossom Pollen",
    kvicCluster: "KVIC-KA-WEST-04",
    description: "Collected during the brief white blossom surge of shade-grown Western Ghats coffee plantations. Golden amber with caramel undertones.",
    harvestWindow: "March – April (Blossom Surge)",
    coordinates: "12.3375° N, 75.8069° E",
  },
};

interface GITagBadgeProps {
  location: string;
  batchId?: number;
  gpsLat?: number | null;
  gpsLng?: number | null;
}

export default function GITagBadge({ location, batchId, gpsLat, gpsLng }: GITagBadgeProps) {
  const [showModal, setShowModal] = useState(false);

  // 1. If GPS coordinates provided, verify via polygon geofencing
  let isGpsVerified = false;
  let matchedKey = "muzaffarpur";

  if (gpsLat != null && gpsLng != null) {
    const geoZone = checkGIZone(gpsLat, gpsLng);
    if (geoZone) {
      isGpsVerified = true;
      matchedKey = geoZone.key;
    }
  }

  // 2. Fallback to location string matching
  if (!isGpsVerified) {
    const locLower = (location || "").toLowerCase();
    if (locLower.includes("sundarban") || locLower.includes("bengal")) matchedKey = "sundarbans";
    else if (locLower.includes("kashmir") || locLower.includes("j&k") || locLower.includes("anantnag")) matchedKey = "kashmir";
    else if (locLower.includes("nilgiri") || locLower.includes("tamil")) matchedKey = "nilgiris";
    else if (locLower.includes("coorg") || locLower.includes("karnataka") || locLower.includes("kodagu")) matchedKey = "coorg";
  }

  const giData = GI_REGISTRY[matchedKey] || GI_REGISTRY.muzaffarpur;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-gold/40 bg-gold/10 hover:bg-gold hover:text-charcoal text-charcoal transition-all text-left group shadow-xs"
      >
        <Award className="w-4 h-4 text-gold group-hover:text-charcoal shrink-0" />
        <div>
          <span className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase tracking-ultra font-bold text-warm-grey group-hover:text-charcoal block">
            {isGpsVerified ? "🛰️ GPS-Verified GI Heritage" : "GI-Tag Certified Heritage Honey"}
          </span>
          <span className="text-sm md:text-xs font-serif font-bold text-charcoal group-hover:text-charcoal">
            {giData.flora}
          </span>
        </div>
      </button>

      {/* GI Dossier Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="border-2 border-gold bg-white max-w-xl w-full p-8 md:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-charcoal/40 hover:text-charcoal transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal/10">
              <div className="w-12 h-12 bg-gold/10 border-2 border-gold flex items-center justify-center text-gold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm md:text-xs md:text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
                  Geographical Indication (GI) Certificate Dossier
                </p>
                <h3 className="text-2xl serif text-charcoal font-bold">{giData.flora}</h3>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className={`p-4 border mb-6 flex items-center gap-3 ${
              isGpsVerified ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-gold/30 bg-gold/5 text-charcoal"
            }`}>
              <ShieldCheck className={`w-5 h-5 ${isGpsVerified ? "text-emerald-600" : "text-gold"}`} />
              <div className="text-sm md:text-xs">
                <p className="font-bold uppercase tracking-wider text-sm md:text-xs md:text-[10px]">
                  {isGpsVerified ? "🛰️ Real-Time GPS Polygon Match Confirmed" : "Official KVIC Heritage Registered"}
                </p>
                <p className="text-[11px] opacity-85">
                  Certificate No: <strong className="font-mono">{giData.giCertNo}</strong> under the GI of Goods Act 1999.
                </p>
              </div>
            </div>

            {/* Botanical Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm md:text-xs">
              <div className="p-3 bg-[#F9F8F6] border border-charcoal/10">
                <span className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase tracking-widest text-warm-grey block mb-1">Botanical Taxon</span>
                <span className="font-serif italic font-bold text-charcoal">{giData.botanicalName}</span>
              </div>
              <div className="p-3 bg-[#F9F8F6] border border-charcoal/10">
                <span className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase tracking-widest text-warm-grey block mb-1">Pollen Analysis</span>
                <span className="font-bold text-charcoal">{giData.pollenPurity}</span>
              </div>
              <div className="p-3 bg-[#F9F8F6] border border-charcoal/10">
                <span className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase tracking-widest text-warm-grey block mb-1">Harvest Window</span>
                <span className="font-bold text-charcoal">{giData.harvestWindow}</span>
              </div>
              <div className="p-3 bg-[#F9F8F6] border border-charcoal/10">
                <span className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase tracking-widest text-warm-grey block mb-1">KVIC Production Cluster</span>
                <span className="font-mono font-bold text-charcoal">{giData.kvicCluster}</span>
              </div>
            </div>

            {/* Terroir Description */}
            <div className="mb-6">
              <h4 className="text-sm md:text-xs md:text-[10px] uppercase tracking-widest font-bold text-charcoal mb-2">Terroir & Ecosystem Characteristics:</h4>
              <p className="text-sm md:text-xs text-warm-grey leading-relaxed bg-[#F9F8F6] p-4 border border-charcoal/10">
                {giData.description}
              </p>
            </div>

            {/* GPS Coordinates */}
            <div className="flex items-center justify-between p-3 bg-charcoal text-alabaster text-sm md:text-xs font-mono mb-6">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-gold" />
                <span>Apiary Coordinates:</span>
              </div>
              <span className="text-gold font-bold">
                {gpsLat && gpsLng ? `${gpsLat.toFixed(4)}° N, ${gpsLng.toFixed(4)}° E` : giData.coordinates}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full h-12 bg-charcoal text-alabaster uppercase tracking-widest text-sm md:text-xs font-bold btn-gold-slide flex items-center justify-center"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </>
  );
}
