"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Fingerprint, Activity, CheckCircle2, AlertTriangle } from "lucide-react";

interface NMRSpectrumViewerProps {
  purityScore: number;
  adulterantClass?: string;
}

export default function NMRSpectrumViewer({ purityScore, adulterantClass }: NMRSpectrumViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activePeak, setActivePeak] = useState<string | null>(null);

  const isPure = purityScore >= 75;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(0, 0, width, height);

    // Draw subtle frequency gridlines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 25);
      ctx.stroke();
    }
    for (let y = 20; y < height - 25; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Baseline axis
    ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, height - 25);
    ctx.lineTo(width, height - 25);
    ctx.stroke();

    // Draw Chemical Shift (ppm) labels
    ctx.fillStyle = "#6C6863";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    const ppms = ["9.0", "8.0", "7.0", "6.0", "5.0", "4.0", "3.0", "2.0", "1.0", "0.0"];
    ppms.forEach((ppm, i) => {
      const x = 30 + i * ((width - 60) / (ppms.length - 1));
      ctx.fillText(`${ppm} ppm`, x, height - 8);
    });

    // Draw NMR Spectrometry Resonance Curve
    ctx.beginPath();
    ctx.moveTo(0, height - 26);

    // Generate peak signals
    for (let x = 0; x <= width; x += 2) {
      const normX = x / width;
      let y = height - 26;

      // Base chemical noise
      y -= Math.sin(x * 0.4) * 1.5;

      // 1. Natural Fructose Peak (around 3.8 - 4.2 ppm => x ~ 55% width)
      const distFructose = Math.abs(normX - 0.52);
      if (distFructose < 0.04) {
        y -= (1 - distFructose / 0.04) * (height * 0.55);
      }

      // 2. Natural Alpha/Beta Glucose Doublet (around 5.2 ppm => x ~ 42% width)
      const distGlucose = Math.abs(normX - 0.42);
      if (distGlucose < 0.035) {
        y -= (1 - distGlucose / 0.035) * (height * 0.48);
      }

      // 3. Natural Proline Amino Acid Peak (around 2.0 ppm => x ~ 78% width)
      const distProline = Math.abs(normX - 0.78);
      if (distProline < 0.03) {
        y -= (1 - distProline / 0.03) * (height * 0.28);
      }

      // 4. Exogenous Adulterant Marker (Foreign Oligosaccharide / C4 Corn Syrup peak at ~5.4 ppm)
      if (!isPure) {
        const distForeign = Math.abs(normX - 0.38);
        if (distForeign < 0.025) {
          y -= (1 - distForeign / 0.025) * (height * 0.65); // High foreign peak
        }
      }

      ctx.lineTo(x, y);
    }

    // Stroke the spectrum curve in Metallic Gold / Emerald or Warning Rose
    ctx.strokeStyle = isPure ? "#D4AF37" : "#F43F5E";
    ctx.lineWidth = 2;
    ctx.shadowColor = isPure ? "rgba(212, 175, 55, 0.5)" : "rgba(244, 63, 94, 0.5)";
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Peak Label Annotations
    ctx.font = "8px 'Inter', sans-serif";
    ctx.fillStyle = "#FFFFFF";

    // Fructose
    ctx.fillText("Fructose 38.2%", width * 0.52, height * 0.35);

    // Glucose
    ctx.fillText("Glucose 31.4%", width * 0.42, height * 0.42);

    // Proline
    ctx.fillText("Proline 2.1%", width * 0.78, height * 0.62);

    if (!isPure) {
      ctx.fillStyle = "#F43F5E";
      ctx.font = "bold 9px 'Inter', sans-serif";
      ctx.fillText("⚠ EXOGENOUS C4 SYRUP PEAK", width * 0.38, height * 0.22);
    }
  }, [purityScore, isPure]);

  return (
    <div className="border border-charcoal/20 bg-charcoal text-alabaster p-6 md:p-8 my-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-gold bg-charcoal text-gold flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm md:text-xs md:text-[10px] md:text-[9px] uppercase tracking-ultra text-warm-grey block">
              1H-Nuclear Magnetic Resonance (NMR) 400 MHz • Spectral Simulation
            </span>
            <h4 className="text-xl serif font-normal text-alabaster">Molecular Resonance Fingerprint Model</h4>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-sm md:text-xs font-mono">
          <span className={`w-2 h-2 ${isPure ? "bg-emerald-400" : "bg-rose-500 animate-ping"}`} />
          <span className="text-gold font-bold">{isPure ? "Monofloral NMR Match" : "Adulterant Anomaly"}</span>
        </div>
      </div>

      {/* Canvas Viewport with responsive scroll container */}
      <div className="relative border border-white/10 bg-black/40 p-2 overflow-x-auto max-w-full">
        <canvas
          ref={canvasRef}
          width={700}
          height={220}
          className="w-full min-w-[340px] h-auto block"
        />
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-white/10 text-sm md:text-xs font-mono">
        <div>
          <span className="text-sm md:text-xs md:text-[10px] md:text-[9px] text-warm-grey uppercase tracking-widest block">δ13C Carbon Isotope</span>
          <span className="text-sm font-bold text-gold">-26.2 ‰ (Pure C3)</span>
        </div>
        <div>
          <span className="text-sm md:text-xs md:text-[10px] md:text-[9px] text-warm-grey uppercase tracking-widest block">F/G Ratio</span>
          <span className="text-sm font-bold text-alabaster">1.22 (Optimal)</span>
        </div>
        <div>
          <span className="text-sm md:text-xs md:text-[10px] md:text-[9px] text-warm-grey uppercase tracking-widest block">SMR Oligosaccharides</span>
          <span className="text-sm font-bold text-emerald-400">0.0% (Zero Rice Syrup)</span>
        </div>
        <div>
          <span className="text-sm md:text-xs md:text-[10px] md:text-[9px] text-warm-grey uppercase tracking-widest block">Spectrometry Confidence</span>
          <span className="text-sm font-bold text-gold">99.4% Verified</span>
        </div>
      </div>

      {/* Scientific Disclaimer Footnote */}
      <p className="text-sm md:text-xs md:text-[10px] md:text-[9px] text-warm-grey/70 font-sans mt-4 pt-3 border-t border-white/5 italic">
        *Illustrative resonance simulation parameterized by standard 400 MHz 1H-NMR botanical markers. Official high-throughput spectroscopy is conducted at NABL-accredited national laboratories.
      </p>
    </div>
  );
}
