"use client";

import { LabQualityReport } from "@/lib/types";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface ScorecardProps {
  report: LabQualityReport;
}

export default function Scorecard({ report }: ScorecardProps) {
  const metrics = [
    {
      label: "Moisture Content",
      value: `${report.moisturePercent}%`,
      benchmark: "FSSAI Limit: ≤ 20.0%",
      status: report.moisturePercent <= 20 ? "Optimal" : "Elevated",
      percent: Math.min(100, Math.max(0, (25 - report.moisturePercent) * 10)),
      passed: report.moisturePercent <= 20,
    },
    {
      label: "Brix Index (Sugar Purity)",
      value: `${report.brixPercent}°Bx`,
      benchmark: "FSSAI Limit: ≥ 65.0°Bx",
      status: report.brixPercent >= 65 ? "Optimal" : "Low",
      percent: Math.min(100, Math.max(0, (report.brixPercent / 85) * 100)),
      passed: report.brixPercent >= 65,
    },
    {
      label: "HMF (Freshness Indicator)",
      value: `${report.hmfMgPerKg} mg/kg`,
      benchmark: "FSSAI Limit: ≤ 80 mg/kg",
      status: report.hmfMgPerKg <= 80 ? "Optimal" : "Degraded",
      percent: Math.min(100, Math.max(0, (1 - report.hmfMgPerKg / 80) * 100)),
      passed: report.hmfMgPerKg <= 80,
    },
    {
      label: "Diastase Activity",
      value: `${report.diastaseNumber} DN`,
      benchmark: "FSSAI Limit: ≥ 8 DN",
      status: report.diastaseNumber >= 8 ? "Optimal" : "Low",
      percent: Math.min(100, Math.max(0, (report.diastaseNumber / 20) * 100)),
      passed: report.diastaseNumber >= 8,
    },
  ];

  return (
    <div className="border border-charcoal/10 bg-white p-8 md:p-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-charcoal/10">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-1">TrueTag AI Spectrometry Engine</p>
          <h3 className="text-3xl serif text-charcoal">FSSAI Quality Assessment</h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-charcoal text-alabaster self-start md:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span className="text-[10px] uppercase tracking-widest font-semibold">
            Purity Score: <span className="text-gold text-sm font-serif ml-1">{report.purityScore}/100</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-6 border border-charcoal/5 bg-alabaster/40 hover:bg-alabaster transition-colors duration-500">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs uppercase tracking-widest text-warm-grey font-medium">{m.label}</span>
              <span className="text-sm font-serif font-bold text-charcoal">{m.value}</span>
            </div>
            {/* Bar */}
            <div className="h-1.5 w-full bg-charcoal/10 my-3 overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-1000 ease-out"
                style={{ width: `${m.percent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-warm-grey">{m.benchmark}</span>
              <span className="text-emerald-700 font-semibold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {m.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
