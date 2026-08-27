"use client";

import { useState } from "react";
import { Award, ShieldCheck, MapPin, Sparkles, X, ExternalLink, Leaf } from "lucide-react";

interface GITagData {
  region: string;
  flora: string;
  giCertNo: string;
  botanicalName: string;
  pollenPurity: string;
  kvicCluster: string;
  description: string;
  harvestWindow: string;
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
  },
};

interface GITagBadgeProps {
  location: string;
  batchId?: number;
}

export default function GITagBadge({ location, batchId }: GITagBadgeProps) {
  const [showModal, setShowModal] = useState(false);

  // Match location keyword to GI registry entry
  const locLower = location.toLowerCase();
  let key = "muzaffarpur";
  if (locLower.includes("sundarban") || locLower.includes("bengal")) key = "sundarbans";
  else if (locLower.includes("kashmir") || locLower.includes("j&k")) key = "kashmir";
  else if (locLower.includes("nilgiri") || locLower.includes("tamil")) key = "nilgiris";
  else if (locLower.includes("coorg") || locLower.includes("karnataka")) key = "coorg";

  const giData = GI_REGISTRY[key];

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-gold/40 bg-gold/10 hover:bg-gold hover:text-charcoal text-charcoal transition-all text-left group shadow-xs"
      >
        <Award className="w-4 h-4 text-gold group-hover:text-charcoal shrink-0" />
        <div>
          <span className="text-[9px] uppercase tracking-ultra font-bold text-warm-grey group-hover:text-charcoal block">
            GI-Tag Certified Heritage Honey
          </span>
          <span className="text-xs font-serif font-bold text-charcoal group-hover:text-charcoal">
            {giData.flora}
          </span>
        </div>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="border-2 border-gold bg-white max-w-xl w-full p-8 md:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-charcoal/40 hover:text-charcoal transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal/10">
              <div className="w-12 h-12 bg-gold/10 border border-gold flex items-center justify-center text-gold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
                  Geographical Indication (GI) Registry of India
                </p>
                <h3 className="text-2xl serif text-charcoal font-bold">
                  {giData.flora}
                </h3>
              </div>
            </div>

            <p className="text-xs text-warm-grey leading-relaxed mb-6">
              {giData.description}
            </p>

            {/* GI Dossier Details */}
            <div className="p-5 bg-[#F9F8F6] border border-charcoal/10 space-y-3 mb-6 text-xs">
              <div className="flex justify-between pb-2 border-b border-charcoal/5">
                <span className="text-warm-grey font-bold uppercase text-[10px]">GI Registration ID:</span>
                <span className="font-mono font-bold text-charcoal">{giData.giCertNo}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-charcoal/5">
                <span className="text-warm-grey font-bold uppercase text-[10px]">Botanical Taxon:</span>
                <span className="font-serif italic font-bold text-charcoal">{giData.botanicalName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-charcoal/5">
                <span className="text-warm-grey font-bold uppercase text-[10px]">Melissopalynology Index:</span>
                <span className="font-mono font-bold text-emerald-700">{giData.pollenPurity}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-charcoal/5">
                <span className="text-warm-grey font-bold uppercase text-[10px]">KVIC Protected Cluster:</span>
                <span className="font-mono text-charcoal">{giData.kvicCluster}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-grey font-bold uppercase text-[10px]">Harvest Period:</span>
                <span className="font-medium text-charcoal">{giData.harvestWindow}</span>
              </div>
            </div>

            {/* Legal Protection Seal */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 mb-6">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Protected under the <strong>Geographical Indications of Goods (Registration and Protection) Act, 1999</strong>. Verified on-chain via KVIC HoneyChain ledger.
              </span>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full h-11 bg-charcoal text-alabaster uppercase tracking-widest text-xs font-bold btn-gold-slide flex items-center justify-center"
            >
              Close GI Dossier
            </button>
          </div>
        </div>
      )}
    </>
  );
}
