"use client";

import { useState } from "react";
import { Cpu, Wifi, Activity, BatteryCharging, Zap, Terminal, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export default function HardwareDemoGuide() {
  const [activeTab, setActiveTab] = useState<"architecture" | "bom" | "live_packet">("architecture");
  const [sending, setSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [simWeight, setSimWeight] = useState(45.2);
  const [simTemp, setSimTemp] = useState(34.8);
  const [simAcoustic, setSimAcoustic] = useState(238);

  const triggerLiveTelemetry = async (swarmAlert = false) => {
    setSending(true);
    const weight = swarmAlert ? 43.1 : Number(simWeight);
    const acoustic = swarmAlert ? 520 : Number(simAcoustic);
    const temp = swarmAlert ? 36.8 : Number(simTemp);

    try {
      const res = await fetch("/api/iot/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hive_id: "HIVE-WB-0391",
          weight_kg: weight,
          internal_temp_c: temp,
          humidity_percent: 62.5,
          acoustic_frequency_hz: acoustic,
          battery_voltage: 3.94,
          device_firmware: "TrueTag-ESP32-v2.6",
        }),
      });
      const data = await res.json();
      setLastResponse(data);
    } catch (e: any) {
      setLastResponse({ error: e.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border border-charcoal/10 bg-white p-6 md:p-10 my-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-charcoal/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-gold/20 text-charcoal text-[9px] uppercase tracking-widest font-mono font-semibold">
              SIH26021 Hardware Ingestion
            </span>
            <span className="flex items-center gap-1 text-[10px] text-green-700 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Firmware v2.6 Ready
            </span>
          </div>
          <h3 className="text-2xl serif text-charcoal">
            ESP32 Edge Micro-Telemetry Architecture
          </h3>
          <p className="text-xs text-warm-grey mt-1">
            Production IoT edge schematic, sub-₹1,200 bill of materials, and live ingestion test suite.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border border-charcoal/10 bg-cream/30 p-1 self-start md:self-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3 py-1.5 transition-colors ${
              activeTab === "architecture" ? "bg-charcoal text-alabaster font-semibold" : "text-charcoal/70 hover:text-charcoal"
            }`}
          >
            Schematic & Deep Sleep
          </button>
          <button
            onClick={() => setActiveTab("bom")}
            className={`px-3 py-1.5 transition-colors ${
              activeTab === "bom" ? "bg-charcoal text-alabaster font-semibold" : "text-charcoal/70 hover:text-charcoal"
            }`}
          >
            BOM (&lt; ₹1,200)
          </button>
          <button
            onClick={() => setActiveTab("live_packet")}
            className={`px-3 py-1.5 transition-colors ${
              activeTab === "live_packet" ? "bg-charcoal text-alabaster font-semibold" : "text-charcoal/70 hover:text-charcoal"
            }`}
          >
            Live Packet Ingestion
          </button>
        </div>
      </div>

      {/* Tab 1: Architecture & Circuit */}
      {activeTab === "architecture" && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-charcoal/10 bg-alabaster/40 p-5 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal/10 mb-4">
              <span className="font-semibold text-charcoal flex items-center gap-2">
                <Cpu className="w-4 h-4 text-gold" /> Pinout & Hardware Bus Routing
              </span>
              <span className="text-[10px] text-warm-grey">firmware/esp32_hive_monitor.ino</span>
            </div>

            <div className="space-y-3 text-[11px] leading-relaxed text-charcoal/80">
              <div className="p-2.5 bg-white border border-charcoal/5 flex justify-between items-center">
                <span><strong>GPIO 16 (DOUT) & GPIO 17 (SCK)</strong>: HX711 24-Bit ADC</span>
                <span className="text-warm-grey text-[10px]">4x 50kg Wheatstone Load Cell</span>
              </div>
              <div className="p-2.5 bg-white border border-charcoal/5 flex justify-between items-center">
                <span><strong>GPIO 4</strong>: DHT22 (AM2302) / SHT31 I2C</span>
                <span className="text-warm-grey text-[10px]">Brood Chamber Temp ±0.5°C & RH%</span>
              </div>
              <div className="p-2.5 bg-white border border-charcoal/5 flex justify-between items-center">
                <span><strong>GPIO 34 (ADC1_CH6)</strong>: MAX4466 / INMP441 Microphone</span>
                <span className="text-warm-grey text-[10px]">Acoustic Wingbeat FFT (150-650 Hz)</span>
              </div>
              <div className="p-2.5 bg-white border border-charcoal/5 flex justify-between items-center">
                <span><strong>RTC Timer Deep Sleep (15µA)</strong>: ULP Wakeup</span>
                <span className="text-warm-grey text-[10px]">30-Min Sleep Cycle (180+ Days Autonomy)</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gold/10 border border-gold/30 text-charcoal text-[11px]">
              <strong className="text-charcoal font-semibold">⚡ Power Autonomy Calculation:</strong>
              <p className="mt-0.5 text-charcoal/80">
                Active TX mode: 120mA for 4 seconds | Deep Sleep: 0.015mA for 1,800 seconds.
                Average drain: ~0.28mAh. A single standard 3,000mAh 18650 cell with a mini 1W solar panel delivers perpetual autonomous operation in remote Sundarbans or Himalayan apiaries.
              </p>
            </div>
          </div>

          <div className="border border-charcoal/10 bg-white p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-warm-grey mb-2">
                <BatteryCharging className="w-4 h-4 text-gold" /> Solar Field Deployment
              </div>
              <h4 className="serif text-lg text-charcoal mb-2">Non-Invasive Hive Integration</h4>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Sensors are positioned underneath the hive floor (load cell base) and inside the top feeder slot (DHT22 & acoustic condenser) without disrupting the bee wax comb or provoking defensive stings.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-charcoal/10 space-y-2 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-warm-grey">Telemetry Protocol:</span>
                <span className="text-charcoal font-medium">HTTP REST / MQTT v3.1.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-grey">Ingestion Endpoint:</span>
                <span className="text-charcoal font-medium">/api/iot/telemetry</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-grey">Crypto Seal:</span>
                <span className="text-charcoal font-medium">SHA-256 Payload Hash</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bill of Materials */}
      {activeTab === "bom" && (
        <div className="mt-6">
          <div className="border border-charcoal/10 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-charcoal text-alabaster uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="p-3">Component</th>
                  <th className="p-3">Model / Specification</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3 text-right">Est. Cost (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                <tr className="hover:bg-cream/40">
                  <td className="p-3 font-semibold text-charcoal">Main MCU</td>
                  <td className="p-3 text-warm-grey">ESP32-WROOM-32 (Dual Core 240MHz, Wi-Fi/BLE)</td>
                  <td className="p-3 text-charcoal/80">Edge computation, FFT sampling, TLS HTTP POST</td>
                  <td className="p-3 text-right font-semibold">₹340</td>
                </tr>
                <tr className="hover:bg-cream/40">
                  <td className="p-3 font-semibold text-charcoal">Weight Subsystem</td>
                  <td className="p-3 text-warm-grey">HX711 24-bit ADC + 4x 50kg Strain Gauge Load Cells</td>
                  <td className="p-3 text-charcoal/80">Hive weight monitoring (Honey yield & swarm detection)</td>
                  <td className="p-3 text-right font-semibold">₹360</td>
                </tr>
                <tr className="hover:bg-cream/40">
                  <td className="p-3 font-semibold text-charcoal">Climate Sensor</td>
                  <td className="p-3 text-warm-grey">DHT22 (AM2302) Digital Temp & Humidity</td>
                  <td className="p-3 text-charcoal/80">Brood thermal regulation & mold prevention</td>
                  <td className="p-3 text-right font-semibold">₹180</td>
                </tr>
                <tr className="hover:bg-cream/40">
                  <td className="p-3 font-semibold text-charcoal">Bio-Acoustic Mic</td>
                  <td className="p-3 text-warm-grey">MAX4466 Electret Microphone with Adjustable Gain</td>
                  <td className="p-3 text-charcoal/80">Colony sound frequency (Queen Piping & Swarm Buzz)</td>
                  <td className="p-3 text-right font-semibold">₹110</td>
                </tr>
                <tr className="hover:bg-cream/40">
                  <td className="p-3 font-semibold text-charcoal">Power Subsystem</td>
                  <td className="p-3 text-warm-grey">TP4056 USB-C Charger + 18650 3000mAh + 5V 1W Solar</td>
                  <td className="p-3 text-charcoal/80">Autonomous solar energy harvesting</td>
                  <td className="p-3 text-right font-semibold">₹190</td>
                </tr>
                <tr className="bg-gold/10 font-bold text-charcoal">
                  <td className="p-3" colSpan={3}>
                    TOTAL KIT BILL OF MATERIALS (BOM) PER HIVE BOX
                  </td>
                  <td className="p-3 text-right text-sm">₹1,180 (~$14.20)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-warm-grey mt-3">
            * Fully subsidizable under KVIC Honey Mission Toolkit distribution scheme (Govt grant allocates ₹4,000 per bee box setup).
          </p>
        </div>
      )}

      {/* Tab 3: Live Packet Injection */}
      {activeTab === "live_packet" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-charcoal/10 p-4 bg-alabaster/30 font-mono">
              <label className="text-[10px] uppercase tracking-wider text-warm-grey block mb-1">
                Simulated Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={simWeight}
                onChange={(e) => setSimWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-charcoal/20 px-3 py-2 text-sm text-charcoal font-semibold focus:outline-none focus:border-charcoal"
              />
              <span className="text-[10px] text-warm-grey mt-1 block">Baseline: 45.2 kg</span>
            </div>

            <div className="border border-charcoal/10 p-4 bg-alabaster/30 font-mono">
              <label className="text-[10px] uppercase tracking-wider text-warm-grey block mb-1">
                Brood Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={simTemp}
                onChange={(e) => setSimTemp(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-charcoal/20 px-3 py-2 text-sm text-charcoal font-semibold focus:outline-none focus:border-charcoal"
              />
              <span className="text-[10px] text-warm-grey mt-1 block">Normal: 33.5°C – 35.5°C</span>
            </div>

            <div className="border border-charcoal/10 p-4 bg-alabaster/30 font-mono">
              <label className="text-[10px] uppercase tracking-wider text-warm-grey block mb-1">
                Acoustic Frequency (Hz)
              </label>
              <input
                type="number"
                step="1"
                value={simAcoustic}
                onChange={(e) => setSimAcoustic(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-charcoal/20 px-3 py-2 text-sm text-charcoal font-semibold focus:outline-none focus:border-charcoal"
              />
              <span className="text-[10px] text-warm-grey mt-1 block">&gt;450 Hz indicates swarming</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => triggerLiveTelemetry(false)}
              disabled={sending}
              className="px-5 py-2.5 bg-charcoal text-alabaster font-mono text-xs uppercase tracking-widest hover:bg-gold hover:text-charcoal transition-colors flex items-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5" />
              {sending ? "Transmitting Packet..." : "Transmit Normal ESP32 Packet"}
            </button>

            <button
              onClick={() => triggerLiveTelemetry(true)}
              disabled={sending}
              className="px-5 py-2.5 bg-red-800 text-white font-mono text-xs uppercase tracking-widest hover:bg-red-900 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Simulate Swarm Escape (Weight Drop &gt; 1.5kg, 520Hz)
            </button>
          </div>

          {lastResponse && (
            <div className="border border-charcoal/10 bg-charcoal text-alabaster p-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3 text-[10px] uppercase tracking-widest text-gold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Ingestion Acknowledged
                </span>
                <span>SHA-256 Receipt: {lastResponse.blockchain_hash?.slice(0, 18)}...</span>
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-alabaster/90">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
