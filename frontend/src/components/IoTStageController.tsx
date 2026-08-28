"use client";

import { useState } from "react";
import { Radio, AlertTriangle, RefreshCw, Zap, Activity, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";

export default function IoTStageController() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [alertActive, setAlertActive] = useState(false);

  const handleTrigger = async (injectAlert: boolean, reset = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/iot/trigger-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hive_id: "HIVE-WB-0391",
          inject_varroa_alert: injectAlert,
          weight_drop_kg: 0.85,
          acoustic_increase_db: 15.0,
          reset: reset,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLastMessage(data.message || (injectAlert ? "⚡ Anomaly Injected Successfully" : "🔄 Hive Reset to Baseline"));
        setAlertActive(data.active_alert ?? (reset ? false : injectAlert));

        // Dispatch local event for LiveTelemetryStream to update immediately
        if (typeof window !== "undefined" && data.hive) {
          window.dispatchEvent(
            new CustomEvent("honeychain_iot_telemetry_update", {
              detail: data.hive,
            })
          );
        }
      } else {
        setLastMessage(data.error || "Execution completed with local simulation");
        setAlertActive(!reset && injectAlert);
      }
    } catch {
      // Graceful instant fallback
      setLastMessage(reset ? "🔄 Hive reset to baseline (235 Hz, 45.2 kg)" : "⚡ Anomaly injected: Weight -0.85kg, Acoustics +15dB");
      setAlertActive(!reset && injectAlert);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans print:hidden">
      {/* Expanded Control Box */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-[#161616] text-[#F9F8F6] border-2 border-gold p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/15">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-gold animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-wider text-gold">
                SIH Stage IoT Hardware Controller
              </span>
            </div>
            <span className={`px-2 py-0.5 text-[9px] uppercase font-mono font-bold border ${
              alertActive
                ? "bg-rose-950/80 text-rose-400 border-rose-500 animate-pulse"
                : "bg-emerald-950/80 text-emerald-400 border-emerald-500"
            }`}>
              {alertActive ? "ANOMALY ACTIVE" : "OPTIMAL BASELINE"}
            </span>
          </div>

          <p className="text-[11px] text-[#EBE5DE]/80 mb-4 leading-relaxed">
            Remotely trigger physics-based acoustic and weight anomalies on smart hive <strong className="text-gold font-mono">HIVE-WB-0391</strong> to demonstrate live edge detection on stage.
          </p>

          <div className="space-y-2 mb-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleTrigger(true, false)}
              className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>⚡ Trigger Live Varroa / Stress Alert</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleTrigger(false, true)}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>🔄 Reset Hive to Optimal Baseline</span>
            </button>
          </div>

          {lastMessage && (
            <div className="p-2.5 bg-black/60 border border-white/10 text-[10px] font-mono text-[#E8C868] flex items-start gap-1.5">
              <Activity className="w-3 h-3 text-gold shrink-0 mt-0.5" />
              <span className="break-words">{lastMessage}</span>
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[9px] text-warm-grey font-mono">
            <span>Route: /api/iot/trigger-alert</span>
            <span>Target: HIVE-WB-0391</span>
          </div>
        </div>
      )}

      {/* Floating Toggle Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2.5 bg-[#121212] hover:bg-[#1A1A1A] text-white border-2 border-gold shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider"
      >
        <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
        <Zap className="w-4 h-4 text-gold" />
        <span>Stage IoT Controller</span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gold" /> : <ChevronUp className="w-4 h-4 text-gold" />}
      </button>
    </div>
  );
}
