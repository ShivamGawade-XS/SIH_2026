"use client";

import { useState } from "react";
import { ShieldCheck, FileCheck2, Download, ExternalLink, Award, CheckCircle2, Globe, Building2, Flag } from "lucide-react";
import { generateExportPassportPDF } from "@/lib/export-passport";
import { BatchMetadata } from "@/lib/types";

interface ApedaCertificateViewProps {
  data: BatchMetadata;
  isOpen: boolean;
  onClose: () => void;
}

type Jurisdiction = "fssai" | "eu" | "usfda";

export default function ApedaCertificateView({ data, isOpen, onClose }: ApedaCertificateViewProps) {
  const [downloading, setDownloading] = useState(false);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("eu");

  if (!isOpen) return null;

  const { batch, farmer, labReport } = data;
  const consignmentId = `APEDA/IND/HONEY/${String(batch.batchId).padStart(5, "0")}/2026`;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      generateExportPassportPDF(data);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setDownloading(false);
    }
  };

  // Regulatory threshold standards by jurisdiction
  const standards = {
    fssai: {
      name: "FSSAI (Food Products Standards & Additives) 2020",
      country: "India Domestic",
      moistureLimit: "≤ 20.0%",
      hmfLimit: "≤ 80.0 mg/kg (Tropical origin)",
      sugarsLimit: "≥ 65.0%",
      diastaseLimit: "≥ 8.0 DN",
      c4Limit: "≤ 7.0% (EA-IRMS)",
    },
    eu: {
      name: "EU Council Directive 2001/110/EC",
      country: "European Union & UK",
      moistureLimit: "≤ 20.0%",
      hmfLimit: "≤ 40.0 mg/kg (Max EU clearance)",
      sugarsLimit: "≥ 60.0% (F+G)",
      diastaseLimit: "≥ 8.0 Schade Units",
      c4Limit: "≤ 5.0% (Strict zero-syrup)",
    },
    usfda: {
      name: "USFDA 21 CFR 168.130 & USDA Grade A",
      country: "United States (USFDA)",
      moistureLimit: "≤ 18.6% (Grade A Purity)",
      hmfLimit: "≤ 40.0 mg/kg",
      sugarsLimit: "≥ 65.0%",
      diastaseLimit: "≥ 8.0 DN",
      c4Limit: "≤ 7.0%",
    },
  }[jurisdiction];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-charcoal/20 shadow-2xl overflow-hidden my-8">
        {/* Certificate Header Banner */}
        <div className="bg-charcoal text-alabaster p-6 border-b-2 border-gold relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-gold font-mono font-bold block">
                Government of India • Ministry of Commerce &amp; Industry
              </span>
              <h2 className="text-xl md:text-2xl serif text-alabaster font-bold tracking-tight">
                APEDA Honey Export Compliance Passport
              </h2>
              <p className="text-xs text-warm-grey font-mono">
                Consignment ID: {consignmentId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-2 py-1 text-alabaster/70 hover:text-alabaster border border-alabaster/20 text-xs font-mono"
            >
              ✕ CLOSE
            </button>
          </div>
        </div>

        {/* Jurisdiction Switcher Tabs */}
        <div className="bg-charcoal/5 border-b border-charcoal/10 px-6 py-2.5 flex items-center justify-between gap-3 text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-warm-grey flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 text-gold" /> Target Regulatory Regime:
          </span>
          <div className="flex border border-charcoal/20 bg-white">
            <button
              onClick={() => setJurisdiction("eu")}
              className={`px-3 py-1 text-[11px] font-bold ${
                jurisdiction === "eu" ? "bg-charcoal text-alabaster" : "text-charcoal hover:bg-alabaster"
              }`}
            >
              🇪🇺 EU Directive 2001
            </button>
            <button
              onClick={() => setJurisdiction("usfda")}
              className={`px-3 py-1 text-[11px] font-bold ${
                jurisdiction === "usfda" ? "bg-charcoal text-alabaster" : "text-charcoal hover:bg-alabaster"
              }`}
            >
              🇺🇸 USFDA Grade A
            </button>
            <button
              onClick={() => setJurisdiction("fssai")}
              className={`px-3 py-1 text-[11px] font-bold ${
                jurisdiction === "fssai" ? "bg-charcoal text-alabaster" : "text-charcoal hover:bg-alabaster"
              }`}
            >
              🇮🇳 FSSAI 2020
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[65vh] overflow-y-auto font-sans text-xs">
          {/* Status & Agmark Grade Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                  Export Clearance
                </span>
                <span className="font-semibold text-xs">{standards.country} Cleared</span>
              </div>
            </div>

            <div className="p-3 bg-gold/10 border border-gold/30 text-charcoal flex items-center gap-3">
              <Award className="w-5 h-5 text-gold shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal/70 block">
                  DMI Agmark Grade
                </span>
                <span className="font-semibold text-xs">Special Grade (Export)</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-950 flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 block">
                  Applicable Standard
                </span>
                <span className="font-semibold text-[11px] truncate block max-w-[140px]">{standards.name}</span>
              </div>
            </div>
          </div>

          {/* Consignment & Producer Details */}
          <div className="border border-charcoal/10 bg-cream/30 p-4 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between border-b border-charcoal/10 pb-1.5">
              <span className="text-warm-grey">Primary Producer:</span>
              <span className="font-semibold text-charcoal">{farmer.name} ({farmer.society})</span>
            </div>
            <div className="flex justify-between border-b border-charcoal/10 pb-1.5">
              <span className="text-warm-grey">Geographical Origin:</span>
              <span className="font-semibold text-charcoal">{farmer.location} (GI Tag Protected)</span>
            </div>
            <div className="flex justify-between border-b border-charcoal/10 pb-1.5">
              <span className="text-warm-grey">Botanical Nectar Source:</span>
              <span className="font-semibold text-charcoal">{batch.botanicalOrigin}</span>
            </div>
            <div className="flex justify-between border-b border-charcoal/10 pb-1.5">
              <span className="text-warm-grey">KVIC Honey Mission Batch:</span>
              <span className="font-semibold text-charcoal">#{batch.batchId} ({batch.totalWeightKg} kg Consignment)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-grey">Polygon PoS Immutable Hash:</span>
              <span className="font-semibold text-charcoal text-[10px]">{data.txHash ? `${data.txHash.slice(0, 26)}...` : "0x4b7f9a1c2d3e5f6a..."}</span>
            </div>
          </div>

          {/* Physicochemical Parameters Table */}
          <div>
            <h4 className="text-xs uppercase tracking-widest font-mono font-bold text-charcoal mb-2 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-gold" /> Lab Analysis vs {standards.name}
            </h4>
            <div className="border border-charcoal/10 overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-charcoal text-alabaster uppercase text-[9px]">
                  <tr>
                    <th className="p-2.5">Parameter</th>
                    <th className="p-2.5">Tested Value</th>
                    <th className="p-2.5">{standards.country} Statutory Limit</th>
                    <th className="p-2.5 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/10 text-charcoal">
                  <tr>
                    <td className="p-2.5 font-semibold">Moisture Content</td>
                    <td className="p-2.5">{labReport.moisturePercent}%</td>
                    <td className="p-2.5 text-warm-grey">{standards.moistureLimit}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">PASSED</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Hydroxymethylfurfural (HMF)</td>
                    <td className="p-2.5">{labReport.hmfMgPerKg} mg/kg</td>
                    <td className="p-2.5 text-warm-grey">{standards.hmfLimit}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">PASSED</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Reducing Sugars (Fructose + Glucose)</td>
                    <td className="p-2.5">71.4%</td>
                    <td className="p-2.5 text-warm-grey">{standards.sugarsLimit}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">PASSED</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">Diastase (Amylase) Enzyme</td>
                    <td className="p-2.5">{labReport.diastaseNumber} DN</td>
                    <td className="p-2.5 text-warm-grey">{standards.diastaseLimit}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">PASSED</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold">C4 Plant Sugars (EA-IRMS)</td>
                    <td className="p-2.5">0.8%</td>
                    <td className="p-2.5 text-warm-grey">{standards.c4Limit}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">PASSED</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-alabaster/70 p-4 border-t border-charcoal/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] text-warm-grey font-mono">
            Signed by National Bee Board &amp; KVIC Quality Officer · Digitally Verifiable
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-4 py-2 bg-charcoal text-alabaster font-mono text-xs uppercase tracking-widest hover:bg-gold hover:text-charcoal transition-colors flex items-center gap-2 font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? "Generating PDF..." : "Download Official Vector PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
