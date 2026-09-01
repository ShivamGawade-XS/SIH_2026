"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveTelemetryStream from "@/components/LiveTelemetryStream";
import HiveAcousticAnalyzer from "@/components/HiveAcousticAnalyzer";
import MigratoryRoutePlanner from "@/components/MigratoryRoutePlanner";
import PollinationCreditCalculator from "@/components/PollinationCreditCalculator";
import VoiceFieldAssistant from "@/components/VoiceFieldAssistant";
import PollenVisionAnalyzer from "@/components/PollenVisionAnalyzer";
import { useLanguage } from "@/lib/LanguageContext";
import { DEMO_BATCHES } from "@/lib/constants";
import {
  getCustomBatches,
  getCustomFarmers,
  getComplaints,
  fetchBatchesFromDB,
  fetchFarmersFromDB,
  fetchComplaintsFromDB,
  ConsumerComplaint,
  subscribeToBatchUpdates,
} from "@/lib/registry";
import { BatchMetadata } from "@/lib/types";
import {
  Users, Layers, Sparkles, Activity, PlusCircle, Truck, QrCode,
  LogOut, ExternalLink, ShieldAlert, FileSpreadsheet, FlaskConical,
  ClipboardList, AlertTriangle, ShieldCheck, BarChart3,
  Microscope, FileText, Bell, Lock, Compass,
} from "lucide-react";

type Role = "FIELD_OFFICER" | "LAB_ANALYST" | "ADMIN";

interface SessionUser {
  name: string;
  email: string;
  role: Role;
}

const ROLE_META: Record<Role, { badge: string; station: string }> = {
  FIELD_OFFICER: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    station: "KVIC Field Operations Center • Station #BH-002",
  },
  LAB_ANALYST: {
    badge: "bg-blue-100 text-blue-800 border-blue-300",
    station: "National Bee Board • NABL-Accredited Lab #DEL-01",
  },
  ADMIN: {
    badge: "bg-rose-100 text-rose-800 border-rose-300",
    station: "TrueTag HQ • KVIC Central Administration",
  },
};

const ROLE_LABEL: Record<Role, string> = {
  FIELD_OFFICER: "Field Officer",
  LAB_ANALYST: "Lab Analyst",
  ADMIN: "System Admin",
};

import { DEMO_OFFICERS } from "@/lib/auth-constants";

