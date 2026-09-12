"use client";

import React, { useState } from "react";
import {
  Gavel,
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Scale,
  Award,
  Vote,
  FileText,
  ExternalLink,
} from "lucide-react";
import { getSecureRandomInt } from "@/lib/crypto-utils";
import { getTxUrl } from "@/lib/contract-config";

interface DisputeGovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId?: number;
  qrToken?: string;
  disputeReason?: string;
}

export default function DisputeGovernanceModal({
  isOpen,
  onClose,
  batchId = 1,
  qrToken = "TT-2026-00001",
  disputeReason = "Consumer Tamper Alert: Under-cap seal PIN previously scanned or packaging refilled.",
}: DisputeGovernanceModalProps) {
  // 3-Stakeholder Council Votes: null = pending, true = clear batch, false = confirm fraud
  const [votes, setVotes] = useState<{
    kvic: boolean | null;
    nabl: boolean | null;
    beekeeper: boolean | null;
  }>({
    kvic: null,
    nabl: null,
    beekeeper: null,
  });

  const [resolutionTx, setResolutionTx] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  if (!isOpen) return null;

  const totalVotesCast = Object.values(votes).filter((v) => v !== null).length;
  const clearVotes = Object.values(votes).filter((v) => v === true).length;
  const fraudVotes = Object.values(votes).filter((v) => v === false).length;

  const hasQuorum = clearVotes >= 2 || fraudVotes >= 2;
  const outcome = clearVotes >= 2 ? "CLEARED" : fraudVotes >= 2 ? "CONFIRMED_FRAUD" : "PENDING_QUORUM";

  const handleVote = (role: "kvic" | "nabl" | "beekeeper", decision: boolean) => {
    setVotes((prev) => ({ ...prev, [role]: decision }));
  };

  const handleExecuteResolution = () => {
    setResolving(true);
    setTimeout(() => {
      setResolutionTx(`0x${Date.now().toString(16).padEnd(64, "d")}`);
      setResolving(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FAF9F6] rounded-3xl shadow-2xl border border-charcoal/15 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-charcoal to-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Gavel className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">On-Chain Dispute Governance Council</h3>
                <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[9px] font-mono font-bold uppercase tracking-wider">
                  2-of-3 Quorum
                </span>
              </div>
              <p className="text-xs text-warm-grey font-mono mt-0.5">
                Batch #{batchId} &bull; Case ID: DISP-2026-{batchId} &bull; Token: {qrToken}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-charcoal">
          {/* Dispute Reason Banner */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-900">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>Active Contest Trigger:</span>
            </div>
            <p className="text-red-950 font-medium">{disputeReason}</p>
            <p className="text-[10px] text-warm-grey font-mono pt-1">
              Smart Contract Status: Escrow Subsidies Temporarily Withheld Pending Council Arbitration
            </p>
          </div>

          {/* 3 Stakeholder Voting Stations */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-warm-grey tracking-wider block">
              Tripartite Quorum Voting (2-of-3 Required)
            </span>

            {/* Stakeholder 1: KVIC Officer */}
            <div className="p-4 bg-white border border-charcoal/15 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                  KVIC
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal">KVIC District Directorate</p>
                  <p className="text-[10px] text-warm-grey font-mono">
                    Govt Regulatory Authority &bull; Aadhaar Signature Verified
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleVote("kvic", true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    votes.kvic === true
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  Clear Batch
                </button>
                <button
                  onClick={() => handleVote("kvic", false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    votes.kvic === false
                      ? "bg-red-600 text-white border-red-600 shadow-xs"
                      : "bg-white text-red-800 border-red-300 hover:bg-red-50"
                  }`}
                >
                  Confirm Fraud
                </button>
              </div>
            </div>

            {/* Stakeholder 2: NABL Chemist */}
            <div className="p-4 bg-white border border-charcoal/15 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-900 flex items-center justify-center font-bold text-xs shrink-0">
                  NABL
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal">NABL Accredited Testing Chemist</p>
                  <p className="text-[10px] text-warm-grey font-mono">
                    Independent Scientific Authority &bull; Blind Re-test Report #NABL-882
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleVote("nabl", true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    votes.nabl === true
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  Clear Batch
                </button>
                <button
                  onClick={() => handleVote("nabl", false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    votes.nabl === false
                      ? "bg-red-600 text-white border-red-600 shadow-xs"
                      : "bg-white text-red-800 border-red-300 hover:bg-red-50"
                  }`}
                >
                  Confirm Fraud
                </button>
              </div>
            </div>

            {/* Stakeholder 3: Beekeeper Cooperative Rep */}
            <div className="p-4 bg-white border border-charcoal/15 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-900 flex items-center justify-center font-bold text-xs shrink-0">
                  COOP
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal">Beekeeper Cooperative Council</p>
                  <p className="text-[10px] text-warm-grey font-mono">
                    Producer Representation &bull; Apiary Ledger Staking Node
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleVote("beekeeper", true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    votes.beekeeper === true
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  Clear Batch
                </button>
                <button
                  onClick={() => handleVote("beekeeper", false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    votes.beekeeper === false
                      ? "bg-red-600 text-white border-red-600 shadow-xs"
                      : "bg-white text-red-800 border-red-300 hover:bg-red-50"
                  }`}
                >
                  Confirm Fraud
                </button>
              </div>
            </div>
          </div>

          {/* Quorum Progress & Execution Banner */}
          <div className="p-4 bg-white border border-charcoal/15 rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-warm-grey font-bold uppercase">Quorum Consensus Status:</span>
              <span className="font-bold text-charcoal">{totalVotesCast}/3 Cast</span>
            </div>

            {hasQuorum ? (
              <div
                className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
                  outcome === "CLEARED"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : "bg-red-50 border-red-300 text-red-950"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {outcome === "CLEARED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span>
                    QUORUM REACHED: {outcome === "CLEARED" ? "BATCH VINDICATED & RESTORED" : "FRAUD CONFIRMED (PENALTY SLASHER)"}
                  </span>
                </div>
                <span className="text-[10px] text-warm-grey">
                  {clearVotes} Clear vs {fraudVotes} Fraud
                </span>
              </div>
            ) : (
              <p className="text-xs text-warm-grey font-mono">
                Awaiting at least 2 matching votes to form on-chain governance consensus.
              </p>
            )}

            {resolutionTx ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-mono space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>On-Chain Governance Resolution Broadcasted:</span>
                </p>
                <a
                  href={getTxUrl(resolutionTx)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-700 flex items-center gap-1 hover:text-emerald-950 underline break-all"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span>{resolutionTx}</span>
                </a>
              </div>
            ) : (
              <button
                onClick={handleExecuteResolution}
                disabled={!hasQuorum || resolving}
                className="w-full py-3 px-4 bg-charcoal text-white rounded-xl text-xs uppercase tracking-widest font-bold disabled:opacity-50 hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <Scale className="w-4 h-4 text-gold" />
                <span>
                  {resolving
                    ? "Signing Smart Contract Multi-Sig..."
                    : "Broadcast Governance Quorum Resolution to Polygon"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-alabaster border-t border-charcoal/10 flex justify-between items-center shrink-0">
          <p className="text-[11px] font-mono text-warm-grey">
            Governed by HoneyChain.sol &bull; Decentralized Anti-Bribery Protocol
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-charcoal text-white font-bold text-xs hover:bg-black transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
