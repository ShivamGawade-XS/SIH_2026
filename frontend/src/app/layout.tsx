import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NoiseOverlay from "@/components/NoiseOverlay";
import GridLines from "@/components/GridLines";
import IoTStageController from "@/components/IoTStageController";
import MobileBottomNav from "@/components/MobileBottomNav";
import { LanguageProvider } from "@/lib/LanguageContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://honeychain-truetag.vercel.app"),
  title: "HoneyChain by TrueTag — Blockchain Honey Authenticity & Provenance",
  description:
    "KVIC & National Bee Board verifiable honey authentication powered by Polygon PoS, AI quality scoring, and cryptographic QR provenance.",
  keywords: [
    "HoneyChain",
    "TrueTag",
    "KVIC",
    "National Bee Board",
    "Honey Traceability",
    "Polygon Blockchain",
    "FSSAI Honey Purity",
    "SIH 2026",
  ],
  authors: [{ name: "Shivam Gawade", url: "https://github.com/ShivamGawade-XS" }],
  icons: {
    icon: [
      { url: "/honeychain_app_icon.jpg", sizes: "any" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/honeychain_app_icon.jpg", sizes: "180x180" }],
    shortcut: "/honeychain_app_icon.jpg",
  },
  openGraph: {
    title: "HoneyChain by TrueTag — Blockchain Honey Authenticity & Provenance",
    description: "KVIC & National Bee Board verifiable honey authentication powered by Polygon PoS, AI quality scoring, and cryptographic QR provenance.",
    images: [{ url: "/honeychain_logo_badge.jpg", width: 1024, height: 1024, alt: "HoneyChain Brand Emblem" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        <link rel="icon" href="/honeychain_app_icon.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/honeychain_app_icon.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/honeychain_app_icon.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0F0F0F" />
      </head>
      <body className="min-h-screen bg-background text-text-primary relative selection:bg-brand-amber selection:text-black">
        <LanguageProvider>
          <NoiseOverlay />
          <GridLines />
          <div className="relative z-10 pb-20 md:pb-0">{children}</div>
          <MobileBottomNav />
          <IoTStageController />
          <Toaster position="top-right" />
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration skipped:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