export default function DashboardClient({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUser>(user);
  const [batchesList, setBatchesList] = useState<BatchMetadata[]>(DEMO_BATCHES);
  const [farmerCount, setFarmerCount] = useState(14240);
  const [complaints, setComplaints] = useState<ConsumerComplaint[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    // Initial sync from DB
    fetchBatchesFromDB().then((b) => setBatchesList(b));
    fetchFarmersFromDB().then((f) => setFarmerCount(14240 + Math.max(0, f.length - 2)));
    fetchComplaintsFromDB().then((c) => setComplaints(c));

    const unsubscribe = subscribeToBatchUpdates(() => {
      fetchBatchesFromDB().then((b) => setBatchesList(b));
      fetchComplaintsFromDB().then((c) => setComplaints(c));
    });

    return () => unsubscribe();
  }, []);

  const handleSwitchPersona = async (officer: typeof DEMO_OFFICERS[0]) => {
    setIsSwitching(true);
    setCurrentUser({
      name: officer.name,
      email: officer.email,
      role: officer.role as Role,
    });

    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: officer.email, password: officer.password }),
      });
      router.refresh();
    } catch (e) {
      console.warn("Session update error:", e);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/dashboard/login";
  };

  const role = currentUser.role;
  const meta = ROLE_META[role] || ROLE_META.FIELD_OFFICER;
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <Navbar />

      <main className="py-8 sm:py-16 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full flex-1">
        {/* ── DEMO PERSONA SWITCHER BAR ── */}
        <div className="mb-8 p-3.5 sm:p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
            <div>
              <p className="text-[10px] uppercase tracking-ultra font-bold text-charcoal">
                SIH Judge & Evaluator Live Persona Switcher
              </p>
              <p className="text-xs text-warm-grey">
                Click any role to preview its dedicated real-time workflow instantly:
              </p>
            </div>
          </div>

          <div className="flex sm:flex-wrap items-center gap-2 overflow-x-auto scrollbar-none snap-x pb-2 sm:pb-0 w-full sm:w-auto">
            {DEMO_OFFICERS.map((officer) => {
              const isActive = currentUser.email.toLowerCase() === officer.email.toLowerCase();
              return (
                <button
                  key={officer.email}
                  type="button"
                  onClick={() => handleSwitchPersona(officer)}
                  disabled={isSwitching}
                  className={`px-3 py-1.5 text-xs font-serif font-semibold border-2 transition-all flex items-center gap-1.5 shadow-2xs ${
                    isActive
                      ? "bg-charcoal text-gold border-charcoal scale-105"
                      : "bg-white text-charcoal border-charcoal/20 hover:border-gold"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    officer.role === "FIELD_OFFICER" ? "bg-emerald-500" :
                    officer.role === "LAB_ANALYST" ? "bg-blue-500" : "bg-rose-500"
                  }`} />
                  <span>{ROLE_LABEL[officer.role as Role]}: {officer.name.split(" ")[0]}</span>
                  {isActive && <span className="text-[9px] uppercase font-sans font-bold bg-gold text-charcoal px-1 ml-0.5">Active</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-8 border-b-2 border-charcoal/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
              <span className="w-2.5 h-2.5 bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-ultra text-charcoal font-bold">{meta.station}</span>
              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border shrink-0 ${meta.badge}`}>
                {ROLE_LABEL[role]}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl serif text-charcoal font-normal">
              {t("dashWelcome")} <span className="italic text-gold font-serif">{currentUser.name.split(" ")[0]}</span>
            </h1>
            <p className="text-xs sm:text-sm text-warm-grey mt-1 font-mono">{currentUser.email}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {role === "ADMIN" && (
              <Link href="/dashboard/admin" className="flex-1 sm:flex-none justify-center px-4 py-2 text-xs uppercase tracking-widest font-bold border-2 border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 flex items-center gap-1.5 transition-colors shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t("dashAdminRecall")}</span>
              </Link>
            )}
            <button onClick={handleLogout} className="flex-1 sm:flex-none justify-center px-4 py-2 text-xs uppercase tracking-widest font-bold border-2 border-charcoal/30 hover:border-charcoal bg-white flex items-center gap-1.5 transition-colors shadow-xs">
              <LogOut className="w-3.5 h-3.5 text-charcoal" />
              <span>{t("dashLogout")}</span>
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FIELD OFFICER                                                   */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {role === "FIELD_OFFICER" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
              <StatCard icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />} label={t("dashRegisteredBeekeepers")} value={farmerCount.toLocaleString("en-IN")} sub="+12 verified" />
              <StatCard icon={<Layers className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />} label={t("dashMintedBatches")} value={(18920 + batchesList.length - 2).toLocaleString("en-IN")} sub="Polygon PoS" />
              <StatCard icon={<Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />} label={t("dashAvgPurity")} value="92.8" sub="Grade A+" suffix="/100" />
              <StatCard icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />} label={t("dashPending")} value="7" sub="Inspection" />
            </div>

            <SectionLabel>{t("dashFieldOfficerActions")}</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <DarkCard href="/dashboard/register" icon={<PlusCircle className="w-7 h-7 text-gold" />} title={t("dashRegisterBeekeeper")} desc="KYC, cooperative code, GPS location, IPFS photo." cta="Open Form" />
              <DarkCard href="/dashboard/mint" icon={<Layers className="w-7 h-7 text-gold" />} title={t("dashApproveMint")} desc="Review harvest submission and mint on Polygon." cta="Launch Mint" />
              <DarkCard href="/dashboard/custody" icon={<Truck className="w-7 h-7 text-gold" />} title={t("dashLogCustody")} desc="Processing, cold filtration, lab certification." cta="Log Step" />
              <DarkCard href="/dashboard/bulk" icon={<FileSpreadsheet className="w-7 h-7 text-gold" />} title={t("dashBulkMint")} desc="High-throughput multi-barrel CSV minting." cta="Upload CSV" />
              <DarkCard href="/dashboard/migration" icon={<Compass className="w-7 h-7 text-gold" />} title={t("dashMigration")} desc="Pan-India floral calendar, convoy logistics & KVIC transit pass." cta="Plan Route" />
              <DarkCard href="/dashboard/credits" icon={<Bell className="w-7 h-7 text-gold" />} title={t("dashCredits")} desc="Carbon offset tokenizer, ecological impact & KVIC Green Credit Certificate." cta="Calculate Credits" />
              <DarkCard href="/dashboard/qr" icon={<QrCode className="w-7 h-7 text-gold" />} title={t("dashPrintQR")} desc="Vector PDF labels, breakable lid tamper seals & under-cap PIN scratch cards." cta="Open Studio" />
            </div>

            <PendingRequestsTable t={t} />
            <div className="mt-12"><LiveTelemetryStream /></div>
            <div className="mt-12"><HiveAcousticAnalyzer /></div>
            <div className="mt-12"><VoiceFieldAssistant /></div>
            <div className="mt-12"><MigratoryRoutePlanner /></div>
            <div className="mt-12"><PollinationCreditCalculator /></div>
            <RecentBatchesTable batchesList={batchesList} t={t} />
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* LAB ANALYST                                                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {role === "LAB_ANALYST" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
              <StatCard icon={<FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />} label={t("dashTestedMonth")} value="1,284" sub="FSSAI IS 4941" />
              <StatCard icon={<Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />} label={t("dashAvgPurity")} value="91.4" sub="All batches" suffix="/100" />
              <StatCard icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />} label={t("dashSyrupFlags")} value="18" sub="Syrup anomalies" />
              <StatCard icon={<ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />} label={t("dashNablCerts")} value="3,410" sub="This year" />
            </div>

            <SectionLabel>{t("dashLabAnalystActions")}</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
              <DarkCard href="/dashboard/quality" icon={<Microscope className="w-7 h-7 text-gold" />} title={t("dashRunQuality")} desc="Submit batch ID for NMR spectrometry & adulterant classifier." cta="Analyse Batch" />
              <DarkCard href="/dashboard/custody" icon={<ClipboardList className="w-7 h-7 text-gold" />} title={t("dashLabCert")} desc="Record FSSAI IS 4941 & NMR fingerprint results on-chain." cta="Log Certification" />
              <DarkCard href="/dashboard/reports" icon={<FileText className="w-7 h-7 text-gold" />} title={t("dashDownloadReports")} desc="Export batch-wise PDF test certificates and W3C VC credentials." cta="Export Reports" />
              <DarkCard href="/dashboard/pollen" icon={<Sparkles className="w-7 h-7 text-gold" />} title={t("dashPollenVision")} desc="Gemini Vision melissopalynology — classify floral botanical origin from microscope slides." cta="Launch Microscope" />
            </div>

            <div className="border-2 border-rose-200 bg-rose-50 p-4 sm:p-8 shadow-sm mb-12">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-xl serif text-charcoal font-bold">{t("dashAdulterationQueue")}</h3>
                <span className="ml-auto px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-rose-400 bg-rose-100 text-rose-800">18 Open</span>
              </div>
              <div className="space-y-3">
                {[
                  { id: "HC-A88", marker: "C4 Sugar (Corn Syrup)", score: 34, location: "Murshidabad, WB" },
                  { id: "HC-B14", marker: "Rice Syrup Marker", score: 52, location: "Almora, Uttarakhand" },
                  { id: "HC-C97", marker: "¹³C Isotope Anomaly", score: 41, location: "Pune, Maharashtra" },
                ].map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-white border border-rose-200">
                    <div>
                      <p className="font-mono font-bold text-charcoal text-sm">{alert.id}</p>
                      <p className="text-xs text-rose-700 font-semibold mt-0.5">{alert.marker}</p>
                      <p className="text-[10px] text-warm-grey">{alert.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-serif font-bold text-rose-600">{alert.score}<span className="text-xs font-sans font-normal">/100</span></p>
                      <Link href="/dashboard/quality" className="text-[10px] uppercase tracking-widest font-bold text-rose-600 hover:text-rose-800 transition-colors">
                        Analyse →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12"><PollenVisionAnalyzer /></div>
            <RecentBatchesTable batchesList={batchesList} t={t} />
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ADMIN                                                           */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {role === "ADMIN" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
              <StatCard icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />} label={t("dashRegisteredBeekeepers")} value={farmerCount.toLocaleString("en-IN")} sub="29 states" />
              <StatCard icon={<Layers className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />} label={t("dashMintedBatches")} value={(18920 + batchesList.length - 2).toLocaleString("en-IN")} sub="Polygon PoS" />
              <StatCard icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />} label="Complaints" value={complaints.length.toString()} sub="Review" />
              <StatCard icon={<ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />} label="Revoked" value="3" sub="Recalls" />
            </div>

            <div className="p-6 border-2 border-emerald-300 bg-emerald-50 mb-10 flex items-center gap-4">
              <span className="w-3 h-3 bg-emerald-500 animate-pulse" />
              <div className="flex-1">
                <p className="font-bold text-charcoal text-sm">{t("dashAllSystemsLive")}</p>
                <p className="text-xs text-emerald-700">Polygon PoS RPC • FastAPI NMR Service • IPFS Gateway • SSE IoT Stream — all live</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-widest">99.97% uptime</span>
            </div>

            <SectionLabel>{t("dashAdminActions")}</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <DarkCard href="/dashboard/admin" icon={<ShieldAlert className="w-7 h-7 text-rose-400" />} title={t("dashRecallCenterTitle")} desc="Review citizen fraud complaints and execute emergency batch revocations." cta="Open Recall Center" />
              <DarkCard href="/dashboard/bulk" icon={<FileSpreadsheet className="w-7 h-7 text-gold" />} title={t("dashBulkOpsTitle")} desc="Batch minting, CSV import/export, mass QR label printing." cta="Open Bulk Panel" />
              <DarkCard href="/dashboard/register" icon={<Users className="w-7 h-7 text-gold" />} title={t("dashRegistryTitle")} desc="Add or manage registered beekeepers, cooperatives, and KYC status." cta="View Registry" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
              <DarkCard href="/dashboard/custody" icon={<Truck className="w-7 h-7 text-gold" />} title={t("dashCustodyAuditTitle")} desc="Full supply chain custody trail for any batch across all stations." cta="View Audit Trail" />
              <DarkCard href="/dashboard/quality" icon={<BarChart3 className="w-7 h-7 text-gold" />} title={t("dashAnalyticsTitle")} desc="System-wide AI purity score trends, adulteration heatmaps." cta="View Analytics" />
              <DarkCard href="/dashboard/reports" icon={<FileText className="w-7 h-7 text-gold" />} title={t("dashDownloadReports")} desc="Export FSSAI compliance reports, KVIC audit summaries, ministry exports." cta="Export Reports" />
            </div>

            <div className="border-2 border-rose-200 bg-white p-8 shadow-sm mb-12">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal/10">
                <Bell className="w-5 h-5 text-rose-600" />
                <h3 className="text-2xl serif text-charcoal font-bold">{t("dashCitizenReports")}</h3>
                <span className="ml-auto px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-rose-400 bg-rose-100 text-rose-800">
                  {complaints.length} Pending
                </span>
              </div>
              {complaints.length === 0 ? (
                <p className="text-sm text-warm-grey font-mono text-center py-6">No complaints filed yet.</p>
              ) : (
                <div className="space-y-3">
                  {complaints.slice(0, 5).map((c, i) => (
                    <div key={i} className="p-4 border border-charcoal/10 bg-[#F9F8F6] flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono font-bold text-charcoal text-sm">Batch #{c.batchId} — {c.qrToken}</p>
                        <p className="text-xs text-rose-700 font-semibold mt-0.5">{c.reportedBy}</p>
                        <p className="text-[10px] text-warm-grey mt-1">{c.reason}</p>
                      </div>
                      <Link href="/dashboard/admin" className="shrink-0 text-[10px] uppercase tracking-widest font-bold text-rose-600 hover:text-rose-800 transition-colors">
                        Review →
                      </Link>
                    </div>
                  ))}
                  {complaints.length > 5 && (
                    <Link href="/dashboard/admin" className="block text-center text-[10px] uppercase tracking-widest font-bold text-charcoal hover:text-gold transition-colors pt-2">
                      View all {complaints.length} complaints →
                    </Link>
                  )}
                </div>
              )}
            </div>

            <RecentBatchesTable batchesList={batchesList} t={t} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ─── Shared Sub-Components ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-4">{children}</p>;
}

function StatCard({ icon, label, value, sub, suffix = "" }: { icon: React.ReactNode; label: string; value: string; sub: string; suffix?: string }) {
  return (
    <div className="p-3.5 sm:p-6 border-2 border-charcoal/15 bg-white shadow-xs hover:border-gold transition-all duration-300">
      <div className="flex justify-between items-start mb-2 sm:mb-4">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-warm-grey font-bold truncate max-w-[100px] sm:max-w-none">{label}</span>
        {icon}
      </div>
      <p suppressHydrationWarning className="text-xl sm:text-3xl font-serif text-charcoal font-bold truncate">
        {value}{suffix && <span className="text-xs sm:text-sm font-sans font-normal text-warm-grey">{suffix}</span>}
      </p>
      <p className="text-[8px] sm:text-[10px] text-emerald-800 mt-1 sm:mt-2 font-bold font-mono truncate">{sub}</p>
    </div>
  );
}

function DarkCard({ href, icon, title, desc, cta }: { href: string; icon: React.ReactNode; title: string; desc: string; cta: string }) {
  return (
    <Link href={href} className="p-6 border-2 border-charcoal bg-[#141414] text-alabaster hover:border-gold transition-all duration-400 group flex flex-col justify-between shadow-sm">
      <div>
        <div className="mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-lg serif text-alabaster mb-1 font-bold">{title}</h3>
        <p className="text-xs text-taupe/70 leading-relaxed font-light">{desc}</p>
      </div>
      <div className="mt-6 text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1">
        <span>{cta}</span><span>→</span>
      </div>
    </Link>
  );
}

function PendingRequestsTable({ t }: { t: (key: string) => string }) {
  const pending = [
    { id: "REQ-081", farmer: "Arjun Mandal", location: "Birbhum, WB", flora: "Mustard Blossom", qty: 120, submitted: "27 Aug 2026" },
    { id: "REQ-082", farmer: "Geeta Devi", location: "Vaishali, Bihar", flora: "Litchi", qty: 85, submitted: "26 Aug 2026" },
    { id: "REQ-083", farmer: "Rajesh Patel", location: "Anand, Gujarat", flora: "Ajwain", qty: 200, submitted: "26 Aug 2026" },
  ];
  return (
    <div className="border-2 border-amber-200 bg-amber-50 p-4 sm:p-8 shadow-sm mb-12">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-200">
        <ClipboardList className="w-5 h-5 text-amber-600" />
        <h3 className="text-xl serif text-charcoal font-bold">{t("dashPendingSubmissions")}</h3>
        <span className="ml-auto px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-amber-400 bg-amber-100 text-amber-800">
          {pending.length} Awaiting
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-warm-grey border-b border-amber-200">
              <th className="p-3 font-bold">Request ID</th>
              <th className="p-3 font-bold">Beekeeper</th>
              <th className="p-3 font-bold">Flora / Qty</th>
              <th className="p-3 font-bold">Submitted</th>
              <th className="p-3 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {pending.map((r) => (
              <tr key={r.id} className="hover:bg-amber-100/60 transition-colors">
                <td className="p-3 font-mono font-bold text-charcoal">{r.id}</td>
                <td className="p-3">
                  <p className="font-semibold text-charcoal">{r.farmer}</p>
                  <p className="text-[10px] text-warm-grey">{r.location}</p>
                </td>
                <td className="p-3">
                  <p className="font-semibold">{r.flora}</p>
                  <p className="text-[10px] text-warm-grey">{r.qty} kg</p>
                </td>
                <td className="p-3 text-warm-grey">{r.submitted}</td>
                <td className="p-3 text-right">
                  <Link href="/dashboard/mint" className="inline-flex items-center gap-1 px-3 py-1 text-[10px] uppercase tracking-widest font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentBatchesTable({ batchesList, t }: { batchesList: BatchMetadata[]; t: (key: string) => string }) {
  return (
    <div className="border-2 border-charcoal/15 bg-white p-4 sm:p-8 shadow-sm mt-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-charcoal/10">
        <h3 className="text-2xl serif text-charcoal font-bold">{t("dashRecentBatches")}</h3>
        <span className="text-[10px] uppercase tracking-widest text-charcoal font-mono font-bold">Polygon PoS</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-charcoal/15 bg-[#F9F8F6] text-[10px] uppercase tracking-widest text-warm-grey">
              <th className="p-3 font-bold">{t("batchId")}</th>
              <th className="p-3 font-bold">{t("registryToken")}</th>
              <th className="p-3 font-bold">{t("theSource")}</th>
              <th className="p-3 font-bold">{t("aiPurityScore")}</th>
              <th className="p-3 font-bold">{t("complianceBadge")}</th>
              <th className="p-3 font-bold text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {batchesList.slice(0, 8).map((item) => (
              <tr key={item.batchId} className="hover:bg-[#F9F8F6] transition-colors">
                <td className="p-3 font-mono font-bold text-charcoal">#00{item.batchId}</td>
                <td className="p-3 font-mono font-semibold text-charcoal">{item.qrToken}</td>
                <td className="p-3">
                  <p className="font-semibold text-charcoal">{item.farmer.name}</p>
                  <p className="text-[10px] text-warm-grey">{item.farmer.location}</p>
                </td>
                <td className="p-3">
                  <span className="text-sm font-serif font-bold text-gold">{item.batch.qualityScore}/100</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${item.batch.isRevoked ? "border-rose-400 bg-rose-50 text-rose-800" : "border-emerald-300 bg-emerald-50 text-emerald-800"}`}>
                    {item.batch.grade}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/verify/${item.batchId}`} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-charcoal hover:text-gold transition-colors">
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
