"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Volume2,
  VolumeX,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  RefreshCw,
  Bell,
  Layers,
  Mic,
  MicOff,
} from "lucide-react";
import HoneyChainLogo, { HoneyChainBadge } from "./HoneyChainLogo";

interface AcousticProfile {
  id: string;
  name: string;
  fundamentalHz: number;
  harmonics: number[];
  pulseType: "continuous" | "pulsed" | "erratic" | "intense";
  status: "CALM" | "WARNING" | "CRITICAL" | "ANOMALY";
  statusLabel: string;
  swarmRisk: number; // 0 - 100
  queenState: string;
  colonyMood: string;
  recommendation: string;
  actionRequired: string;
}

const PROFILES: Record<string, AcousticProfile> = {
  calm: {
    id: "calm",
    name: "Normal Calm Foraging",
    fundamentalHz: 235,
    harmonics: [470, 705],
    pulseType: "continuous",
    status: "CALM",
    statusLabel: "Optimal Brood Thermoregulation",
    swarmRisk: 8,
    queenState: "Active & Mated (Laying ~1,500 eggs/day)",
    colonyMood: "Docile / Healthy Honey Flow",
    recommendation: "Colony is thriving. No intervention required. Expected super box fill in 4–6 days.",
    actionRequired: "Routine bi-weekly apiary check.",
  },
  queen_piping: {
    id: "queen_piping",
    name: "Virgin Queen Piping / G-Toot",
    fundamentalHz: 450,
    harmonics: [900, 1350],
    pulseType: "pulsed",
    status: "ANOMALY",
    statusLabel: "Queen Emergence & Succession Event",
    swarmRisk: 35,
    queenState: "Virgin Queen Emitting Duelling Acoustic Tooting",
    colonyMood: "High Agitation (Succession Battle)",
    recommendation: "A new virgin queen has emerged and is challenging unhatched queen cells. Inspect queen cups.",
    actionRequired: "Split hive into 2 nucs if queen cells present to capture duplicate colony.",
  },
  swarming: {
    id: "swarming",
    name: "Pre-Swarm Excitement Spike",
    fundamentalHz: 545,
    harmonics: [1090, 1635],
    pulseType: "intense",
    status: "CRITICAL",
    statusLabel: "Imminent Swarm Departure (< 12 Hours)",
    swarmRisk: 94,
    queenState: "Old Queen Slimming for Flight",
    colonyMood: "Frenzied Pre-Flight Congregation",
    recommendation: "🚨 CRITICAL: 60% of worker bees preparing to depart with prime swarm. Immediate intervention required!",
    actionRequired: "Install swarm trap box & add 2 empty wax foundation frames immediately.",
  },
  varroa_stress: {
    id: "varroa_stress",
    name: "Varroa Mite & Heat Stress",
    fundamentalHz: 320,
    harmonics: [640, 960],
    pulseType: "erratic",
    status: "WARNING",
    statusLabel: "High-Entropy Acoustic Jitter & Fanning Stress",
    swarmRisk: 42,
    queenState: "Suppressed Oviposition",
    colonyMood: "Distressed (Aggressive Fanning at Entrance)",
    recommendation: "Acoustic entropy indicates excessive fanning and mite parasitic infestation. Varroa mite drop rate elevated.",
    actionRequired: "Apply organic oxalic acid vapor treatment and improve bottom board ventilation.",
  },
};

