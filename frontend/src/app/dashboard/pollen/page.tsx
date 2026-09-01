"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PollenVisionAnalyzer from "@/components/PollenVisionAnalyzer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PollenPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F8F6]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 w-full flex-1">
        <div className="flex items-center gap-2 mb-6 text-xs font-mono text-warm-grey">
          <Link href="/dashboard" className="hover:text-charcoal flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-charcoal font-bold">Pollen Grain Vision AI — Floral Origin Classifier</span>
        </div>
        <PollenVisionAnalyzer />
      </main>
      <Footer />
    </div>
  );
}
