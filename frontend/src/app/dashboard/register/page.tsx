"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";
import { UserPlus, ArrowLeft, ShieldCheck, CheckCircle2, Upload } from "lucide-react";

export default function RegisterFarmerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "Subhash Chander",
    location: "Kashmir Valley, Jammu & Kashmir",
    cooperativeId: "KVIC-JK-004",
    ipfsHash: "bafybeicx3m2j5t7qrv47u98zxp123456789",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newFarmerId, setNewFarmerId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate on-chain registration
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setNewFarmerId(3);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#1A1A1A", "#FFFFFF"],
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="py-16 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-grey hover:text-charcoal transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Operations Dashboard</span>
        </Link>

        <div className="border border-charcoal/20 bg-white p-8 md:p-12 shadow-luxury-card">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-charcoal/10">
            <div className="w-12 h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey">KVIC Honey Mission</p>
              <h1 className="text-3xl md:text-4xl serif text-charcoal font-normal">Onboard Verified Beekeeper</h1>
            </div>
          </div>

          {success ? (
            <div className="p-8 border border-emerald-300 bg-emerald-50/50 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl serif text-charcoal mb-2">Beekeeper Verified & Enrolled</h2>
              <p className="text-xs text-warm-grey max-w-md mx-auto mb-6">
                <span className="font-semibold text-charcoal">{formData.name}</span> has been permanently assigned Beekeeper ID{" "}
                <span className="font-mono font-bold text-charcoal">#00{newFarmerId}</span> under cooperative{" "}
                <span className="font-mono font-bold text-charcoal">{formData.cooperativeId}</span>.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/dashboard/mint"
                  className="px-8 py-4 text-xs uppercase tracking-widest font-semibold btn-gold-slide inline-block"
                >
                  Mint First Harvest Batch
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setFormData({ name: "", location: "", cooperativeId: "", ipfsHash: "" });
                  }}
                  className="px-8 py-4 text-xs uppercase tracking-widest font-semibold btn-outline-luxury inline-block"
                >
                  Register Another Beekeeper
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    Beekeeper Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Subhash Chander"
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    State & District Location
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Kashmir Valley, Jammu & Kashmir"
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    KVIC Cooperative Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cooperativeId}
                    onChange={(e) => setFormData({ ...formData, cooperativeId: e.target.value })}
                    placeholder="e.g. KVIC-JK-004"
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans font-mono focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    IPFS Identity Profile CID
                  </label>
                  <input
                    type="text"
                    value={formData.ipfsHash}
                    onChange={(e) => setFormData({ ...formData, ipfsHash: e.target.value })}
                    placeholder="Qm... or bafy..."
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans font-mono focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-6 border border-charcoal/10 bg-alabaster/40 flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <p className="text-xs text-warm-grey leading-relaxed">
                  By submitting this form, you as an authorized KVIC Field Officer cryptographically sign and verify the authenticity and fair-trade standing of this beekeeper on the HoneyChain smart contract.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-xs uppercase tracking-widest font-semibold btn-gold-slide flex items-center justify-center gap-2"
              >
                <span>{loading ? "Anchoring on Polygon..." : "Register Beekeeper on HoneyChain"}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
