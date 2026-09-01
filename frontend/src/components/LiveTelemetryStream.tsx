"use client";

import { useEffect, useState } from "react";
import { Radio, Activity, Sparkles, Scale, Thermometer, Droplets, Volume2, AlertTriangle } from "lucide-react";

interface TelemetryPacket {
  hive_id: string;
  weight_kg: number;
  internal_temp_c: number;
  humidity_percent: number;
  acoustic_frequency_hz: number;
  status: string;
  has_alert?: boolean;
  timestamp: number;
}

export default function LiveTelemetryStream() {
  const [data, setData] = useState<TelemetryPacket>({
    hive_id: "HIVE-WB-0391 (Sundarbans Delta - Stage Demo)",
    weight_kg: 45.20,
    internal_temp_c: 34.8,
    humidity_percent: 63.5,
    acoustic_frequency_hz: 235.0,
    status: "Optimal Colony Health",
    has_alert: false,
    timestamp: Math.floor(Date.now() / 1000),
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    const aiUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "https://honeychain-ai-service.onrender.com";

    let fallbackInterval: NodeJS.Timeout | null = null;

    try {
      eventSource = new EventSource(`${aiUrl}/api/iot/stream`);
      eventSource.onopen = () => setConnected(true);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setData(parsed);
          setConnected(true);
        } catch (err) {
          console.error("Error parsing telemetry packet:", err);
        }
      };
      eventSource.onerror = () => {
        setConnected(false);
      };
    } catch (e) {
      console.warn("EventSource not supported or failed:", e);
    }

    // Handle local controller event dispatching
    const handleLocalUpdate = (e: Event) => {
      const custom = e as CustomEvent<TelemetryPacket>;
      if (custom.detail) {
        setData(custom.detail);
        setConnected(true);
      }
    };
    window.addEventListener("honeychain_iot_telemetry_update", handleLocalUpdate);

    // Fallback simulation when SSE backend is not connected
    fallbackInterval = setInterval(() => {
      setData((prev) => {
        if (prev.has_alert) return prev;
        return {
          ...prev,
          weight_kg: Number((45.2 + Math.sin(Date.now() / 5000) * 0.15).toFixed(2)),
          internal_temp_c: Number((34.8 + Math.cos(Date.now() / 4000) * 0.2).toFixed(1)),
          humidity_percent: Number((63.5 + Math.sin(Date.now() / 6000) * 0.4).toFixed(1)),
          acoustic_frequency_hz: Number((235.0 + Math.cos(Date.now() / 3000) * 1.5).toFixed(1)),
          timestamp: Math.floor(Date.now() / 1000),
        };
      });
    }, 2500);

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
      window.removeEventListener("honeychain_iot_telemetry_update", handleLocalUpdate);
    };
  }, []);

  const hasAnomaly = data.has_alert || data.status.includes("CRITICAL") || data.status.includes("Alert");

  return (
    <div className={`border-2 p-4 sm:p-6 md:p-8 my-6 sm:my-12 relative overflow-hidden transition-colors duration-500 ${
      hasAnomaly
        ? "border-rose-500 bg-rose-950/40 text-alabaster"
        : "border-charcoal/20 bg-charcoal text-alabaster"
    }`}>
      {/* Background ambient glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl pointer-events-none ${
        hasAnomaly ? "bg-rose-500/20 animate-pulse" : "bg-gold/5"
      }`} />

      {/* Critical Alert Banner if active */}
      {hasAnomaly && (
        <div className="mb-6 p-3 bg-rose-600/90 border border-rose-400 text-white text-xs font-mono font-bold flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{data.status}</span>
          </div>
          <span className="text-[10px] uppercase bg-black/40 px-2 py-0.5 tracking-widest">Action: Inspect Brood Frame</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 border flex items-center justify-center ${
            hasAnomaly
              ? "border-rose-400 bg-rose-900/60 text-rose-300"
              : "border-gold bg-charcoal text-gold"
          }`}>
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-ultra text-warm-grey">
                National Bee Board • LoRaWAN-Compatible IoT Telemetry Feed
              </span>
              <span className={`w-2 h-2 rounded-full ${
                hasAnomaly
                  ? "bg-rose-500 animate-ping"
                  : connected
                  ? "bg-emerald-400 animate-ping"
                  : "bg-gold"
              }`} />
            </div>
            <h3 className="text-2xl serif font-normal text-alabaster">{data.hive_id}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-gold">
          <Activity className="w-3.5 h-3.5 text-gold" />
          <span>{connected ? "Live SSE Stream Active" : "Simulated Local Loop"}</span>
        </div>
      </div>

      {/* Telemetry Sensor Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10 font-mono">
        {/* Weight */}
        <div className={`p-4 border ${hasAnomaly ? "border-rose-500/50 bg-rose-900/20" : "border-white/10 bg-black/30"}`}>
          <div className="flex items-center justify-between text-warm-grey mb-2">
            <span className="text-[10px] uppercase tracking-widest">Hive Weight</span>
            <Scale className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-alabaster">{data.weight_kg} kg</p>
          <span className={`text-[9px] font-sans mt-1 block ${hasAnomaly ? "text-rose-400 font-bold" : "text-emerald-400"}`}>
            {hasAnomaly ? "Weight Loss Detected" : "Optimal Honey Storage"}
          </span>
        </div>

        {/* Temperature */}
        <div className={`p-4 border ${hasAnomaly ? "border-rose-500/50 bg-rose-900/20" : "border-white/10 bg-black/30"}`}>
          <div className="flex items-center justify-between text-warm-grey mb-2">
            <span className="text-[10px] uppercase tracking-widest">Internal Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-alabaster">{data.internal_temp_c}°C</p>
          <span className="text-[9px] text-emerald-400 font-sans mt-1 block">Thermoregulation Active</span>
        </div>

        {/* Humidity */}
        <div className={`p-4 border ${hasAnomaly ? "border-rose-500/50 bg-rose-900/20" : "border-white/10 bg-black/30"}`}>
          <div className="flex items-center justify-between text-warm-grey mb-2">
            <span className="text-[10px] uppercase tracking-widest">Brood Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-alabaster">{data.humidity_percent}%</p>
          <span className="text-[9px] text-emerald-400 font-sans mt-1 block">Optimal Nectar Curing</span>
        </div>

        {/* Acoustic Frequency */}
        <div className={`p-4 border ${hasAnomaly ? "border-rose-500/50 bg-rose-900/20" : "border-white/10 bg-black/30"}`}>
          <div className="flex items-center justify-between text-warm-grey mb-2">
            <span className="text-[10px] uppercase tracking-widest">Acoustic Buzz</span>
            <Volume2 className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className={`text-2xl font-serif font-bold ${hasAnomaly ? "text-rose-300" : "text-alabaster"}`}>
            {data.acoustic_frequency_hz} Hz
          </p>
          <span className={`text-[9px] font-sans mt-1 block ${hasAnomaly ? "text-rose-400 font-bold" : "text-emerald-400"}`}>
            {hasAnomaly ? "Elevated Stress Buzz" : "Zero Swarming Risk"}
          </span>
        </div>
      </div>
    </div>
  );
}
