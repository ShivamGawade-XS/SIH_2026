"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LiveTelemetryStream from "@/components/LiveTelemetryStream";
import { DEMO_BATCHES } from "@/lib/constants";
import { getCustomBatches, getCustomFarmers, getComplaints } from "@/lib/registry";
import { BatchMetadata } from "@/lib/types";
import {
  Users, Layers, Sparkles, Activity, PlusCircle, Truck, QrCode,
  LogOut, ExternalLink, ShieldAlert, FileSpreadsheet, FlaskConical,
  ClipboardList, AlertTriangle, ShieldCheck, BarChart3, Radio,
  Microscope, FileText, Bell, Lock,
} from "lucide-react";

type Role = "FIELD_OFFICER" | "LAB_ANALYST" | "ADMIN" | null;

interface SessionUser {
  name: string;
  email: string;
  role: Role;
}

// ─── Role Config ──────────────────────────────────────────────────────────────
const ROLE_META: Record<string, { label: string; color: string; badge: string; station: string }> = {
  FIELD_OFFICER: {
    label: "Field Officer",
    color: "emerald",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    station: "KVIC Field Operations Center • Station #BH-002",
  },
  LAB_ANALYST: {
    label: "Lab Analyst",
    color: "blue",
    badge: "bg-blue-100 text-blue-800 border-blue-300",
    station: "National Bee Board • NABL-Accredited Lab #DEL-01",
  },
  ADMIN: {
    label: "System Admin",
    color: "rose",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
    station: "TrueTag HQ • KVIC Central Administration",
  },
};

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [batchesList, setBatchesList] = useState<BatchMetadata[]>(DEMO_BATCHES);
  const [farmerCount, setFarmerCount] = useState(14240);
  const [complaints, setComplaints] = useState<ReturnType<typeof getComplaints>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch session from our /api/auth/me endpoint — no-store prevents stale role reads
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
        else router.push("/dashboard/login");
      })
      .catch(() => router.push("/dashboard/login"))
      .finally(() => setLoading(false));

    const list = getCustomBatches();
    const farmers = getCustomFarmers();
    setBatchesList(list);
    setFarmerCount(14240 + (farmers.length - 2));
    setComplaints(getComplaints());
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs uppercase tracking-widest text-warm-grey font-bold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const role = user.role;
  const meta = ROLE_META[role || ""] || ROLE_META.FIELD_OFFICER;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <Navbar />

      <main className="py-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full flex-1">

        {/* ── UNIVERSAL HEADER ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-8 border-b-2 border-charcoal/10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2.5 h-2.5 bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-ultra text-charcoal font-bold">{meta.station}</span>
              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${meta.badge}`}>
                {meta.label}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl serif text-charcoal font-normal">
              Welcome, <span className="italic text-gold font-serif">{user.name.split(" ")[0]}</span>
            </h1>
            <p className="text-sm text-warm-grey mt-1 font-mono">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            {role === "ADMIN" && (
              <Link href="/dashboard/admin" className="px-4 py-2 text-xs uppercase tracking-widest font-bold border-2 border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 flex items-center gap-1.5 transition-colors shadow-xs">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Recall Center</span>
              </Link>
            )}
            <button onClick={handleLogout} className="px-4 py-2 text-xs uppercase tracking-widest font-bold border-2 border-charcoal/30 hover:border-charcoal bg-white flex items-center gap-1.5 transition-colors shadow-xs">
              <LogOut className="w-3.5 h-3.5 text-charcoal" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* FIELD OFFICER VIEW                                                  */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {role === "FIELD_OFFICER" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard icon={<Users className="w-5 h-5 text-gold" />} label="Registered Beekeepers" value={farmerCount.toLocaleString()} sub="+12 verified this week" />
              <StatCard icon={<Layers className="w-5 h-5 text-gold" />} label="Minted Batches" value={(18920 + batchesList.length - 2).toLocaleString()} sub="100% on Polygon PoS" />
              <StatCard icon={<Sparkles className="w-5 h-5 text-gold" />} label="Avg. AI Purity Score" value="92.8" sub="Grade A+ Average" suffix="/100" />
              <StatCard icon={<Activity className="w-5 h-5 text-gold" />} label="Pending Approvals" value="7" sub="Awaiting field inspection" />
            </div>

            {/* Actions */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-4">Field Officer Actions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <DarkCard href="/dashboard/register" icon={<PlusCircle className="w-7 h-7 text-gold" />} title="Register Beekeeper" desc="KYC, cooperative code, GPS location, IPFS photo." cta="Open Form" />
                <DarkCard href="/dashboard/mint" icon={<Layers className="w-7 h-7 text-gold" />} title="Approve & Mint Batch" desc="Review harvest submission and mint on Polygon." cta="Launch Mint" />
                <DarkCard href="/dashboard/custody" icon={<Truck className="w-7 h-7 text-gold" />} title="Log Custody Transfer" desc="Processing, cold filtration, lab certification." cta="Log Step" />
                <DarkCard href="/dashboard/bulk" icon={<FileSpreadsheet className="w-7 h-7 text-gold" />} title="Bulk CSV Mint" desc="High-throughput multi-barrel CSV minting." cta="Upload CSV" />
              </div>
            </div>

            {/* Pending Harvest Requests */}
            <PendingRequestsTable />

            {/* Live IoT */}
            <div className="mt-12"><LiveTelemetryStream /></div>

            {/* Recent Batches */}
            <RecentBatchesTable batchesList={batchesList} />
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* LAB ANALYST VIEW                                                    */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {role === "LAB_ANALYST" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard icon={<FlaskConical className="w-5 h-5 text-gold" />} label="Samples Tested (Month)" value="1,284" sub="FSSAI IS 4941:2020 compliant" />
              <StatCard icon={<Sparkles className="w-5 h-5 text-gold" />} label="Avg. Purity Score" value="91.4" sub="/100 across all batches" />
              <StatCard icon={<AlertTriangle className="w-5 h-5 text-rose-500" />} label="Adulteration Flags" value="18" sub="C4 / rice syrup anomalies" />
              <StatCard icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />} label="NABL Certificates Issued" value="3,410" sub="This financial year" />
            </div>

            {/* Actions */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-4">Lab Analyst Actions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                <DarkCard href="/dashboard/quality" icon={<Microscope className="w-7 h-7 text-gold" />} title="Run AI Quality Analysis" desc="Submit batch ID for NMR spectrometry, adulterant classifier." cta="Analyse Batch" />
                <DarkCard href="/dashboard/custody" icon={<ClipboardList className="w-7 h-7 text-gold" />} title="Lab Certification Log" desc="Record FSSAI IS 4941 & NMR fingerprint results on-chain." cta="Log Certification" />
                <DarkCard href="/dashboard/reports" icon={<FileText className="w-7 h-7 text-gold" />} title="Download Lab Reports" desc="Export batch-wise PDF test certificates and W3C VC credentials." cta="Export Reports" />
              </div>
            </div>

            {/* Adulteration Alerts */}
            <div className="border-2 border-rose-200 bg-rose-50 p-8 shadow-sm mb-12">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-xl serif text-charcoal font-bold">Adulteration Alert Queue</h3>
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

            {/* All Batches */}
            <RecentBatchesTable batchesList={batchesList} />
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* ADMIN VIEW                                                          */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {role === "ADMIN" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard icon={<Users className="w-5 h-5 text-gold" />} label="Total Beekeepers" value={farmerCount.toLocaleString()} sub="Across 29 states" />
              <StatCard icon={<Layers className="w-5 h-5 text-gold" />} label="Total Batches" value={(18920 + batchesList.length - 2).toLocaleString()} sub="On Polygon PoS" />
              <StatCard icon={<AlertTriangle className="w-5 h-5 text-rose-500" />} label="Citizen Complaints" value={complaints.length.toString()} sub="Pending review" />
              <StatCard icon={<ShieldAlert className="w-5 h-5 text-rose-600" />} label="Batches Revoked" value="3" sub="Emergency recalls" />
            </div>

            {/* System Health Banner */}
            <div className="p-6 border-2 border-emerald-300 bg-emerald-50 mb-10 flex items-center gap-4">
              <span className="w-3 h-3 bg-emerald-500 animate-pulse" />
              <div className="flex-1">
                <p className="font-bold text-charcoal text-sm">All Systems Operational</p>
                <p className="text-xs text-emerald-700">Polygon PoS RPC • FastAPI NMR Service • IPFS Gateway • SSE IoT Stream — all live</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-widest">99.97% uptime</span>
            </div>

            {/* Admin Actions */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-4">Administrator Actions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                <DarkCard href="/dashboard/admin" icon={<ShieldAlert className="w-7 h-7 text-rose-400" />} title="Recall & Revocation Center" desc="Review citizen fraud complaints and execute emergency batch revocations." cta="Open Recall Center" />
                <DarkCard href="/dashboard/bulk" icon={<FileSpreadsheet className="w-7 h-7 text-gold" />} title="Bulk Operations" desc="Batch minting, CSV import/export, mass QR label printing." cta="Open Bulk Panel" />
                <DarkCard href="/dashboard/register" icon={<Users className="w-7 h-7 text-gold" />} title="Beekeeper Registry" desc="Add or manage registered beekeepers, cooperatives, and KYC status." cta="View Registry" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
                <DarkCard href="/dashboard/custody" icon={<Truck className="w-7 h-7 text-gold" />} title="Custody Audit Log" desc="Full supply chain custody trail for any batch across all stations." cta="View Audit Trail" />
                <DarkCard href="/dashboard/quality" icon={<BarChart3 className="w-7 h-7 text-gold" />} title="Quality Analytics" desc="System-wide AI purity score trends, adulteration heatmaps." cta="View Analytics" />
                <DarkCard href="/dashboard/reports" icon={<FileText className="w-7 h-7 text-gold" />} title="System Reports" desc="Export FSSAI compliance reports, KVIC audit summaries, ministry exports." cta="Export Reports" />
              </div>
            </div>

            {/* Citizen Complaints */}
            <div className="border-2 border-rose-200 bg-white p-8 shadow-sm mb-12">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal/10">
                <Bell className="w-5 h-5 text-rose-600" />
                <h3 className="text-2xl serif text-charcoal font-bold">Citizen Tamper Reports</h3>
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

            {/* Role Access Summary */}
            <div className="border-2 border-charcoal/15 bg-white p-8 shadow-sm mb-12">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal/10">
                <Lock className="w-5 h-5 text-gold" />
                <h3 className="text-2xl serif text-charcoal font-bold">Role & Access Matrix</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { role: "BeeKeeper", color: "amber", actions: ["Submit Harvest Request", "View own batch history", "Download QR label"] },
                  { role: "Field Officer", color: "emerald", actions: ["Register beekeepers", "Approve/Reject harvests", "Mint batches on-chain", "Log custody transfers", "Bulk CSV minting"] },
                  { role: "District Supervisor", color: "blue", actions: ["Flag fraud (non-destructive)", "Resolve disputes", "Audit any batch", "Formal audit trail entries"] },
                ].map((r) => (
                  <div key={r.role} className="p-5 border border-charcoal/10 bg-[#F9F8F6]">
                    <p className={`text-[10px] uppercase tracking-widest font-bold mb-3 text-${r.color}-700`}>{r.role}</p>
                    <ul className="space-y-1.5">
                      {r.actions.map((a) => (
                        <li key={a} className="text-xs text-charcoal flex items-start gap-2">
                          <span className="text-gold mt-0.5">•</span>{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Live IoT */}
            <LiveTelemetryStream />

            {/* All Batches */}
            <div className="mt-12">
              <RecentBatchesTable batchesList={batchesList} />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ─── Shared Sub-Components ────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, suffix = "" }: { icon: React.ReactNode; label: string; value: string; sub: string; suffix?: string }) {
  return (
    <div className="p-6 border-2 border-charcoal/15 bg-white shadow-xs hover:border-gold transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-serif text-charcoal font-bold">
        {value}{suffix && <span className="text-sm font-sans font-normal text-warm-grey">{suffix}</span>}
      </p>
      <p className="text-[10px] text-emerald-800 mt-2 font-bold font-mono">{sub}</p>
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

function PendingRequestsTable() {
  const pending = [
    { id: "REQ-081", farmer: "Arjun Mandal", location: "Birbhum, WB", flora: "Mustard Blossom", qty: 120, submitted: "27 Aug 2026" },
    { id: "REQ-082", farmer: "Geeta Devi", location: "Vaishali, Bihar", flora: "Litchi", qty: 85, submitted: "26 Aug 2026" },
    { id: "REQ-083", farmer: "Rajesh Patel", location: "Anand, Gujarat", flora: "Ajwain", qty: 200, submitted: "26 Aug 2026" },
  ];
  return (
    <div className="border-2 border-amber-200 bg-amber-50 p-8 shadow-sm mb-12">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-200">
        <ClipboardList className="w-5 h-5 text-amber-600" />
        <h3 className="text-xl serif text-charcoal font-bold">Pending Harvest Submissions</h3>
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

function RecentBatchesTable({ batchesList }: { batchesList: BatchMetadata[] }) {
  return (
    <div className="border-2 border-charcoal/15 bg-white p-8 shadow-sm mt-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-charcoal/10">
        <h3 className="text-2xl serif text-charcoal font-bold">Recent Authenticated Batches</h3>
        <span className="text-[10px] uppercase tracking-widest text-charcoal font-mono font-bold">Polygon PoS</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b-2 border-charcoal/15 bg-[#F9F8F6] text-[10px] uppercase tracking-widest text-warm-grey">
              <th className="p-3 font-bold">Batch ID</th>
              <th className="p-3 font-bold">QR Token</th>
              <th className="p-3 font-bold">Beekeeper / Location</th>
              <th className="p-3 font-bold">Purity Score</th>
              <th className="p-3 font-bold">Grade</th>
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
