"use client";

import { Farmer } from "@/lib/types";
import { ShieldCheck, MapPin, Award, Calendar } from "lucide-react";
import { formatDeterministicMonthYear } from "@/lib/utils";

interface FarmerProfileProps {
  farmer: Farmer;
}

export default function FarmerProfile({ farmer }: FarmerProfileProps) {
  const regDate = formatDeterministicMonthYear(farmer.registeredAt);

  return (
    <div className="border border-charcoal/10 bg-white p-8 md:p-12 group">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Grayscale portrait with hover color reveal */}
        <div className="w-full lg:w-5/12 overflow-hidden border border-charcoal/20 relative">
          <div className="aspect-[3/4] relative bg-charcoal">
            {/* Fallback stylized beekeeper illustration/image */}
            <div
              className="w-full h-full luxury-image-hover bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800')`,
              }}
            />
            <div className="absolute top-4 left-4 bg-charcoal text-gold px-3 py-1 text-[10px] uppercase tracking-widest font-semibold flex items-center gap-1.5 border border-gold/40">
              <ShieldCheck className="w-3 h-3 text-gold" />
              <span>KVIC Verified Beekeeper</span>
            </div>
          </div>
        </div>

        {/* Farmer Info */}
        <div className="w-full lg:w-7/12 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-3">The Source • Primary Producer</p>
            <h3 className="text-4xl md:text-5xl serif text-charcoal mb-4 font-normal">
              {farmer.name}
            </h3>

            <div className="space-y-4 my-8">
              <div className="flex items-center gap-3 text-xs text-charcoal">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="font-medium">{farmer.location}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-charcoal">
                <Award className="w-4 h-4 text-gold flex-shrink-0" />
                <span>
                  Cooperative: <span className="font-mono font-bold">{farmer.cooperativeId}</span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-charcoal">
                <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="text-warm-grey">Member Since: {regDate}</span>
              </div>
            </div>

            <p className="text-xs text-warm-grey leading-relaxed border-t border-charcoal/10 pt-6">
              Certified under the National Honey Mission. Harvests are monitored via IoT hive scales and authenticated through cryptographically sealed tamper-evident containers before transit.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-charcoal/10 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-warm-grey">Farmer ID #00{farmer.farmerId}</span>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold uppercase tracking-widest bg-emerald-50 px-2.5 py-1 border border-emerald-200">
              100% Direct Trade Fair Price
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
