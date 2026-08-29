"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QrCode, ArrowRight, MapPin, CheckCircle, ShieldCheck, Sparkles, Award } from "lucide-react";
import { DEMO_BATCHES } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STATS = [
  { value: "14,240+", label: "Registered Beekeepers" },
  { value: "1.8M+",   label: "Batches Tokenized" },
  { value: "99.4%",   label: "FSSAI Compliance Rate" },
  { value: "4.2M+",   label: "Consumer Verifications" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Harvest Logged",
    desc: "Field officers record Brix, moisture, and yield at harvest. The batch is assigned a unique token on Polygon.",
    tech: "Solidity 0.8.24 · OpenZeppelin RBAC",
  },
  {
    step: "02",
    title: "QR Sealed",
    desc: "A tamper-evident micro-QR label is printed for each jar, linking to the immutable blockchain record.",
    tech: "Scikit-Learn · Random Forest Model",
  },
  {
    step: "03",
    title: "Consumer Verifies",
    desc: "Scanning the QR opens a mobile page showing the beekeeper, harvest conditions, AI purity score, and transaction proof.",
    tech: "IPFS · Decentralized Media Storage",
  },
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="min-h-[82vh] flex flex-col justify-center px-6 max-w-4xl mx-auto py-20">
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Badge variant="outline" className="text-brand-amber border-brand-amber text-xs">
              KVIC · National Bee Board
            </Badge>
            <Badge variant="outline" className="text-text-secondary border-border text-xs">
              SIH 2026 — PS SIH26021
            </Badge>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-text-primary leading-tight mb-5">
            Purity, Proven<br />
            <span className="text-brand-amber">On-Chain.</span>
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mb-10 leading-relaxed">
            HoneyChain links every honey jar to its beekeeper, harvest data, and
            blockchain record — so consumers can verify authenticity in under 3 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild className="bg-brand-amber hover:bg-brand-amber-light text-black font-semibold h-14">
              <Link href="/verify">
                <QrCode className="w-4 h-4 mr-2" />
                Verify a Honey Jar
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-border text-text-primary hover:bg-surface-raised h-14" asChild>
              <Link href="/dashboard">
                Field Officer Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border bg-surface px-6 py-12">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <Card key={stat.label} className="bg-surface-raised border-border">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-brand-amber">{stat.value}</p>
                  <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="border-l-2 border-brand-amber pl-4 text-2xl font-semibold text-text-primary mb-10">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((item) => (
                <Card key={item.step} className="bg-surface border-l-2 border-l-brand-amber border-t-border border-r-border border-b-border">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <span className="text-4xl font-bold text-text-muted">{item.step}</span>
                    <h3 className="text-base font-semibold text-text-primary">{item.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                    <p className="text-xs text-text-muted font-mono pt-2 border-t border-border">{item.tech}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Verified Batches */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="border-l-2 border-brand-amber pl-4 text-2xl font-semibold text-text-primary">
                Recent Verified Batches
              </h2>
              <Link
                href="/verify"
                className="text-sm text-brand-amber hover:text-brand-amber-light flex items-center gap-1 transition-colors"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_BATCHES.map((batch) => (
                <Card
                  key={batch.batchId}
                  className="bg-surface border-border hover:border-brand-amber transition-colors cursor-pointer"
                >
                  <CardContent className="p-5 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted font-mono mb-1">{batch.qrToken}</p>
                      <p className="text-base font-semibold text-text-primary truncate">
                        {batch.farmer.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-text-secondary shrink-0" />
                        <p className="text-sm text-text-secondary truncate">{batch.farmer.location}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge
                        className={
                          batch.batch.qualityScore >= 85
                            ? "bg-success/10 text-success border-success/20"
                            : batch.batch.qualityScore >= 70
                            ? "bg-warning/10 text-warning border-warning/20"
                            : "bg-danger/10 text-danger border-danger/20"
                        }
                        variant="outline"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {batch.batch.qualityScore} / 100
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-brand-amber hover:text-brand-amber-light p-0 h-auto text-xs" asChild>
                        <Link href={`/verify/${batch.batchId}`}>
                          Verify <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
