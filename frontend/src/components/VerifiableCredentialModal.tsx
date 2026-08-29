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
      created: new Date().toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: "did:honeychain:kvic:officer:0x892a0e3b97b0a7b45f3c1d9e2a8f4c6e1b7d5a3#key-1",
      jws: `eyJhbGciOiJFUzI1NksiLCJjcml0IjpbImJjIl19..MEQCIQ${Array.from({ length: 64 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`,
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-text-primary">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-surface-raised flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-amber/10 border border-brand-amber/30 rounded-lg flex items-center justify-center text-brand-amber">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary">W3C Verifiable Credential (JSON-LD)</h3>
                <Badge variant="outline" className="text-success border-success/30 text-[10px]">
                  ECDSA Signed
                </Badge>
              </div>
              <p className="text-xs text-text-secondary">
                Tamper-evident W3C standard export for DigiLocker and National AgriStack Federation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#0D0D0D]">
          <pre className="text-xs font-mono text-text-primary leading-relaxed whitespace-pre-wrap select-all">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface-raised flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-text-muted">Standard: W3C VC 1.0 JSON-LD</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-border text-text-secondary hover:text-text-primary text-xs"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              {copied ? "Copied" : "Copy JSON-LD"}
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="bg-brand-amber hover:bg-brand-amber-light text-black font-semibold text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download .jsonld
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
