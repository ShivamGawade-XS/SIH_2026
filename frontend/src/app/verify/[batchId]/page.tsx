"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FarmerProfile from "@/components/FarmerProfile";
import Scorecard from "@/components/Scorecard";
import CustodyTimeline from "@/components/CustodyTimeline";
import ApiaryMap from "@/components/ApiaryMap";
import NMRSpectrumViewer from "@/components/NMRSpectrumViewer";
import BeekeeperTipModal from "@/components/BeekeeperTipModal";
import GITagBadge from "@/components/GITagBadge";
import SupplyChainMapReplay from "@/components/SupplyChainMapReplay";
import PollenInspector from "@/components/PollenInspector";
import DBTPayoutCard from "@/components/DBTPayoutCard";
import VerifiableCredentialModal from "@/components/VerifiableCredentialModal";
import UnderCapPinClaimModal from "@/components/UnderCapPinClaimModal";
import { fetchBatchById, fetchBatchByQR } from "@/lib/contract";
import { exportHoneyBatchCredential } from "@/lib/vc-serializer";
import { generateCertificatePDF } from "@/lib/pdf-certificate";
import { generateExportPassportPDF } from "@/lib/export-passport";
import { saveComplaint, subscribeToBatchUpdates } from "@/lib/registry";
import { BatchMetadata } from "@/lib/types";
import { useLanguage } from "@/lib/LanguageContext";
import { formatDeterministicDate } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Volume2,
  Heart,
  Globe,
  FileText,
} from "lucide-react";

