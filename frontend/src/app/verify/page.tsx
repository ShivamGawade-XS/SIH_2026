"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CameraScanner from "@/components/CameraScanner";
import OfflineSMSSimulator from "@/components/OfflineSMSSimulator";
import { Camera, MessageSquare, Search, ArrowRight, MapPin, CheckCircle } from "lucide-react";
import { getCustomBatches } from "@/lib/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const SAMPLE_BATCHES = [
  { id: 1, name: "Muzaffarpur Litchi Honey", qr: "TT-2026-00001", score: 94, location: "Muzaffarpur, Bihar" },
  { id: 2, name: "Sundarbans Wild Mangrove Honey", qr: "TT-2026-00002", score: 91, location: "Sundarbans, West Bengal" },
];

export default function VerifySearchPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    processScanResult(tokenInput.trim());
  };

  const processScanResult = (decodedText: string) => {
    setShowScanner(false);
    const clean = decodedText.trim();

    if (clean.includes("/verify/")) {
      const parts = clean.split("/verify/");
      const batchPart = parts[1]?.split("?")[0]?.split("/")[0];
      if (batchPart) { router.push(`/verify/${batchPart}`); return; }
    }

    const customList = getCustomBatches();
    const match = customList.find(
      (b) => b.qrToken.toLowerCase() === clean.toLowerCase() || String(b.batchId) === clean
    );
    if (match) { router.push(`/verify/${match.batchId}?qr=${encodeURIComponent(match.qrToken)}`); return; }
    if (/^\d+$/.test(clean)) { router.push(`/verify/${clean}`); return; }
    router.push(`/verify/1?qr=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {showScanner && (
        <CameraScanner
          onScanSuccess={(code) => processScanResult(code)}
          onClose={() => setShowScanner(false)}
        />
      )}

      <OfflineSMSSimulator
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
      />

      <main className="min-h-screen px-4 py-10 max-w-xl mx-auto w-full flex-1">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Verify Your Honey</h1>
          <p className="text-text-secondary mt-1 text-sm">
            Scan the QR code on your jar, or enter the batch token manually.
          </p>
        </div>

        {/* Scan */}
        <Button
          size="lg"
          className="w-full bg-brand-amber hover:bg-brand-amber-light text-black font-semibold h-14 text-base mb-3"
          onClick={() => setShowScanner(true)}
        >
          <Camera className="w-5 h-5 mr-2" />
          Scan QR Code
        </Button>

        {/* SMS */}
        <Button
          size="lg"
          variant="outline"
          className="w-full border-border text-text-secondary h-12 text-sm mb-6"
          onClick={() => setShowSmsModal(true)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Verify by SMS — Send TT-XXXXXX to 56767
        </Button>

        {/* Divider */}
        <div className="relative mb-6">
          <Separator className="bg-border" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-text-muted">
            or enter token manually
          </span>
        </div>

        {/* Manual input */}
        <form onSubmit={handleSearch} className="space-y-2 mb-8">
          <Label htmlFor="verify-batchid" className="text-text-secondary text-sm">Batch Token</Label>
          <div className="flex gap-2">
            <Input
              id="verify-batchid"
              name="batchId"
              placeholder="TT-2026-XXXXX"
              autoComplete="off"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="bg-surface border-border text-text-primary placeholder:text-text-muted h-12 text-base font-mono"
            />
            <Button
              type="submit"
              className="bg-brand-amber hover:bg-brand-amber-light text-black h-12 px-6"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Sample batches */}
        <div>
          <p className="text-sm text-text-muted mb-3">Sample Batches</p>
          <div className="space-y-3">
            {SAMPLE_BATCHES.map((batch) => (
              <Card
                key={batch.id}
                className="bg-surface border-border hover:border-brand-amber transition-colors cursor-pointer"
              >
                <CardContent className="p-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted font-mono mb-1">{batch.qr}</p>
                    <p className="text-base font-semibold text-text-primary truncate">{batch.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-text-secondary shrink-0" />
                      <p className="text-sm text-text-secondary truncate">{batch.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        batch.score >= 85
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {batch.score} / 100
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-brand-amber hover:text-brand-amber-light p-0 h-auto text-xs"
                      asChild
                    >
                      <Link href={`/verify/${batch.id}?qr=${batch.qr}`}>
                        Verify <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
