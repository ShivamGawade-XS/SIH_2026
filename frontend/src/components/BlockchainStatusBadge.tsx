"use client";

import { CONTRACT_CONFIG, getContractUrl } from "@/lib/contract-config";
import { ExternalLink, Zap, AlertCircle } from "lucide-react";

interface BlockchainStatusBadgeProps {
  /** Show compact inline version (default: full pill) */
  compact?: boolean;
  /** Optional override tx hash to link to */
  txHash?: string;
}

export default function BlockchainStatusBadge({
  compact = false,
  txHash,
}: BlockchainStatusBadgeProps) {
  const isLive = CONTRACT_CONFIG.isLive;
  const linkUrl = txHash
    ? `${CONTRACT_CONFIG.explorerUrl}/tx/${txHash}`
    : getContractUrl();

  if (compact) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={
          isLive
            ? `View on ${CONTRACT_CONFIG.networkName}`
            : "Contract not yet deployed"
        }
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border transition-colors ${
          isLive
            ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
            : "border-amber-400/40 bg-amber-500/10 text-amber-700"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`}
        />
        {isLive ? CONTRACT_CONFIG.networkName : "Local / Simulated"}
        {isLive && <ExternalLink className="w-2.5 h-2.5 ml-0.5" />}
      </a>
    );
  }

  return (
    <a
      href={isLive ? linkUrl : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 px-3 py-1.5 border text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
        isLive
          ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20 cursor-pointer"
          : "border-amber-400/40 bg-amber-500/10 text-amber-800 cursor-default"
      }`}
    >
      {isLive ? (
        <>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Live — {CONTRACT_CONFIG.networkName}</span>
          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
          <span>Simulated Chain (Deploy to go live)</span>
        </>
      )}
    </a>
  );
}
