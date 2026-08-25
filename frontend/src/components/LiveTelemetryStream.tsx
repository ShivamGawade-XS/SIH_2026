"use client";

import { useEffect, useState } from "react";
import { Radio, Activity, Sparkles, Scale, Thermometer, Droplets, Volume2 } from "lucide-react";

interface TelemetryPacket {
  hive_id: string;
  weight_kg: number;
  internal_temp_c: number;
  humidity_percent: number;
  acoustic_frequency_hz: number;
  status: string;
  timestamp: number;
}

export default function LiveTelemetryStream() {
  const [data, setData] = useState<TelemetryPacket>({
    hive_id: "HIVE-RJ-102 (Alwar Mustard)",
    weight_kg: 44.25,
    internal_temp_c: 35.1,
    humidity_percent: 62.4,
    acoustic_frequency_hz: 242.0,
    status: "Optimal Colony Health",
    timestamp: Math.floor(Date.now() / 1000),
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("http://localhost:8000/api/iot/stream");
      eventSource.onopen = () => setConnected(true);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setData(parsed);
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

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  return (
    <div className="border border-charcoal/20 bg-charcoal text-alabaster p-8 my-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-gold bg-charcoal text-gold flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-ultra text-warm-grey">
                National Bee Board • Live IoT LoRaWAN Feed
              </span>
              <span className={`w-2 h-2 ${connected ? "bg-emerald-400 animate-ping" : "bg-gold"}`} />
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 font-mono">
        {/* Weight */}
        <div className="p-4 border border-white/10 bg-black/30">
          <div className="flex items-center justify-between text-warm-grey mb-2">
            <span className="text-[10px] uppercase tracking-widest">Hive Weight</span>
            <Scale className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-alabaster">{data.weight_kg} kg</p>
          <span className="text-[9px] text-emerald-400 font-sans mt-1 block">Optimal Honey Storage</span>
        </div>

        {/* Temperature */}
        <div className="p-4 border border-white/10 bg-black/30">
          <div className="flex items-center justify-between text-warm-grey mb-2">
            <span className="text-[10px] uppercase tracking-widest">Internal Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-alabaster">{data.internal_temp_c}°C</p>
          <span className="text-[9px] text-emerald-400 font-sans mt-1 block">Thermoregulation Active</span>
        </div>

        {/* Humidity */}
        <div className="p-4 border border-white/10 bg-black/30">
          <div className="flex items-center justify-between text-warm-grey mb-2">
            <span className="text-[10px] uppercase tracking-widest">Brood Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-alabaster">{data.humidity_percent}%</p>
          <span className="text-[9px] text-emerald-400 font-sans mt-1 block">Optimal Nectar Curing</span>
        </div>

        {/* Acoustic Frequency */}
        <div className="p-4 border border-white/10 bg-black/30">
          <div className="flex items-center justify-between text-warm-grey mb-2">
            <span className="text-[10px] uppercase tracking-widest">Acoustic Buzz</span>
            <Volume2 className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="text-2xl font-serif font-bold text-alabaster">{data.acoustic_frequency_hz} Hz</p>
          <span className="text-[9px] text-emerald-400 font-sans mt-1 block">Zero Swarming Risk</span>
        </div>
      </div>
    </div>
  );
}
