"use client";

import { Farmer } from "@/lib/types";
import { MapPin, Compass, Mountain, Flower2, ThermometerSun, Wind } from "lucide-react";

interface ApiaryMapProps {
  farmer: Farmer;
  batchId: number;
}

export default function ApiaryMap({ farmer, batchId }: ApiaryMapProps) {
  // Geo coordinates and botanical data based on location
  const getTerroir = (loc: string) => {
    if (loc.toLowerCase().includes("muzaffarpur") || loc.toLowerCase().includes("bihar")) {
      return {
        lat: "26.1209° N",
        lng: "85.3647° E",
        elevation: "56m (Gangetic Plains)",
        floralSource: "Litchi chinensis (Shahi Litchi Blossom)",
        terroir: "Rich alluvial Gangetic silt with high humidity during pre-monsoon flowering.",
        harvestClimate: "32°C • 68% RH • Calm Winds",
      };
    }
    if (loc.toLowerCase().includes("sundarbans") || loc.toLowerCase().includes("bengal")) {
      return {
        lat: "21.9497° N",
        lng: "89.1833° E",
        elevation: "4m (Mangrove Tidal Delta)",
        floralSource: "Rhizophora & Avicennia (Wild Mangrove Flora)",
        terroir: "Saline tidal wetlands rich in natural antioxidants and trace marine bio-minerals.",
        harvestClimate: "29°C • 82% RH • Marine Breeze",
      };
    }
    return {
      lat: "34.0837° N",
      lng: "74.7973° E",
      elevation: "1,620m (Himalayan Valley)",
      floralSource: "Robinia pseudoacacia (Kashmir White Acacia)",
      terroir: "Sub-alpine temperate slopes irrigated by pure glacial snowmelt.",
      harvestClimate: "24°C • 45% RH • Mountain Breeze",
    };
  };

  const terroir = getTerroir(farmer.location);

  return (
    <div className="border border-charcoal/10 bg-white p-8 md:p-12 my-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-charcoal/10">
        <div>
          <p className="text-[10px] uppercase tracking-ultra text-warm-grey font-semibold mb-1">
            Geographic Provenance & Terroir
          </p>
          <h3 className="text-3xl serif text-charcoal font-normal">Botanical Origin Profile</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 border border-charcoal/15 bg-alabaster text-xs font-mono text-charcoal">
          <Compass className="w-3.5 h-3.5 text-gold" />
          <span>{terroir.lat}, {terroir.lng}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Floral Source */}
        <div className="p-6 border border-charcoal/10 bg-alabaster/40 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 border border-charcoal bg-charcoal text-gold flex items-center justify-center mb-4">
              <Flower2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">Floral Forage Source</span>
            <h4 className="text-xl serif font-normal text-charcoal mb-2">{terroir.floralSource}</h4>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider block mt-4">
            Single-Flora Monofloral
          </span>
        </div>

        {/* Topography & Elevation */}
        <div className="p-6 border border-charcoal/10 bg-alabaster/40 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 border border-charcoal bg-charcoal text-gold flex items-center justify-center mb-4">
              <Mountain className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">Apiary Elevation</span>
            <h4 className="text-xl serif font-normal text-charcoal mb-2">{terroir.elevation}</h4>
          </div>
          <p className="text-xs text-warm-grey leading-relaxed mt-2">{terroir.terroir}</p>
        </div>

        {/* Climate at Harvest */}
        <div className="p-6 border border-charcoal/10 bg-alabaster/40 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 border border-charcoal bg-charcoal text-gold flex items-center justify-center mb-4">
              <ThermometerSun className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">Harvest Microclimate</span>
            <h4 className="text-xl serif font-normal text-charcoal mb-2">{terroir.harvestClimate}</h4>
          </div>
          <span className="text-[10px] text-warm-grey font-mono block mt-4">
            Monitored via IoT Hive Sensor Nodes
          </span>
        </div>
      </div>
    </div>
  );
}
