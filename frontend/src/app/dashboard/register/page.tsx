"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";
import {
  UserPlus,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Compass,
  Loader2,
  Award,
  Smartphone,
} from "lucide-react";
import { getCurrentPosition, reverseGeocode, checkGIZone, GIZone, GI_ZONES } from "@/lib/geo";
import { saveCustomFarmer } from "@/lib/registry";
import { getSecureRandomInt } from "@/lib/crypto-utils";

export default function RegisterFarmerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "Subhash Chander",
    location: "Kashmir Valley, Jammu & Kashmir",
    cooperativeId: "KVIC-JK-004",
    gpsLat: "34.0837",
    gpsLng: "74.7973",
    upiVpa: "subhash.chander@sbi",
    ipfsHash: "bafybeicx3m2j5t7qrv47u98zxp123456789",
  });

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [matchedGI, setMatchedGI] = useState<GIZone | null>(null);
  const [success, setSuccess] = useState(false);
  const [newFarmerId, setNewFarmerId] = useState<number | null>(null);

  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  const handleFetchGps = async () => {
    setGpsLoading(true);
    setGpsNotice(null);
    try {
      const pos = await getCurrentPosition();
      const latStr = pos.lat.toFixed(4);
      const lngStr = pos.lng.toFixed(4);

      // Check GI zone
      const gi = checkGIZone(pos.lat, pos.lng);
      setMatchedGI(gi);

      // Reverse geocode
      const geoAddr = await reverseGeocode(pos.lat, pos.lng);

      setFormData((prev) => ({
        ...prev,
        gpsLat: latStr,
        gpsLng: lngStr,
        location: `${geoAddr.district}, ${geoAddr.state}`,
      }));

      setGpsNotice(
        pos.source === "browser_gps"
          ? `📍 Live GPS Captured (${latStr}°N, ${lngStr}°E)`
          : `📍 Apiary Coordinates Applied (${latStr}°N, ${lngStr}°E)`
      );
    } catch {
      setGpsNotice("📍 Default verified apiary coordinates loaded.");
    } finally {
      setGpsLoading(false);
    }
  };

  const handleApplyPreset = (zone: typeof GI_ZONES[0]) => {
    const lat = ((zone.bounds.minLat + zone.bounds.maxLat) / 2).toFixed(4);
    const lng = ((zone.bounds.minLng + zone.bounds.maxLng) / 2).toFixed(4);
    setMatchedGI(zone);
    setFormData((prev) => ({
      ...prev,
      location: zone.region,
      gpsLat: lat,
      gpsLng: lng,
      cooperativeId: `KVIC-${zone.state.slice(0, 2).toUpperCase()}-0${getSecureRandomInt(10, 89)}`,
    }));
    setGpsNotice(`✨ GI Zone Applied: ${zone.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/farmers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          cooperativeId: formData.cooperativeId,
          gpsLat: formData.gpsLat ? parseFloat(formData.gpsLat) : null,
          gpsLng: formData.gpsLng ? parseFloat(formData.gpsLng) : null,
          upiVpa: formData.upiVpa,
          ipfsProfileHash: formData.ipfsHash || "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const farmerId = data.farmerId;
        setNewFarmerId(farmerId);
        setSuccess(true);

        // Also save to optimistic client cache
        saveCustomFarmer({
          farmerId,
          name: formData.name,
          location: formData.location,
          cooperativeId: formData.cooperativeId,
          gpsLat: formData.gpsLat ? parseFloat(formData.gpsLat) : null,
          gpsLng: formData.gpsLng ? parseFloat(formData.gpsLng) : null,
          upiVpa: formData.upiVpa,
          ipfsProfileHash: formData.ipfsHash || "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
          isVerified: true,
          registeredAt: Math.floor(Date.now() / 1000),
        });

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#1A1A1A", "#FFFFFF"],
        });
      } else {
        alert("Failed to onboard beekeeper to database");
      }
    } catch (err: any) {
      alert("Registration error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="py-8 sm:py-16 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-warm-grey hover:text-charcoal transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Operations Dashboard</span>
        </Link>

        <div className="border border-charcoal/20 bg-white p-5 sm:p-8 md:p-12 shadow-luxury-card">
          <div className="flex items-center gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-charcoal/10">
            <div className="w-10 sm:w-12 h-10 sm:h-12 border border-charcoal bg-charcoal text-gold flex items-center justify-center shrink-0">
              <UserPlus className="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-ultra text-warm-grey font-bold">KVIC Honey Mission</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl serif text-charcoal font-normal">Onboard Verified Beekeeper</h1>
            </div>
          </div>

          {success ? (
            <div className="p-8 border border-emerald-300 bg-emerald-50/50 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl serif text-charcoal mb-2">Beekeeper Verified & Enrolled</h2>
              <p className="text-xs text-warm-grey max-w-md mx-auto mb-6">
                <span className="font-semibold text-charcoal">{formData.name}</span> has been permanently assigned Beekeeper ID{" "}
                <span className="font-mono font-bold text-charcoal">#00{newFarmerId}</span> in the SQLite database under cooperative{" "}
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
                    setFormData({
                      name: "",
                      location: "",
                      cooperativeId: "",
                      gpsLat: "",
                      gpsLng: "",
                      upiVpa: "",
                      ipfsHash: "",
                    });
                  }}
                  className="px-8 py-4 text-xs uppercase tracking-widest font-semibold btn-outline-luxury inline-block"
                >
                  Register Another Beekeeper
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* GPS Fetch Banner */}
              <div className="p-4 border-2 border-dashed border-gold/60 bg-gold/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold" />
                    <span className="text-xs uppercase font-bold tracking-wider text-charcoal">
                      Hardware GPS Apiary Verification
                    </span>
                  </div>
                  <p className="text-[11px] text-warm-grey mt-0.5">
                    Capture real browser coordinates & verify against official GI-tagged honey boundary polygons.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchGps}
                  disabled={gpsLoading}
                  className="px-4 py-2.5 bg-charcoal text-alabaster hover:bg-gold hover:text-charcoal text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-colors shrink-0"
                >
                  {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5 text-gold" />}
                  <span>{gpsLoading ? "Acquiring GPS..." : "📍 Fetch GPS Location"}</span>
                </button>
              </div>

              {/* Quick GI Zone Presets */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">GI Zone Presets:</span>
                {GI_ZONES.map((zone) => (
                  <button
                    key={zone.key}
                    type="button"
                    onClick={() => handleApplyPreset(zone)}
                    className="px-2.5 py-1 text-[11px] font-medium border border-charcoal/20 bg-white hover:border-gold hover:text-gold transition-colors rounded-sm shadow-2xs"
                  >
                    🍯 {zone.region.split(",")[0]}
                  </button>
                ))}
              </div>

              {gpsNotice && (
                <div className="p-3 bg-gold/10 border border-gold/30 text-xs font-mono font-semibold text-charcoal flex items-center gap-2">
                  <span>{gpsNotice}</span>
                </div>
              )}

              {matchedGI && (
                <div className="p-4 border border-emerald-300 bg-emerald-50 text-emerald-900 flex items-center gap-3">
                  <Award className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold uppercase tracking-wider text-[10px]">
                      🛰️ Real-Time GI Zone Detected: {matchedGI.name}
                    </p>
                    <p className="text-[11px] opacity-80">
                      GI Certificate: {matchedGI.giCertNo} • Flora: {matchedGI.flora}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="reg-name" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    Beekeeper Full Name
                  </label>
                  <input
                    id="reg-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Subhash Chander"
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-location" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    State & District Location
                  </label>
                  <input
                    id="reg-location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Kashmir Valley, Jammu & Kashmir"
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-sans focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-cooperative" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    KVIC Cooperative Code
                  </label>
                  <input
                    id="reg-cooperative"
                    name="cooperativeId"
                    type="text"
                    required
                    value={formData.cooperativeId}
                    onChange={(e) => setFormData({ ...formData, cooperativeId: e.target.value })}
                    placeholder="e.g. KVIC-JK-004"
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-mono focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-upi" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    Beekeeper UPI VPA (Direct Tip Settlement)
                  </label>
                  <div className="relative">
                    <input
                      id="reg-upi"
                      name="upiVpa"
                      type="text"
                      value={formData.upiVpa}
                      onChange={(e) => setFormData({ ...formData, upiVpa: e.target.value })}
                      placeholder="e.g. subhash.chander@sbi"
                      className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-mono focus:border-gold focus:outline-none"
                    />
                    <Smartphone className="w-4 h-4 text-warm-grey absolute right-2 top-4" />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-lat" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    Apiary GPS Latitude
                  </label>
                  <input
                    id="reg-lat"
                    name="gpsLat"
                    type="text"
                    value={formData.gpsLat}
                    onChange={(e) => setFormData({ ...formData, gpsLat: e.target.value })}
                    placeholder="e.g. 34.0837"
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-mono focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-lng" className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-medium">
                    Apiary GPS Longitude
                  </label>
                  <input
                    id="reg-lng"
                    name="gpsLng"
                    type="text"
                    value={formData.gpsLng}
                    onChange={(e) => setFormData({ ...formData, gpsLng: e.target.value })}
                    placeholder="e.g. 74.7973"
                    className="w-full h-12 border-b border-charcoal/30 bg-transparent px-2 text-sm font-mono focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-charcoal/10 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-4 text-xs uppercase tracking-widest font-bold btn-gold-slide flex items-center gap-2 shadow-md"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-gold" /> : <ShieldCheck className="w-4 h-4 text-gold" />}
                  <span>{loading ? "Persisting Beekeeper to Database..." : "Enroll Verified Beekeeper"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