export default function ConsumerVerificationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const qrParam = searchParams.get("qr");
  const batchIdNum = Number(params.batchId) || 1;

  const [data, setData] = useState<BatchMetadata | null>(null);
  const { lang, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedIpfs, setCopiedIpfs] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showVCModal, setShowVCModal] = useState(false);
  const [showPinClaimModal, setShowPinClaimModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportReason, setReportReason] = useState("Broken or damaged QR seal on lid");
  const [reportTicketId, setReportTicketId] = useState("CMP-2026-482");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [apedaLoading, setApedaLoading] = useState(false);

  useEffect(() => {
    if (qrParam) {
      fetchBatchByQR(qrParam).then((res) => setData(res));
    } else {
      fetchBatchById(batchIdNum).then((res) => setData(res));
    }

    const unsubscribe = subscribeToBatchUpdates((updated) => {
      setData((prev) => {
        if (!prev) return updated;
        if (prev.batchId === updated.batchId || (qrParam && prev.qrToken === updated.qrToken)) {
          return updated;
        }
        return prev;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [batchIdNum, qrParam]);

  const handleSpeakAudio = () => {
    if (!data || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    let textToSpeak = "";
    let voiceLang = "en-IN";

    if (lang === "hi") {
      textToSpeak = `बैच संख्या ${data.batch.batchId}, जो प्राथमिक मधुमक्खी पालक ${data.farmer.name} द्वारा ${data.farmer.location} में तैयार किया गया है, १०० में से ${data.batch.qualityScore} एआई शुद्धता स्कोर के साथ पूरी तरह शुद्ध और प्रमाणित है।`;
      voiceLang = "hi-IN";
    } else if (lang === "bn") {
      textToSpeak = `ব্যাচ নম্বর ${data.batch.batchId}, যা মৌচাষী ${data.farmer.name} দ্বারা ${data.farmer.location}-এ উৎপাদিত, ১০০-তে ${data.batch.qualityScore} বিশুদ্ধতা স্কোর সহ সম্পূর্ণ খাঁটি।`;
      voiceLang = "bn-IN";
    } else if (lang === "ta") {
      textToSpeak = `தொகுதி எண் ${data.batch.batchId}, தேனீ வளர்ப்பாளர் ${data.farmer.name} அவர்களால் ${data.farmer.location} பகுதியில் உற்பத்தி செய்யப்பட்டு, நூற்றுக்கு ${data.batch.qualityScore} AI தூய்மை மதிப்பெண்ணுடன் சான்றளிக்கப்பட்டது.`;
      voiceLang = "ta-IN";
    } else if (lang === "kn") {
      textToSpeak = `ಬ್ಯಾಚ್ ಸಂಖ್ಯೆ ${data.batch.batchId}, ಜೇನುಸಾಕಣೆದಾರ ${data.farmer.name} ಅವರಿಂದ ${data.farmer.location} ನಲ್ಲಿ ಉತ್ಪಾದಿಸಲ್ಪಟ್ಟಿದೆ ಮತ್ತು ನೂರಕ್ಕೆ ${data.batch.qualityScore} AI ಶುದ್ಧತೆಯೊಂದಿಗೆ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ.`;
      voiceLang = "kn-IN";
    } else {
      textToSpeak = `Batch number 00${data.batch.batchId}, harvested by master beekeeper ${data.farmer.name} in ${data.farmer.location}, is verified authentic on Polygon blockchain with an AI purity score of ${data.batch.qualityScore} out of 100.`;
      voiceLang = "en-US";
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = voiceLang;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
        <Navbar />
        <main className="py-24 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
          <div className="animate-pulse space-y-8">
            <div className="h-6 w-48 bg-charcoal/10 rounded" />
            <div className="h-16 w-3/4 bg-charcoal/15 rounded" />
            <div className="h-48 w-full bg-white border-2 border-charcoal/10 p-8 flex flex-col justify-center items-center gap-3">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <p className="text-xs uppercase tracking-widest text-warm-grey font-bold">
                Querying Polygon Amoy Ledger & IPFS Provenance...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { farmer, batch, custodyChain, labReport, qrToken, txHash } = data;
  const harvestDate = formatDeterministicDate(batch.harvestTimestamp);

  const handleCopyTx = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  const handleCopyIpfs = () => {
    if (batch.ipfsMetadataHash) {
      navigator.clipboard.writeText(batch.ipfsMetadataHash);
      setCopiedIpfs(true);
      setTimeout(() => setCopiedIpfs(false), 2000);
    }
  };

  const handleDownloadVC = () => {
    const vc = exportHoneyBatchCredential(data);
    const blob = new Blob([JSON.stringify(vc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HoneyChain_Batch_${batch.batchId}_W3C_VC.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    setPdfLoading(true);
    try {
      generateCertificatePDF(data);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#D4AF37", "#1A1A1A"],
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Certificate generation failed. Please try again.");
    } finally {
      setTimeout(() => setPdfLoading(false), 800);
    }
  };

  const handleDownloadAPEDA = () => {
    setApedaLoading(true);
    try {
      generateExportPassportPDF(data);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#D4AF37", "#138808", "#1A1A1A"],
      });
    } catch (err) {
      console.error("APEDA passport generation failed:", err);
      alert("APEDA Passport generation failed. Please try again.");
    } finally {
      setTimeout(() => setApedaLoading(false), 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="py-12 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 border-b border-charcoal/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-gold" />
                  <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-semibold">
                    KVIC • National Bee Board • {qrToken}
                  </span>
                  <GITagBadge
                    location={farmer.location}
                    batchId={batch.batchId}
                    gpsLat={farmer.gpsLat}
                    gpsLng={farmer.gpsLng}
                  />
                </div>
                <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl serif text-charcoal font-normal leading-[1.02] break-words">
                  {t("heroSubtitle1")} <span className="italic text-gold">{t("heroSubtitle2")}</span> {t("heroSubtitle3")}
                </h1>

                {/* Actions: Audio Narration & Direct UPI Tip */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSpeakAudio}
                    className="px-4 py-2.5 bg-charcoal text-alabaster hover:bg-gold hover:text-charcoal transition-colors text-xs uppercase tracking-widest font-semibold flex items-center gap-2 shadow-xs"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? "text-gold animate-pulse" : ""}`} />
                    <span>{isSpeaking ? "Playing Voice Summary..." : (lang === "hi" ? "🎙️ आवाज में प्रमाण पत्र सुनें" : lang === "bn" ? "🎙️ অডিও শুনুন" : "🎙️ Listen to Audio Narration")}</span>
                  </button>

                  <button
                    onClick={() => setShowTipModal(true)}
                    className="px-4 py-2.5 border-2 border-gold bg-gold/10 hover:bg-gold text-charcoal transition-colors text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-xs"
                  >
                    <Heart className="w-4 h-4 text-rose-600 fill-rose-600/30" />
                    <span>🇮🇳 Tip Beekeeper (Direct UPI)</span>
                  </button>

                  <button
                    onClick={() => setShowPinClaimModal(true)}
                    className="px-4 py-2.5 border-2 border-amber-600 bg-amber-600/10 hover:bg-amber-600 hover:text-white text-charcoal transition-colors text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600 group-hover:text-white" />
                    <span>🔓 Claim Under-Cap PIN</span>
                  </button>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs uppercase tracking-widest text-warm-grey">{t("batchId")}</p>
                <p className="text-3xl font-serif font-bold text-charcoal">#00{batch.batchId}</p>
                <p className="text-[10px] text-warm-grey mt-1">{t("registryToken")}: {qrToken}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. AUTHENTICITY BADGE SECTION (Dark Charcoal) */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24 bg-charcoal text-alabaster border-b border-charcoal">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 relative rounded-2xl overflow-hidden border-2 border-gold/70 shadow-lg shrink-0 bg-[#121212] group">
                <Image
                  src="/honeychain_logo_badge.jpg"
                  alt="HoneyChain Certified Organic Seal"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-2xl pointer-events-none" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                    {t("authenticBadge")}
                  </span>
                </div>
                <h2 className="text-3xl serif text-alabaster font-normal mb-2">
                  {t("complianceBadge")}
                </h2>
                <p className="text-xs text-warm-grey max-w-md">
                  Cryptographically secured by KVIC Regional Honey Protocol. Batch records are anchored to Polygon PoS and IPFS storage.
                </p>
              </div>
            </div>

            <div className="text-right border-l-0 md:border-l border-white/10 pl-0 md:pl-12 w-full md:w-auto">
              <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-semibold block mb-1">
                {t("aiPurityScore")}
              </span>
              <div className="flex items-baseline justify-start md:justify-end gap-2">
                <span className="text-6xl font-serif text-gold font-normal">{batch.qualityScore}</span>
                <span className="text-xl text-warm-grey font-serif">/100</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold block mt-1">
                {batch.grade || t("gradeACertified")}
              </span>
            </div>
          </div>
        </section>

        {/* 3. FARMER PROVENANCE & GEOGRAPHIC TERROIR */}
        <section className="py-12 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 border-b border-charcoal/10 bg-alabaster">
          <div className="max-w-6xl mx-auto">
            <FarmerProfile farmer={farmer} />
            <ApiaryMap farmer={farmer} batchId={batch.batchId} />
          </div>
        </section>

        {/* 4. HARVEST METRICS */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-24 bg-charcoal text-alabaster border-b border-charcoal">
          <div className="max-w-6xl mx-auto">
            <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-2 font-semibold">{t("harvestRecord")}</p>
            <h3 className="text-4xl serif mb-12 font-normal text-alabaster">{t("fieldTelemetry")}</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="border-t border-white/10 pt-6">
                <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">{t("harvestDate")}</span>
                <span className="text-2xl font-serif text-alabaster block">{harvestDate}</span>
                <span className="text-[10px] text-taupe/60 mt-1 block">Optimal Moon Phase</span>
              </div>
              <div className="border-t border-white/10 pt-6">
                <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">{t("brixIndex")}</span>
                <span className="text-2xl font-serif text-gold block">{labReport.brixPercent}°Bx</span>
                <span className="text-[10px] text-emerald-400 mt-1 block">Exceeds FSSAI Standard</span>
              </div>
              <div className="border-t border-white/10 pt-6">
                <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">{t("moistureLevel")}</span>
                <span className="text-2xl font-serif text-alabaster block">{labReport.moisturePercent}%</span>
                <span className="text-[10px] text-emerald-400 mt-1 block">Optimal Low Moisture</span>
              </div>
              <div className="border-t border-white/10 pt-6">
                <span className="text-[10px] uppercase tracking-widest text-warm-grey block mb-1">{t("hmfFreshness")}</span>
                <span className="text-2xl font-serif text-alabaster block">{labReport.hmfMgPerKg} mg/kg</span>
                <span className="text-[10px] text-taupe/60 mt-1 block">Unheated Raw Quality</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. AI QUALITY SCORECARD & NMR SPECTROMETRY */}
        <section className="py-24 px-6 md:px-12 lg:px-24 border-b border-charcoal/10 bg-white">
          <div className="max-w-6xl mx-auto space-y-16">
            <Scorecard report={labReport} />
            <PollenInspector botanicalFlora={data.botanicalFlora || farmer.location} batchId={batch.batchId} />
            <NMRSpectrumViewer purityScore={batch.qualityScore} />
          </div>
        </section>

        {/* 5B. PHYSICAL TRANSIT & SUPPLY CHAIN ROUTE REPLAY */}
        <section className="py-20 px-6 md:px-12 lg:px-24 border-b border-charcoal/10 bg-[#F9F8F6]">
          <div className="max-w-6xl mx-auto space-y-12">
            <SupplyChainMapReplay batchId={batch.batchId} custodyChain={custodyChain} botanicalOrigin={data.botanicalFlora || farmer.location} />
            <DBTPayoutCard
              beekeeperName={farmer.name}
              cooperativeId={farmer.cooperativeId}
              upiVpa={farmer.upiVpa}
              qualityScore={batch.qualityScore}
              grade={batch.grade}
              batchId={batch.batchId}
            />
          </div>
        </section>

        {/* 6. BLOCKCHAIN PROOF & CUSTODY TIMELINE */}
        <section className="py-12 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 bg-alabaster">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-20">
              {/* Left Col: Cryptographic Proof */}
              <div className="w-full lg:w-1/2">
                <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-2 font-semibold">{t("chainOfTrust")}</p>
                <h3 className="text-4xl md:text-5xl serif text-charcoal mb-8 font-normal">{t("immutableEvidence")}</h3>
                <p className="text-xs text-warm-grey leading-relaxed mb-10">
                  Every honey batch is permanently anchored onto the Polygon PoS blockchain with cryptographic hashes matching the physical micro-QR seal on the jar.
                </p>

                <div className="space-y-6">
                  {/* Tx Hash */}
                  <div className="p-6 border border-charcoal/15 bg-white">
                    <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-2">Polygon Transaction Hash</p>
                    <div className="flex items-center justify-between font-mono text-xs text-charcoal">
                      <span className="truncate pr-4">{txHash || "0x98f4c2b1e7a6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0"}</span>
                      <button
                        onClick={handleCopyTx}
                        className="text-gold hover:text-charcoal transition-colors flex items-center gap-1 text-[10px] uppercase font-semibold flex-shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedTx ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* IPFS CID */}
                  <div className="p-6 border border-charcoal/15 bg-white">
                    <p className="text-[10px] uppercase tracking-widest text-warm-grey mb-2">IPFS Metadata CID</p>
                    <div className="flex items-center justify-between font-mono text-xs text-charcoal">
                      <span className="truncate pr-4">{batch.ipfsMetadataHash}</span>
                      <button
                        onClick={handleCopyIpfs}
                        className="text-gold hover:text-charcoal transition-colors flex items-center gap-1 text-[10px] uppercase font-semibold flex-shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedIpfs ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Download Certificate Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="w-full sm:w-auto py-3 px-5 text-[11px] uppercase tracking-wider font-bold btn-gold-slide flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-4 h-4 text-gold shrink-0" />
                    <span>{pdfLoading ? "Generating…" : t("downloadPDF")}</span>
                  </button>
                  <button
                    onClick={handleDownloadAPEDA}
                    disabled={apedaLoading}
                    className="w-full sm:w-auto py-3 px-5 text-[11px] uppercase tracking-wider font-bold border-2 border-gold bg-gold/10 hover:bg-gold hover:text-charcoal text-charcoal flex items-center justify-center gap-2 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Globe className="w-4 h-4 text-gold shrink-0" />
                    <span>{t("apedaPassport")}</span>
                  </button>
                  <button
                    onClick={() => setShowVCModal(true)}
                    className="w-full sm:w-auto py-3 px-5 text-[11px] uppercase tracking-wider font-bold btn-outline-luxury flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>W3C Credential (JSON-LD)</span>
                  </button>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${txHash || "0x98f4c2b1e7a6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0"}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto py-3 px-5 text-[11px] uppercase tracking-wider font-bold btn-outline-luxury flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span>Explorer</span>
                  </a>
                </div>

                {/* Report Counterfeit / Broken Seal */}
                <div className="mt-6 pt-6 border-t border-charcoal/10 flex justify-between items-center">
                  <span className="text-[10px] text-warm-grey">Suspect this jar is counterfeit or tampered?</span>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="text-[10px] uppercase tracking-widest font-semibold text-rose-700 hover:text-rose-900 transition-colors underline"
                  >
                    {t("reportTamper")}
                  </button>
                </div>
              </div>

              {/* Right Col: Custody Timeline */}
              <div className="w-full lg:w-1/2">
                <p className="text-[10px] uppercase tracking-ultra text-warm-grey mb-2 font-semibold">Supply Chain Timeline</p>
                <h3 className="text-4xl serif text-charcoal mb-8 font-normal">{t("chainOfCustody")}</h3>
                <div className="border border-charcoal/10 bg-white p-8 md:p-12">
                  <CustodyTimeline chain={custodyChain} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REPORT MODAL */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="border border-charcoal/20 bg-white max-w-md w-full p-8 relative shadow-2xl">
              <h3 className="text-2xl serif text-charcoal mb-2">Report Suspicious Jar / Tampering</h3>
              <p className="text-xs text-warm-grey mb-6">
                Your report for Batch #{batch.batchId} ({qrToken}) will be forwarded directly to KVIC & National Bee Board quality inspectors.
              </p>

              {reportSubmitted ? (
                <div className="p-6 border border-emerald-300 bg-emerald-50 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-serif font-bold text-charcoal">Report Successfully Logged</p>
                  <p className="text-xs text-warm-grey mt-1">Inspection Ticket: {reportTicketId}</p>
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportSubmitted(false);
                    }}
                    className="mt-6 px-6 py-2 text-xs uppercase tracking-widest font-semibold btn-outline-luxury"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const ticketId = `CMP-2026-${Math.floor(Math.random() * 800 + 100)}`;
                    setReportTicketId(ticketId);
                    await saveComplaint({
                      id: ticketId,
                      batchId: batch.batchId,
                      qrToken: qrToken,
                      reportedBy: "Consumer (Verified Scan)",
                      reason: reportReason,
                      date: new Date().toISOString().split("T")[0],
                      status: "Pending Quality Inspection",
                    });
                    setReportSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="complaint-issue" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1">Issue Type</label>
                    <select
                      id="complaint-issue"
                      name="reportReason"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full h-10 border-b border-charcoal/30 bg-transparent text-xs focus:border-gold focus:outline-none"
                    >
                      <option value="Broken QR seal on lid">Broken or damaged QR seal on lid</option>
                      <option value="Unusual fermented taste or thin syrup">Unusual fermented taste or thin syrup</option>
                      <option value="Packaging / label appears duplicated">Packaging / label appears duplicated</option>
                      <option value="Retailer overcharging above MSP">Retailer overcharging above MSP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-1" htmlFor="complaint-location">City / Purchase Location</label>
                    <input
                      id="complaint-location"
                      name="location"
                      type="text"
                      required
                      placeholder="e.g. Connaught Place, New Delhi"
                      className="w-full h-10 border-b border-charcoal/30 bg-transparent text-xs focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 py-3 text-[11px] uppercase tracking-wider font-bold btn-gold-slide justify-center"
                    >
                      Submit Report
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-6 py-3 text-[11px] uppercase tracking-wider font-bold btn-outline-luxury"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* BEEKEEPER DIRECT UPI TIP MODAL */}
        <BeekeeperTipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          farmerName={farmer.name}
          farmerLocation={farmer.location}
          cooperativeId={farmer.cooperativeId}
          batchId={batch.batchId}
          farmerId={farmer.farmerId}
          farmerVpa={farmer.upiVpa || `${farmer.name.toLowerCase().replace(/\s+/g, ".")}@sbi`}
        />

        {/* W3C VERIFIABLE CREDENTIAL JSON-LD MODAL */}
        <VerifiableCredentialModal
          isOpen={showVCModal}
          onClose={() => setShowVCModal(false)}
          batch={data}
        />

        {/* UNDER-CAP PIN CLAIM & JAR BURN MODAL */}
        <UnderCapPinClaimModal
          isOpen={showPinClaimModal}
          onClose={() => setShowPinClaimModal(false)}
          batchId={batch.batchId}
          qrToken={qrToken}
          farmerName={farmer.name}
        />
      </main>

      <Footer />
    </div>
  );
}
