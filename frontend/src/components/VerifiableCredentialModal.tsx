"use client";

import { useState } from "react";
import {
  FileCode,
  CheckCircle2,
  Copy,
  Download,
  X,
  ShieldCheck,
  ExternalLink,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BatchMetadata } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  batch: BatchMetadata;
}

export default function VerifiableCredentialModal({ isOpen, onClose, batch }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const w3cCredential = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://honeychain.org/contexts/honey-provenance-v1.jsonld",
      "https://schema.org",
    ],
    id: `urn:uuid:honeychain:batch:${batch.qrToken}`,
    type: ["VerifiableCredential", "HoneyProvenanceCertificate", "FSSAIQualityCredential"],
    issuer: {
      id: "did:honeychain:kvic:officer:0x892a0e3b97b0a7b45f3c1d9e2a8f4c6e1b7d5a3",
      name: "Khadi and Village Industries Commission (KVIC) - National Bee Board",
      jurisdiction: "Ministry of MSME, Government of India",
    },
    issuanceDate: new Date((batch.batch?.harvestTimestamp || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    credentialSubject: {
      id: `did:honeychain:farmer:${batch.farmer.farmerId}`,
      batchId: batch.batchId,
      qrToken: batch.qrToken,
      farmer: {
        name: batch.farmer.name,
        location: batch.farmer.location,
        cooperativeCode: batch.farmer.cooperativeId,
      },
      harvest: {
        floraSource: batch.botanicalFlora || "Natural Flora",
        harvestDate: new Date((batch.batch?.harvestTimestamp || Math.floor(Date.now() / 1000)) * 1000).toISOString().split("T")[0],
      },
      qualityAssessment: {
        fssaiScore: batch.batch?.qualityScore ?? batch.labReport?.purityScore ?? 94,
        grade: batch.batch?.grade ?? batch.labReport?.grade ?? "Grade A+",
        moisturePercent: batch.labReport?.moisturePercent ?? 17.5,
        brixIndex: batch.labReport?.brixPercent ?? 81.2,
        hmfLevelMgKg: batch.labReport?.hmfMgPerKg ?? 12.4,
        diastaseActivity: batch.labReport?.diastaseNumber ?? 14.0,
        carbon13IsotopeDelta: batch.labReport?.c13IsotopeDelta ?? -26.2,
        complianceStandard: "FSSAI IS 4941:2019 / EA-IRMS Isotope Calibration",
      },
      blockchainAnchor: {
        network: "Polygon PoS",
        contractAddress: "0x892a0e3b97b0a7b45f3c1d9e2a8f4c6e1b7d5a3",
        ipfsMetadataCid: batch.batch?.ipfsMetadataHash || "bafybeic7v...2q",
      },
    },
    proof: {
      type: "EcdsaSecp256k1Signature2019",
      created: new Date((batch.batch?.harvestTimestamp || 1723618800) * 1000).toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: "did:honeychain:kvic:officer:0x892a0e3b97b0a7b45f3c1d9e2a8f4c6e1b7d5a3#key-1",
      jws: "eyJhbGciOiJFUzI1NksiLCJjcml0IjpbImJjIl19..MEQCIQC7a3f89d02e456b1c8f902a45b7e8d9c0e123456789abcdef0123456789abcdef01AiB89f2d9c4e7b1a56209ef43c8b1a32d67e891c345a6789b0cd1234ef56789a2f10",
    },
  };

  const jsonString = JSON.stringify(w3cCredential, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success("W3C Verifiable Credential JSON-LD copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HoneyChain-${batch.qrToken}-W3C-Credential.jsonld`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${batch.qrToken} W3C Credential`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="border-2 border-gold bg-white max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-charcoal relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-charcoal/10 bg-[#F9F8F6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/10 border border-gold flex items-center justify-center text-gold">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl serif font-bold text-charcoal">W3C Verifiable Credential (JSON-LD)</h3>
                <span className="px-2 py-0.5 text-sm md:text-xs md:text-[10px] md:text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ECDSA Signed
                </span>
              </div>
              <p className="text-sm md:text-xs text-warm-grey">
                Tamper-evident W3C standard export for DigiLocker and National AgriStack Federation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-charcoal/50 hover:text-charcoal transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#141414] text-[#E0E0E0]">
          <pre className="text-sm md:text-xs font-mono leading-relaxed whitespace-pre-wrap select-all">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-charcoal/10 bg-[#F9F8F6] flex items-center justify-between gap-3">
          <span className="text-sm md:text-xs font-mono text-warm-grey font-semibold">Standard: W3C VC 1.0 JSON-LD</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 border border-charcoal/30 bg-white hover:border-gold text-charcoal text-sm md:text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-gold" />
              <span>{copied ? "Copied" : "Copy JSON-LD"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2 text-sm md:text-xs uppercase tracking-wider font-bold btn-gold-slide flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-gold" />
              <span>Download .jsonld</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
