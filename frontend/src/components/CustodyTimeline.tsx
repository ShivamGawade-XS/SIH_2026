"use client";

import { CustodyEntry } from "@/lib/types";
import { CheckCircle2, ShieldCheck, Truck, Factory, TreePine } from "lucide-react";
import { formatDeterministicDateTime } from "@/lib/utils";

interface CustodyTimelineProps {
  chain: CustodyEntry[];
}

export default function CustodyTimeline({ chain }: CustodyTimelineProps) {
  const getIcon = (action: string, idx: number) => {
    if (idx === 0) return <TreePine className="w-3.5 h-3.5 text-gold" />;
    if (action.toLowerCase().includes("process") || action.toLowerCase().includes("filtr"))
      return <Factory className="w-3.5 h-3.5 text-gold" />;
    if (action.toLowerCase().includes("dispatch") || action.toLowerCase().includes("transport"))
      return <Truck className="w-3.5 h-3.5 text-gold" />;
    return <ShieldCheck className="w-3.5 h-3.5 text-gold" />;
  };

  return (
    <div className="space-y-10 relative">
      {chain.map((entry, idx) => {
        const dateStr = formatDeterministicDateTime(entry.timestamp);

        const isLast = idx === chain.length - 1;

        return (
          <div key={idx} className={`relative pl-12 ${isLast ? "last-step" : ""}`}>
            {/* Connecting line */}
            <div className="timeline-line" />

            {/* Icon marker */}
            <div className="absolute left-0 top-1 w-6 h-6 border border-gold bg-charcoal z-10 flex items-center justify-center">
              {getIcon(entry.action, idx)}
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-1">
                Step 0{idx + 1} • {dateStr}
              </p>
              <h4 className="font-serif text-lg font-normal text-charcoal">{entry.entity}</h4>
              <p className="text-xs text-warm-grey mt-1 font-medium">{entry.action}</p>
              <p className="text-[10px] font-mono text-warm-grey/70 mt-1 truncate max-w-sm">
                Signed by: {entry.actor}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
