"use client";

import { useState } from "react";
import {
  FlaskConical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface HoneySample {
  id: string;
  name: string;
  type: "PURE" | "ADULTERATED";
  flora: string;
  location: string;
  moisture: number;
  brix: number;
  hmf: number;
  diastase: number;
  c13Delta: number;
  c4Sugar: number;
  smrMarker: number;
  score: number;
  grade: string;
  adulterant: string;
  fssaiViolations: string[];
}

const PRESET_SAMPLES: HoneySample[] = [
  {
    id: "SAMPLE-PURE-01",
    name: "Pure Kashmir Acacia Raw Honey",
    type: "PURE",
    flora: "Robinia Pseudoacacia (Acacia)",
    location: "Anantnag, Jammu & Kashmir",
    moisture: 16.8,
    brix: 82.5,
    hmf: 8.2,
    diastase: 16.4,
    c13Delta: -26.8,
    c4Sugar: 0.8,
    smrMarker: 0.01,
    score: 96,
    grade: "Grade A+ (Export Premium)",
    adulterant: "None (100% Unadulterated Natural Honey)",
    fssaiViolations: [],
  },
  {
    id: "SAMPLE-ADULT-01",
    name: "18% High-Fructose Rice/Corn Syrup Blend",
    type: "ADULTERATED",
    flora: "Synthetic Fructose/Glucose Matrix",
    location: "Commercial Invert Refinery Batch",
    moisture: 21.4,
    brix: 76.2,
    hmf: 54.0,
    diastase: 4.2,
    c13Delta: -14.2,
    c4Sugar: 16.4,
    smrMarker: 0.19,
    score: 12,
    grade: "NON-COMPLIANT (Adulterated)",
    adulterant: "Exogenous C4 Corn & SMR Rice Oligosaccharide Syrup",
    fssaiViolations: [
      "Moisture 21.4% exceeds FSSAI max threshold of 20.0%",
      "C13 Isotope Delta -14.2‰ exceeds natural C3 range (-23.5‰ to -27.5‰)",
      "C4 Exogenous Cane/Corn Sugar 16.4% exceeds 7.0% limit",
      "SMR (Specific Marker for Rice Syrup) positive (0.19 > 0.05)",
      "HMF 54.0 mg/kg exceeds tropical threshold of 40 mg/kg",
      "Diastase Activity 4.2 Schade units falls below minimum 8.0",
    ],
  },
];

export default function AdulterationComparisonLab() {
  const [selectedSample, setSelectedSample] = useState<HoneySample>(PRESET_SAMPLES[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSelect = (sample: HoneySample) => {
    setIsSimulating(true);
    setTimeout(() => {
      setSelectedSample(sample);
      setIsSimulating(false);
    }, 250);
  };

  return (
    <Card className="bg-surface border-border text-text-primary overflow-hidden">
      <div className="p-6 border-b border-border bg-surface-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-amber/10 border border-brand-amber/30 rounded-lg flex items-center justify-center text-brand-amber">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-primary">FSSAI IS 4941 Adulteration Lab Stress-Tester</h3>
              <Badge variant="outline" className="text-brand-amber border-brand-amber text-[10px]">
                Interactive Tool
              </Badge>
            </div>
            <p className="text-xs text-text-secondary">
              Side-by-side comparison of 100% pure raw honey vs. modern synthetic syrup adulteration vectors.
            </p>
          </div>
        </div>

        {/* Sample Selectors */}
        <div className="flex gap-2">
          {PRESET_SAMPLES.map((s) => {
            const isSelected = selectedSample.id === s.id;
            return (
              <Button
                key={s.id}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => handleSelect(s)}
                className={`text-xs font-semibold ${
                  isSelected
                    ? s.type === "PURE"
                      ? "bg-success text-white hover:bg-success/90"
                      : "bg-danger text-white hover:bg-danger/90"
                    : "border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                {s.type === "PURE" ? <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> : <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                {s.type === "PURE" ? "Pure Acacia" : "18% Invert Blend"}
              </Button>
            );
          })}
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Sample Profile Header */}
        <div className="p-4 bg-surface-raised border border-border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={
                  selectedSample.type === "PURE"
                    ? "bg-success/10 text-success border-success/30"
                    : "bg-danger/10 text-danger border-danger/30"
                }
              >
                {selectedSample.type === "PURE" ? "VERIFIED AUTHENTIC" : "ADULTERATED SAMPLE"}
              </Badge>
              <span className="text-xs font-mono text-text-muted">{selectedSample.id}</span>
            </div>
            <h4 className="text-base font-bold text-text-primary">{selectedSample.name}</h4>
            <p className="text-xs text-text-secondary mt-0.5">{selectedSample.location} · {selectedSample.flora}</p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-wider text-text-muted font-mono">FSSAI Purity Score</p>
            <p className={`text-3xl font-bold font-mono ${
              selectedSample.score >= 85 ? "text-success" : "text-danger"
            }`}>
              {selectedSample.score} / 100
            </p>
            <p className="text-xs font-semibold text-text-secondary">{selectedSample.grade}</p>
          </div>
        </div>

        {/* 6 Key Laboratory Parameters Table */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-surface-raised border border-border rounded-lg">
            <p className="text-[10px] uppercase font-mono text-text-muted font-bold">Moisture %</p>
            <p className={`text-lg font-bold font-mono ${selectedSample.moisture <= 20 ? "text-text-primary" : "text-danger"}`}>
              {selectedSample.moisture}%
            </p>
            <p className="text-[10px] text-text-muted mt-1">FSSAI: &le; 20.0%</p>
          </div>

          <div className="p-3 bg-surface-raised border border-border rounded-lg">
            <p className="text-[10px] uppercase font-mono text-text-muted font-bold">Brix Index</p>
            <p className={`text-lg font-bold font-mono ${selectedSample.brix >= 80 ? "text-text-primary" : "text-danger"}`}>
              {selectedSample.brix}°
            </p>
            <p className="text-[10px] text-text-muted mt-1">FSSAI: &ge; 80.0°</p>
          </div>

          <div className="p-3 bg-surface-raised border border-border rounded-lg">
            <p className="text-[10px] uppercase font-mono text-text-muted font-bold">HMF Level</p>
            <p className={`text-lg font-bold font-mono ${selectedSample.hmf <= 40 ? "text-text-primary" : "text-danger"}`}>
              {selectedSample.hmf} <span className="text-xs font-normal">mg/kg</span>
            </p>
            <p className="text-[10px] text-text-muted mt-1">FSSAI: &le; 40.0</p>
          </div>

          <div className="p-3 bg-surface-raised border border-border rounded-lg">
            <p className="text-[10px] uppercase font-mono text-text-muted font-bold">Diastase No.</p>
            <p className={`text-lg font-bold font-mono ${selectedSample.diastase >= 8 ? "text-text-primary" : "text-danger"}`}>
              {selectedSample.diastase} <span className="text-xs font-normal">DN</span>
            </p>
            <p className="text-[10px] text-text-muted mt-1">FSSAI: &ge; 8.0</p>
          </div>

          <div className="p-3 bg-surface-raised border border-border rounded-lg">
            <p className="text-[10px] uppercase font-mono text-text-muted font-bold">&delta;13C Isotope</p>
            <p className={`text-lg font-bold font-mono ${selectedSample.c13Delta <= -23.5 ? "text-text-primary" : "text-danger"}`}>
              {selectedSample.c13Delta} <span className="text-xs font-normal">‰</span>
            </p>
            <p className="text-[10px] text-text-muted mt-1">Range: -23.5 to -27.5</p>
          </div>

          <div className="p-3 bg-surface-raised border border-border rounded-lg">
            <p className="text-[10px] uppercase font-mono text-text-muted font-bold">C4 Sugar %</p>
            <p className={`text-lg font-bold font-mono ${selectedSample.c4Sugar <= 7 ? "text-text-primary" : "text-danger"}`}>
              {selectedSample.c4Sugar}%
            </p>
            <p className="text-[10px] text-text-muted mt-1">FSSAI: &le; 7.0%</p>
          </div>
        </div>

        {/* Adulteration Analysis & Violations */}
        {selectedSample.type === "ADULTERATED" ? (
          <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-danger font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Adulteration Flags Detected ({selectedSample.fssaiViolations.length} Violations)</span>
            </div>
            <ul className="space-y-1.5 text-xs text-text-primary pt-1">
              {selectedSample.fssaiViolations.map((v, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-danger font-bold">✕</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-danger/20 flex items-center justify-between text-xs font-mono text-danger">
              <span>Classifier Label: {selectedSample.adulterant}</span>
              <span className="font-bold">STATUS: REJECTED FROM BLOCKCHAIN MINTING</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-success/10 border border-success/30 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider">
              <CheckCircle className="w-4 h-4" />
              <span>100% FSSAI IS 4941 & NMR Spectroscopy Compliance Passed</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Sample exhibits natural unheated enzyme kinetics (Diastase 16.4), pure C3 botanical photosynthetic isotope signature (&delta;13C -26.8‰), and complete absence of industrial C4 corn or rice oligosaccharide markers.
            </p>
            <div className="mt-2 pt-2 border-t border-success/20 flex items-center justify-between text-xs font-mono text-success">
              <span>Classifier: Unadulterated Natural Raw Honey</span>
              <span className="font-bold">STATUS: QUALIFIED FOR POLYGON ON-CHAIN MINT</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
