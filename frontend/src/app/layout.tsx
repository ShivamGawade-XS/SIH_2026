import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NoiseOverlay from "@/components/NoiseOverlay";
import GridLines from "@/components/GridLines";
import IoTStageController from "@/components/IoTStageController";
import { LanguageProvider } from "@/lib/LanguageContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

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
  title: "HoneyChain by TrueTag — Blockchain Honey Authenticity & Provenance",
  description:
    "KVIC & National Bee Board verifiable honey authentication engine powered by Polygon PoS, AI quality scoring, and TrueTag cryptographic QR provenance.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${mono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1A1A1A" />
      </head>
      <body className="min-h-screen bg-alabaster text-charcoal relative selection:bg-gold selection:text-charcoal">
        <LanguageProvider>
          <NoiseOverlay />
          <GridLines />
          <div className="relative z-10">{children}</div>
          <IoTStageController />
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
