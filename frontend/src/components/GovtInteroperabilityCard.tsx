"use client";

import { useState } from "react";
import { Server, CheckCircle2, Globe, Database, Code, RefreshCw, Sparkles, ExternalLink } from "lucide-react";
import { HONEYCHAIN_CONTRACT_ADDRESS } from "@/lib/constants";

export default function GovtInteroperabilityCard() {
  const [showJson, setShowJson] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState("Just now");

  // MOCK: Government data gateway synchronization federation telemetry
  const mockPayload = {
    standard: "National Honey Mission Data Interoperability Standard v2.4",
    syncTimestamp: "2026-08-29T08:00:00.000Z",
    gateways: {
      madhuKranti: {
        endpoint: "https://madhukranti.gov.in/api/v1/batches/sync",
        status: "CONNECTED_200_OK",
        recordsExported: 1840,
        nbbApprovalSeal: "NBB-2026-HC-VERIFIED",
      },
      agriStack: {
        endpoint: "https://agristack.gov.in/api/v2/farmers/verify",
        status: "FEDERATED_ACTIVE",
        farmerIdType: "FRID (Farmer Registry ID)",
        digiLockerOAuth: "ENABLED",
      },
      kvicHoneyMission: {
        schemeCode: "KVIC-NBHM-2026-27",
        subsidySettlementMode: "DIRECT_DBT_AADHAAR_BRIDGE",
        totalApiariesRegistered: 14240,
      },
    },
    cryptographicAnchor: {
      blockchain: "Polygon PoS (Amoy Testnet / Mainnet)",
      smartContract: HONEYCHAIN_CONTRACT_ADDRESS,
      stateHash: "0x4a7c2b3e810564921ad58ec73d091fb5e3962b1a8d0c24f5a6b7e8d9c0e12",
    },
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced("Just now");
    }, 600);
  };

  return (
    <div className="border-2 border-charcoal/15 bg-white p-8 shadow-xs mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-charcoal/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold/10 border border-gold flex items-center justify-center text-gold">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
              Government Infrastructure Integration
            </span>
            <h3 className="text-xl serif text-charcoal font-bold">
              MadhuKranti Portal & AgriStack Gateway
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3 py-1.5 border border-charcoal/20 hover:border-gold text-[10px] uppercase tracking-widest font-bold text-charcoal flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-gold" : "text-charcoal"}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Gateway"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            className="px-3 py-1.5 bg-charcoal text-alabaster text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 hover:bg-gold hover:text-charcoal transition-colors"
          >
            <Code className="w-3 h-3" />
            <span>{showJson ? "Hide JSON" : "View JSON Payload"}</span>
          </button>
        </div>
      </div>

      {/* Status Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
              National Bee Board
            </p>
            <p className="text-sm font-serif font-bold text-charcoal">MadhuKranti Portal</p>
            <p className="text-[10px] font-mono text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 1,840 Batches Synchronized
            </p>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            200 OK
          </span>
        </div>

        <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
              Ministry of Agriculture
            </p>
            <p className="text-sm font-serif font-bold text-charcoal">AgriStack Farmer Registry</p>
            <p className="text-[10px] font-mono text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> FRID Federated Identity
            </p>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            FEDERATED
          </span>
        </div>

        <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-warm-grey font-bold mb-1">
              MSME KVIC Scheme
            </p>
            <p className="text-sm font-serif font-bold text-charcoal">Honey Mission 2026–27</p>
            <p className="text-[10px] font-mono text-emerald-700 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 14,240 Beekeepers Active
            </p>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-gold/20 text-charcoal border border-gold/40">
            DIRECT DBT
          </span>
        </div>
      </div>

      {/* JSON Schema Viewer Dropdown */}
      {showJson && (
        <div className="p-4 bg-[#141414] text-[#E0E0E0] border-2 border-charcoal rounded-sm font-mono text-[11px] overflow-x-auto mb-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-white/10 text-warm-grey text-[10px]">
            <span>REST JSON WEBHOOK PAYLOAD (NBB & AGRISTACK RECONCILIATION)</span>
            <span className="text-gold">Status: LIVE_SYNC</span>
          </div>
          <pre>{JSON.stringify(mockPayload, null, 2)}</pre>
        </div>
      )}

      <p className="text-[11px] text-warm-grey flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
        <span>
          Full compliance with National Bee Board data interoperability norms. Enables automatic subsidy reconciliation under the Central Sector National Beekeeping & Honey Mission (NBHM).
        </span>
      </p>
    </div>
  );
}
