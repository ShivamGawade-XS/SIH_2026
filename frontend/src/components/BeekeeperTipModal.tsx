"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import {
  Heart,
  X,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Sparkles,
  Award,
  ArrowRight,
} from "lucide-react";

interface BeekeeperTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName: string;
  farmerLocation: string;
  cooperativeId: string;
  batchId: number;
  farmerVpa?: string;
}

const PRESET_AMOUNTS = [25, 50, 100, 250];

export default function BeekeeperTipModal({
  isOpen,
  onClose,
  farmerName,
  farmerLocation,
  cooperativeId,
  batchId,
  farmerVpa = "rajesh.verma@sbi",
}: BeekeeperTipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;
  const note = `HoneyChain Tip - Batch #${batchId} to ${farmerName}`;
  const upiUrl = `upi://pay?pa=${farmerVpa}&pn=${encodeURIComponent(
    farmerName
  )}&am=${currentAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustom(true);
    setCustomAmount(e.target.value);
  };

  const handleSimulateSuccess = () => {
    setIsSuccess(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#D4AF37", "#138808", "#FF9933", "#1A1A1A"],
    });
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="border-2 border-gold bg-white max-w-lg w-full p-8 md:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-charcoal/40 hover:text-charcoal transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-[10px] uppercase tracking-ultra text-gold font-bold mb-1">
              Direct Beneficiary Settlement
            </p>
            <h2 className="text-3xl serif text-charcoal font-bold mb-2">
              ₹{currentAmount} Sent Directly to {farmerName}
            </h2>
            <p className="text-xs text-warm-grey max-w-sm mx-auto mb-6">
              Your direct micro-patronage token has been routed via UPI to{" "}
              <span className="font-mono font-bold text-charcoal">{farmerVpa}</span>. 100% of this contribution reaches the beekeeper with zero platform deductions.
            </p>
            <div className="p-4 bg-[#F9F8F6] border border-charcoal/10 text-left text-xs mb-6 space-y-1">
              <p className="flex justify-between">
                <span className="text-warm-grey">Beekeeper:</span>
                <span className="font-bold text-charcoal">{farmerName}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-warm-grey">Location:</span>
                <span className="font-bold text-charcoal">{farmerLocation}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-warm-grey">Cooperative:</span>
                <span className="font-mono text-charcoal">{cooperativeId}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-warm-grey">Platform Cut:</span>
                <span className="font-bold text-emerald-700">₹0.00 (0.0%)</span>
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full h-12 bg-charcoal text-alabaster uppercase tracking-widest text-xs font-bold btn-gold-slide flex items-center justify-center"
            >
              Close & Return to Batch Provenance
            </button>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-charcoal/10">
              <div className="w-10 h-10 bg-gold/10 border border-gold flex items-center justify-center text-gold">
                <Heart className="w-5 h-5 fill-gold/30 text-gold" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">
                  KVIC Direct Fair-Trade Patronage
                </p>
                <h3 className="text-2xl serif text-charcoal font-bold">
                  Support Beekeeper {farmerName}
                </h3>
              </div>
            </div>

            <p className="text-xs text-warm-grey mb-6">
              Send a direct tip to reward traditional, pesticide-free beekeeping in <strong>{farmerLocation}</strong>. All funds settle instantly to the beekeeper’s verified bank VPA via Unified Payments Interface (UPI).
            </p>

            {/* Amount Selection Chips */}
            <div className="mb-6">
              <label className="block text-[10px] uppercase tracking-widest text-charcoal font-bold mb-2">
                Select Micro-Patronage Amount:
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`h-11 border-2 text-sm font-mono font-bold transition-all ${
                      !isCustom && selectedAmount === amt
                        ? "border-gold bg-gold/15 text-charcoal shadow-xs scale-105"
                        : "border-charcoal/20 bg-white text-warm-grey hover:border-charcoal"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-mono font-bold text-warm-grey">₹</span>
                <input
                  type="number"
                  placeholder="Or enter custom amount (e.g. 150)"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="w-full h-11 border-2 border-charcoal/20 pl-8 pr-3 text-xs font-mono font-bold focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            {/* Dynamic UPI QR Code */}
            <div className="p-6 bg-[#F9F8F6] border border-charcoal/15 text-center mb-6">
              <div className="inline-block p-3 bg-white border border-charcoal/15 shadow-xs mb-3">
                <QRCodeSVG
                  value={upiUrl}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-[11px] font-mono font-bold text-charcoal">
                Scan with any UPI App: GPay, PhonePe, Paytm, BHIM
              </p>
              <p className="text-[10px] font-mono text-warm-grey mt-0.5">
                VPA: {farmerVpa} • Amount: ₹{currentAmount}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <a
                href={upiUrl}
                className="w-full h-12 bg-charcoal text-alabaster uppercase tracking-widest text-xs font-bold btn-gold-slide flex items-center justify-center gap-2 shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-gold" />
                <span>Open in UPI App (₹{currentAmount})</span>
              </a>

              <button
                type="button"
                onClick={handleSimulateSuccess}
                className="w-full h-10 border border-charcoal/30 bg-white hover:bg-alabaster text-charcoal uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Completed Payment (Demo Mode)</span>
              </button>
            </div>

            {/* Zero Fee Guarantee Footer */}
            <div className="mt-4 pt-3 border-t border-charcoal/10 flex items-center justify-center gap-2 text-[10px] text-warm-grey">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>0% Platform Commission • 100% Direct Farmer Benefit</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
