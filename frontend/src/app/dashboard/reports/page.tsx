"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DEMO_BATCHES } from "@/lib/constants";
import { getCustomBatches, fetchBatchesFromDB } from "@/lib/registry";
import { generateCertificatePDF } from "@/lib/pdf-certificate";
import { generateExportPassportPDF } from "@/lib/export-passport";
import { exportHoneyBatchCredential } from "@/lib/vc-serializer";
import { BatchMetadata } from "@/lib/types";
import {
  FileText,
  Download,
  ArrowLeft,
  Search,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  Globe,
} from "lucide-react";

export default function ReportsPage() {
  const [allBatches, setAllBatches] = useState<BatchMetadata[]>(getCustomBatches());
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBatchesFromDB().then((b) => setAllBatches(b));
  }, []);

  const filtered = allBatches.filter((item) => {
    const matchesSearch =
      item.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.qrToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchId.toString().includes(searchTerm);

    const matchesGrade =
      gradeFilter === "ALL" ||
      (gradeFilter === "GRADE_A" && item.batch.grade.includes("Grade A")) ||
      (gradeFilter === "REVOKED" && item.batch.isRevoked);

    return matchesSearch && matchesGrade;
  });

  const handleDownloadPDF = (batch: BatchMetadata) => {
    setDownloadingId(batch.batchId);
    try {
      generateCertificatePDF(batch);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  const handleDownloadAPEDA = (batch: BatchMetadata) => {
    setDownloadingId(batch.batchId);
    try {
      generateExportPassportPDF(batch);
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  const handleDownloadVC = (batch: BatchMetadata) => {
    const vc = exportHoneyBatchCredential(batch);
    const blob = new Blob([JSON.stringify(vc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `W3C-VC-Batch-${batch.batchId}.jsonld`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      "Batch ID",
      "QR Token",
      "Beekeeper",
      "Location",
      "Cooperative ID",
      "AI Purity Score",
      "Grade",
      "Moisture (%)",
      "Brix (%)",
      "HMF (mg/kg)",
      "Diastase (DN)",
      "Conductivity (mS/cm)",
      "Status",
    ];

    const rows = filtered.map((b) => [
      b.batchId,
      b.qrToken,
      `"${b.farmer.name}"`,
      `"${b.farmer.location}"`,
      b.farmer.cooperativeId,
      b.batch.qualityScore,
      `"${b.batch.grade}"`,
      b.labReport.moisturePercent,
      b.labReport.brixPercent,
      b.labReport.hmfMgPerKg,
      b.labReport.diastaseNumber,
      b.labReport.electricalConductivity,
      b.batch.isRevoked ? "REVOKED" : "AUTHENTIC",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KVIC-HoneyChain-Audit-Report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <Navbar />

      <main className="py-12 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full flex-1">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-charcoal hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-ultra font-bold text-warm-grey">
            <span>Audit & Compliance Center</span>
            <span>•</span>
            <span className="text-emerald-700">FSSAI / KVIC Format</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b-2 border-charcoal/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-gold rounded-full" />
              <span className="text-[10px] uppercase tracking-ultra text-charcoal font-bold">
                Quality Documentation & Ministry Exports
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl serif text-charcoal font-normal">
              Audit & Lab <span className="italic text-gold font-serif">Reports</span>
            </h1>
            <p className="text-xs text-warm-grey mt-1">
              Download certified NABL laboratory certificates, W3C Verifiable Credentials, and Ministry of MSME batch summaries.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-5 py-3 bg-charcoal text-alabaster border-2 border-charcoal hover:border-gold text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-gold" />
            <span>Export Ministry CSV</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="border-2 border-charcoal/15 bg-white p-6 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-warm-grey absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by farmer name, location, QR token, or batch #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 border border-charcoal/20 bg-[#F9F8F6] text-xs font-mono font-medium focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setGradeFilter("ALL")}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                  gradeFilter === "ALL"
                    ? "bg-charcoal text-gold border-charcoal"
                    : "bg-white text-charcoal border-charcoal/20 hover:border-gold"
                }`}
              >
                All ({allBatches.length})
              </button>
              <button
                type="button"
                onClick={() => setGradeFilter("GRADE_A")}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                  gradeFilter === "GRADE_A"
                    ? "bg-charcoal text-gold border-charcoal"
                    : "bg-white text-charcoal border-charcoal/20 hover:border-gold"
                }`}
              >
                Grade A / A+
              </button>
              <button
                type="button"
                onClick={() => setGradeFilter("REVOKED")}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                  gradeFilter === "REVOKED"
                    ? "bg-charcoal text-gold border-charcoal"
                    : "bg-white text-charcoal border-charcoal/20 hover:border-gold"
                }`}
              >
                Revoked
              </button>
            </div>
          </div>
        </div>

        {/* Batches Certification Table */}
        <div className="border-2 border-charcoal/15 bg-white p-8 shadow-xs">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-charcoal/10">
            <h3 className="text-2xl serif text-charcoal font-bold">
              Certified Harvest Batches ({filtered.length})
            </h3>
            <span className="text-[10px] font-mono text-warm-grey uppercase tracking-widest">
              NABL & Polygon Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-charcoal/15 bg-[#F9F8F6] text-[10px] uppercase tracking-widest text-warm-grey font-bold">
                  <th className="p-3">Batch & QR</th>
                  <th className="p-3">Beekeeper / Origin</th>
                  <th className="p-3">Purity Score</th>
                  <th className="p-3">FSSAI Metrics</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Official Certifications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {filtered.map((item) => (
                  <tr key={item.batchId} className="hover:bg-[#F9F8F6] transition-colors">
                    <td className="p-3">
                      <p className="font-mono font-bold text-charcoal">#00{item.batchId}</p>
                      <p className="text-[10px] font-mono text-warm-grey">{item.qrToken}</p>
                    </td>

                    <td className="p-3">
                      <p className="font-semibold text-charcoal">{item.farmer.name}</p>
                      <p className="text-[10px] text-warm-grey">{item.farmer.location}</p>
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 border border-emerald-200">
                        {item.farmer.cooperativeId}
                      </span>
                    </td>

                    <td className="p-3">
                      <p className="text-base font-serif font-bold text-gold">
                        {item.batch.qualityScore}/100
                      </p>
                      <p className="text-[9px] font-bold text-charcoal uppercase tracking-wider">
                        {item.batch.grade}
                      </p>
                    </td>

                    <td className="p-3 font-mono text-[10px] space-y-0.5">
                      <p>Moisture: <span className="font-bold text-charcoal">{item.labReport.moisturePercent}%</span></p>
                      <p>Brix: <span className="font-bold text-charcoal">{item.labReport.brixPercent}%</span></p>
                      <p>HMF: <span className="font-bold text-charcoal">{item.labReport.hmfMgPerKg} mg/kg</span></p>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          item.batch.isRevoked
                            ? "border-rose-400 bg-rose-50 text-rose-800"
                            : "border-emerald-300 bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {item.batch.isRevoked ? "Revoked" : "Authentic"}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(item)}
                          disabled={downloadingId === item.batchId}
                          className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold border border-charcoal/30 bg-white hover:bg-charcoal hover:text-gold text-charcoal transition-colors shadow-2xs inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>KVIC Cert</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadAPEDA(item)}
                          disabled={downloadingId === item.batchId}
                          className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold border border-gold/40 bg-gold/10 hover:bg-gold hover:text-charcoal text-charcoal transition-colors shadow-2xs inline-flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3 text-gold" />
                          <span>APEDA Passport</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadVC(item)}
                          className="px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold border border-charcoal/20 bg-white hover:bg-charcoal hover:text-white text-charcoal transition-colors shadow-2xs inline-flex items-center gap-1"
                        >
                          <Award className="w-3 h-3 text-gold" />
                          <span>W3C VC</span>
                        </button>

                        <Link
                          href={`/verify/${item.batchId}`}
                          className="p-1 text-charcoal hover:text-gold transition-colors"
                          title="Inspect Batch"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