export default function HiveAcousticAnalyzer() {
  const [selectedProfileKey, setSelectedProfileKey] = useState<string>("calm");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMicLive, setIsMicLive] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.15);
  const [isSimulatingAlert, setIsSimulatingAlert] = useState<boolean>(false);
  const [alertSent, setAlertSent] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const liveMicStreamRef = useRef<MediaStream | null>(null);

  const currentProfile = PROFILES[selectedProfileKey];

  // Stop audio safely
  const stopAudio = () => {
    try {
      if (liveMicStreamRef.current) {
        liveMicStreamRef.current.getTracks().forEach((t) => t.stop());
        liveMicStreamRef.current = null;
      }
      if (osc1Ref.current) {
        osc1Ref.current.stop();
        osc1Ref.current.disconnect();
        osc1Ref.current = null;
      }
      if (osc2Ref.current) {
        osc2Ref.current.stop();
        osc2Ref.current.disconnect();
        osc2Ref.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch {}
    setIsPlaying(false);
    setIsMicLive(false);
  };

  const toggleLiveMic = async () => {
    if (isMicLive) {
      stopAudio();
      return;
    }
    stopAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveMicStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicLive(true);
      setIsPlaying(false);
    } catch (err) {
      console.warn("Microphone access denied or unavailable:", err);
      alert("Microphone access is required to analyze live ambient sound.");
      setIsMicLive(false);
    }
  };

  // Start synthesized audio based on acoustic profile
  const startAudio = () => {
    stopAudio();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      gainNodeRef.current = masterGain;

      // Primary fundamental frequency
      const osc1 = ctx.createOscillator();
      osc1.type = currentProfile.pulseType === "pulsed" ? "triangle" : "sawtooth";
      osc1.frequency.setValueAtTime(currentProfile.fundamentalHz, ctx.currentTime);

      // Secondary harmonic frequency
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(currentProfile.harmonics[0], ctx.currentTime);

      // Modulator for pulsing/buzzing modulation
      if (currentProfile.pulseType === "pulsed") {
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(3.5, ctx.currentTime); // 3.5 Hz queen piping pulses
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.5, ctx.currentTime);
        lfo.connect(lfoGain.gain);
        lfo.start();
      } else if (currentProfile.pulseType === "erratic") {
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(12, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.3, ctx.currentTime);
        lfo.connect(lfoGain.gain);
        lfo.start();
      }

      const oscGain1 = ctx.createGain();
      oscGain1.gain.setValueAtTime(0.7, ctx.currentTime);
      const oscGain2 = ctx.createGain();
      oscGain2.gain.setValueAtTime(0.3, ctx.currentTime);

      osc1.connect(oscGain1);
      osc2.connect(oscGain2);

      oscGain1.connect(masterGain);
      oscGain2.connect(masterGain);

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Adjust volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume]);

  // Restart audio when profile changes if currently playing
  useEffect(() => {
    if (isPlaying) {
      startAudio();
    }
    setAlertSent(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfileKey]);

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      if (canvas.parentElement && canvas.width !== canvas.parentElement.clientWidth) {
        canvas.width = canvas.parentElement.clientWidth || 560;
      }
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = "#0D0C0B";
      ctx.fillRect(0, 0, width, height);

      // Draw subtle frequency grid
      ctx.strokeStyle = "rgba(212, 175, 55, 0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const freqData = new Uint8Array(64);

      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(freqData);
      } else {
        // Simulated idle/live spectrum when audio not running
        const targetHz = currentProfile.fundamentalHz;
        const targetBin = Math.floor((targetHz / 1000) * 64);
        for (let i = 0; i < 64; i++) {
          const dist = Math.abs(i - targetBin);
          const base = Math.max(0, 200 - dist * 28);
          const noise = (Math.sin(phase + i * 0.4) + 1) * 20;
          freqData[i] = Math.min(255, base + noise);
        }
      }

      phase += 0.08;

      const barWidth = (width / 64) * 0.85;
      const barSpacing = (width / 64) * 0.15;

      for (let i = 0; i < 64; i++) {
        const val = freqData[i] / 255;
        const barHeight = val * (height - 24);
        const x = i * (barWidth + barSpacing);
        const y = height - barHeight - 12;

        // Color coding based on status & frequency
        let grad = ctx.createLinearGradient(0, height, 0, y);
        if (currentProfile.status === "CRITICAL") {
          grad.addColorStop(0, "#E11D48");
          grad.addColorStop(0.7, "#F43F5E");
          grad.addColorStop(1, "#FECDD3");
        } else if (currentProfile.status === "WARNING") {
          grad.addColorStop(0, "#D97706");
          grad.addColorStop(0.7, "#F59E0B");
          grad.addColorStop(1, "#FEF3C7");
        } else if (currentProfile.status === "ANOMALY") {
          grad.addColorStop(0, "#8B5CF6");
          grad.addColorStop(0.7, "#A855F7");
          grad.addColorStop(1, "#F3E8FF");
        } else {
          grad.addColorStop(0, "#B45309");
          grad.addColorStop(0.6, "#F59E0B");
          grad.addColorStop(1, "#10B981");
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Peak dot
        ctx.fillStyle = "#FFFBEB";
        ctx.fillRect(x, y - 2, barWidth, 2);
      }

      // Dominant frequency annotation marker
      const targetBin = Math.floor((currentProfile.fundamentalHz / 1000) * 64);
      const markerX = targetBin * (barWidth + barSpacing);
      ctx.fillStyle = "#F59E0B";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.fillText(`▲ ${currentProfile.fundamentalHz} Hz`, Math.min(width - 70, Math.max(10, markerX - 25)), 20);

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, selectedProfileKey]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleSendAlert = () => {
    setIsSimulatingAlert(true);
    setTimeout(() => {
      setIsSimulatingAlert(false);
      setAlertSent(true);
    }, 1200);
  };

  return (
    <div className="border-2 border-charcoal/20 bg-white shadow-luxury-card overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-charcoal text-alabaster border-b border-charcoal flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-gold bg-[#121212] rounded-xl flex items-center justify-center text-gold">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-ultra text-gold font-mono font-bold">
                Bio-Acoustic Spectral AI
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[8px] font-mono uppercase font-bold">
                FFT 256-Band Live
              </span>
            </div>
            <h2 className="text-xl serif text-alabaster font-normal">
              Smart Hive Acoustic Frequency & Swarm Early Warning Engine
            </h2>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleLiveMic}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 transition-all ${
              isMicLive
                ? "bg-rose-600 text-white shadow-lg animate-pulse"
                : "border-2 border-gold/60 bg-gold/10 text-gold hover:bg-gold hover:text-charcoal shadow-xs"
            }`}
          >
            {isMicLive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isMicLive ? "Stop Live Mic" : "🎤 Live Mic Input"}</span>
          </button>

          <button
            onClick={togglePlayback}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-mono font-bold flex items-center gap-2 transition-all ${
              isPlaying
                ? "bg-rose-600 text-white shadow-lg animate-pulse"
                : "bg-gold text-charcoal hover:bg-gold/90 shadow-xs"
            }`}
          >
            {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlaying ? "Mute Acoustic Synth" : "🔊 Listen to Hive Audio"}</span>
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Preset Selector & Spectrogram Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="block text-[10px] uppercase tracking-widest text-warm-grey mb-2 font-bold font-mono">
              Select Acoustic Sound Preset:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(PROFILES).map((p) => {
                const isSelected = selectedProfileKey === p.id;
                const statusColor =
                  p.status === "CRITICAL"
                    ? "border-rose-500 text-rose-700 bg-rose-50/50"
                    : p.status === "WARNING"
                    ? "border-amber-500 text-amber-800 bg-amber-50/50"
                    : p.status === "ANOMALY"
                    ? "border-purple-500 text-purple-800 bg-purple-50/50"
                    : "border-emerald-500 text-emerald-800 bg-emerald-50/50";

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfileKey(p.id)}
                    className={`p-3 text-left border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-gold bg-gold/10 shadow-sm scale-[1.01]"
                        : "border-charcoal/15 bg-white hover:border-charcoal/40"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-charcoal">{p.name}</span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border ${statusColor}`}>
                        {p.fundamentalHz} Hz
                      </span>
                    </div>
                    <span className="text-[10px] text-warm-grey font-mono truncate">{p.statusLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spectrogram Canvas */}
          <div className="border-2 border-charcoal/20 bg-[#0D0C0B] p-4 relative shadow-inner">
            <div className="flex justify-between items-center text-[9px] font-mono text-gold mb-2 border-b border-white/10 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                SPECTROGRAM FFT (0 Hz – 1,000 Hz)
              </span>
              <span>DOMINANT PEAK: {currentProfile.fundamentalHz} Hz</span>
            </div>

            <canvas
              ref={canvasRef}
              width={560}
              height={180}
              className="w-full h-44 rounded bg-[#0D0C0B] block"
            />

            <div className="flex justify-between items-center text-[8px] font-mono text-warm-grey mt-2">
              <span>0 Hz (Infrasound)</span>
              <span>250 Hz (Brood)</span>
              <span>500 Hz (Swarm)</span>
              <span>750 Hz</span>
              <span>1000 Hz (Acoustic Cap)</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4 bg-alabaster p-3 border border-charcoal/15 text-xs font-mono">
            <label htmlFor="acoustic-volume" className="text-[10px] uppercase tracking-widest text-warm-grey font-bold">Synthesizer Volume:</label>
            <input
              id="acoustic-volume"
              name="volume"
              aria-label="Synthesizer audio volume"
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-gold cursor-pointer"
            />
            <span className="text-charcoal font-bold w-12 text-right">{Math.round(volume * 200)}%</span>
          </div>
        </div>

        {/* Right Column: Real-Time Diagnostic Scorecard (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="p-5 border-2 border-charcoal/15 bg-[#F9F8F6] space-y-4">
            <div className="flex justify-between items-start border-b border-charcoal/10 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-ultra text-warm-grey font-bold block">
                  Colony Diagnostic
                </span>
                <h3 className="text-lg serif font-bold text-charcoal">{currentProfile.name}</h3>
              </div>
              <span
                className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase border ${
                  currentProfile.status === "CRITICAL"
                    ? "bg-rose-600 text-white border-rose-700"
                    : currentProfile.status === "WARNING"
                    ? "bg-amber-500 text-charcoal border-amber-600 font-bold"
                    : currentProfile.status === "ANOMALY"
                    ? "bg-purple-600 text-white border-purple-700"
                    : "bg-emerald-600 text-white border-emerald-700"
                }`}
              >
                {currentProfile.status}
              </span>
            </div>

            {/* Metric Bars */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-warm-grey font-bold">Swarm Departure Risk:</span>
                  <span
                    className={`font-bold ${
                      currentProfile.swarmRisk > 75
                        ? "text-rose-600 font-bold"
                        : currentProfile.swarmRisk > 30
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {currentProfile.swarmRisk}%
                  </span>
                </div>
                <div className="w-full h-2 bg-charcoal/10 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentProfile.swarmRisk > 75
                        ? "bg-rose-600"
                        : currentProfile.swarmRisk > 30
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${currentProfile.swarmRisk}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-charcoal/10 space-y-1.5 text-[11px]">
                <p>
                  <span className="text-warm-grey">Queen Status:</span>{" "}
                  <strong className="text-charcoal font-sans">{currentProfile.queenState}</strong>
                </p>
                <p>
                  <span className="text-warm-grey">Colony Behavior:</span>{" "}
                  <strong className="text-charcoal font-sans">{currentProfile.colonyMood}</strong>
                </p>
              </div>
            </div>

            {/* AI Recommendation Box */}
            <div className="p-3.5 bg-white border border-charcoal/20 shadow-xs">
              <div className="flex items-center gap-1.5 text-gold font-bold text-[10px] uppercase font-mono mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>KVIC Bio-Acoustic Action Plan</span>
              </div>
              <p className="text-xs text-charcoal font-serif leading-relaxed mb-2">
                {currentProfile.recommendation}
              </p>
              <p className="text-[10px] text-warm-grey font-mono border-t border-charcoal/10 pt-1.5">
                ⚡ Required Action: <strong className="text-charcoal">{currentProfile.actionRequired}</strong>
              </p>
            </div>
          </div>

          {/* Quick Intervention Alert Dispatch */}
          <div className="p-4 border-2 border-charcoal/20 bg-charcoal text-alabaster">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gold" />
                <span className="text-[10px] uppercase tracking-widest text-gold font-mono font-bold">
                  Emergency Field Notification
                </span>
              </div>
              <span className="text-[8px] font-mono text-warm-grey">KVIC SMS Gateway</span>
            </div>

            {alertSent ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SMS Alert Dispatched to Field Beekeeper & WhatsApp Bot!</span>
              </div>
            ) : (
              <button
                onClick={handleSendAlert}
                disabled={isSimulatingAlert}
                className="w-full py-2.5 bg-gold text-charcoal hover:bg-gold/90 font-bold text-xs uppercase tracking-widest font-mono flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {isSimulatingAlert ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Broadcasting Warning...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Dispatch Immediate SMS to Beekeeper</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
