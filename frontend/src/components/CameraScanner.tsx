"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, RefreshCw, Sparkles, AlertCircle } from "lucide-react";

interface CameraScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScanSuccess, onClose }: CameraScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "honeychain-qr-scanner-region";

  useEffect(() => {
    let isMounted = true;
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          if (isMounted) setError("No camera device found on this system.");
          return;
        }

        const cameraId = cameras[cameras.length - 1].id; // Prefer back camera on mobile
        await scanner.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            scanner.stop().then(() => {
              onScanSuccess(decodedText);
            }).catch(() => {
              onScanSuccess(decodedText);
            });
          },
          () => {
            // Ignore scan parse frame drops
          }
        );

        if (isMounted) setIsScanning(true);
      } catch (err: any) {
        if (isMounted) {
          setError(
            err?.message?.includes("Permission")
              ? "Camera permission denied. Please allow camera access in browser settings."
              : "Unable to access camera feed."
          );
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="border border-charcoal/30 bg-alabaster max-w-md w-full p-4 sm:p-6 md:p-8 relative shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-charcoal/10">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-gold" />
            <span className="text-xs uppercase tracking-widest font-semibold text-charcoal">
              Scan Honey Jar Micro-QR
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:text-gold text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div className="relative border-2 border-charcoal bg-black overflow-hidden aspect-square flex items-center justify-center">
          <div id={regionId} className="w-full h-full" />

          {/* Scanning Reticle Frame */}
          <div className="absolute inset-8 border border-gold/60 pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <div className="w-4 h-4 border-t-2 border-l-2 border-gold" />
              <div className="w-4 h-4 border-t-2 border-r-2 border-gold" />
            </div>
            {/* Animated Laser Bar */}
            <div className="w-full h-0.5 bg-gold/80 shadow-[0_0_8px_#D4AF37] animate-bounce" />
            <div className="flex justify-between">
              <div className="w-4 h-4 border-b-2 border-l-2 border-gold" />
              <div className="w-4 h-4 border-b-2 border-r-2 border-gold" />
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 p-3 border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <p className="text-[10px] uppercase tracking-widest text-center text-warm-grey mt-4">
            Align the tamper-evident QR code on your honey jar within the frame
          </p>
        )}

        {/* Upload QR Image Fallback */}
        <div className="mt-4 pt-3 border-t border-charcoal/10 flex flex-col items-center">
          <label className="text-[10px] uppercase tracking-wider text-charcoal font-bold cursor-pointer hover:text-gold transition-colors flex items-center gap-1.5 py-1">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Or Upload QR Image / Screenshot</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !scannerRef.current) return;
                try {
                  const decodedText = await scannerRef.current.scanFile(file, true);
                  if (decodedText) {
                    onScanSuccess(decodedText);
                  }
                } catch {
                  setError("No valid QR code found in selected image.");
                }
              }}
            />
          </label>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 border border-charcoal text-xs uppercase tracking-widest font-semibold hover:bg-charcoal hover:text-white transition-colors"
        >
          Cancel Scan
        </button>
      </div>
    </div>
  );
}
