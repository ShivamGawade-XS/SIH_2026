"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  Flame,
  X,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
  Gift,
  KeyRound,
} from "lucide-react";

interface UnderCapPinClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: number;
  qrToken?: string;
  farmerName?: string;
}

export default function UnderCapPinClaimModal({
  isOpen,
  onClose,
  batchId,
  qrToken = "TT-2026-00001",
  farmerName = "Ramesh Kumar",
}: UnderCapPinClaimModalProps) {
  const [pin, setPin] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<"idle" | "claimed" | "tampered">("idle");
  const [claimTx, setClaimTx] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;

    setClaiming(true);

    setTimeout(() => {
      setClaiming(false);

      // Tamper check simulation: PIN "0000" or already consumed triggers tamper alert
      if (pin === "0000" || pin === "9999") {
        setClaimStatus("tampered");
      } else {
        setClaimStatus("claimed");
        setClaimTx(`0x${Date.now().toString(16).padEnd(64, "7")}`);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#138808", "#FF9933", "#1A1A1A"],
        });
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-charcoal/10 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <KeyRound className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Under-Cap Jar Claim & Burn</h3>
              <p className="text-xs text-amber-100/90 font-mono">Batch #{batchId} · Token: {qrToken}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {claimStatus === "idle" && (
            <form onSubmit={handleClaim} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-charcoal/80 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Lock className="w-3.5 h-3.5" /> Scratch-Off / Under-Cap Anti-Tamper Security
                </p>
                <p>
                  Look inside your jar cap or scratch the protective silver foil on the neck band.
                  Entering this PIN permanently claims &amp; burns this jar on Polygon PoS to prevent refilling fraud.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/70">
                  Enter 4-Digit Secret Under-Cap PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 7492"
                    className="w-full px-4 py-3.5 text-center tracking-[0.5em] text-2xl font-mono font-black rounded-2xl bg-white border border-charcoal/15 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-charcoal/50 text-center">
                  Tip: Try <span className="font-mono font-bold text-amber-700">7492</span> for success, or <span className="font-mono font-bold text-red-600">0000</span> to test tamper alert.
                </p>
              </div>

              <button
                type="submit"
                disabled={pin.length < 4 || claiming}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-[0.98]"
              >
                {claiming ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>Claim &amp; Permanently Burn Jar</span>
                  </>
                )}
              </button>
            </form>
          )}

          {claimStatus === "claimed" && (
            <div className="text-center py-4 space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-charcoal">Jar Authenticated &amp; Burned!</h4>
                <p className="text-xs text-charcoal/70 mt-1 max-w-sm mx-auto">
                  This jar is now permanently recorded as <span className="font-bold text-emerald-700">OPENED &amp; CONSUMED</span> on Polygon blockchain.
                </p>
              </div>

              {claimTx && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left font-mono text-[11px] text-emerald-900 break-all space-y-1">
                  <p className="font-bold uppercase tracking-wider text-[10px] text-emerald-700">Proof-of-Burn Polygon Tx:</p>
                  <p>{claimTx}</p>
                </div>
              )}

              <div className="p-4 bg-gradient-to-r from-amber-100 to-amber-50 rounded-2xl border border-amber-200 text-left flex items-center space-x-3 shadow-sm">
                <Gift className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900">KVIC Honey Mission Eco-Reward</p>
                  <p className="text-[11px] text-amber-800">
                    You unlocked a <span className="font-bold">₹15 Recycle Voucher</span> for helping prevent counterfeit packaging in Indian apiculture!
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-charcoal text-white font-bold text-sm hover:bg-black transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {claimStatus === "tampered" && (
            <div className="text-center py-4 space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center shadow-lg border border-red-200">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-red-700">TAMPER / CLONE ALERT</h4>
                <p className="text-xs text-charcoal/80 mt-1 max-w-sm mx-auto font-medium">
                  This jar was already opened or invalid PIN entered. High probability of middleman packaging refilling.
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-xs text-red-900 space-y-1">
                <p className="font-bold">Safety Recommendation:</p>
                <p>Do not consume this product. File an immediate complaint with KVIC Field Enforcement or return to point of sale.</p>
              </div>

              <button
                onClick={() => setClaimStatus("idle")}
                className="w-full py-3 rounded-xl bg-red-700 text-white font-bold text-sm hover:bg-red-800 transition-colors"
              >
                Try Another PIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
