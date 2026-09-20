/**
 * Clone-Scan & Geo-Velocity Teleportation Detection Engine
 * Smart India Hackathon 2026 — HoneyChain by TrueTag
 */

export interface GeoLocation {
  lat: number;
  lng: number;
  city?: string;
  isDemo?: boolean;
}

export interface ScanRecord {
  batchId: number;
  qrToken: string;
  lat: number;
  lng: number;
  city?: string;
  timestamp: number; // Unix timestamp in seconds
  isDemoLocation?: boolean;
  userAgent?: string;
}

export interface CloneDetectionResult {
  isClone: boolean;
  distanceKm: number;
  timeDeltaSeconds: number;
  impliedSpeedKmh: number;
  warningMessage?: string;
  prevScan?: ScanRecord;
  currentScan?: ScanRecord;
}

export const DEMO_CITIES: Record<string, { lat: number; lng: number; name: string }> = {
  delhi: { lat: 28.6139, lng: 77.2090, name: "New Delhi, NCR" },
  mumbai: { lat: 19.0760, lng: 72.8777, name: "Mumbai, Maharashtra" },
  bengaluru: { lat: 12.9716, lng: 77.5946, name: "Bengaluru, Karnataka" },
  bangalore: { lat: 12.9716, lng: 77.5946, name: "Bengaluru, Karnataka" },
  kolkata: { lat: 22.5726, lng: 88.3639, name: "Kolkata, West Bengal" },
  muzaffarpur: { lat: 26.1208, lng: 85.3905, name: "Muzaffarpur, Bihar" },
  chennai: { lat: 13.0827, lng: 80.2707, name: "Chennai, Tamil Nadu" },
};

/**
 * Calculates great-circle distance between two geographic coordinates using the Haversine formula
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Evaluates whether two consecutive scans of the same QR token violate physical velocity bounds
 * Threshold: Distance > 500 km within 300 seconds (5 minutes)
 */
export function evaluateScanVelocity(
  prevScan: ScanRecord,
  currentScan: ScanRecord
): CloneDetectionResult {
  const distanceKm = haversineDistanceKm(
    prevScan.lat,
    prevScan.lng,
    currentScan.lat,
    currentScan.lng
  );

  const timeDeltaSeconds = Math.max(1, Math.abs(currentScan.timestamp - prevScan.timestamp));
  const timeDeltaHours = timeDeltaSeconds / 3600;
  const impliedSpeedKmh = Number((distanceKm / timeDeltaHours).toFixed(1));

  // Condition: Traveled > 500 km in <= 5 minutes (300 seconds)
  const isClone = distanceKm > 500 && timeDeltaSeconds <= 300;

  return {
    isClone,
    distanceKm,
    timeDeltaSeconds,
    impliedSpeedKmh,
    warningMessage: isClone
      ? "This QR was scanned in two places that are too far apart. It may be copied."
      : undefined,
    prevScan,
    currentScan,
  };
}

/**
 * Resolves geolocation either from demoCity override or coordinates
 */
export function resolveLocation(
  demoCityParam: string | null,
  fallbackLat?: number,
  fallbackLng?: number
): GeoLocation {
  if (demoCityParam) {
    const key = demoCityParam.trim().toLowerCase();
    const city = DEMO_CITIES[key];
    if (city) {
      return {
        lat: city.lat,
        lng: city.lng,
        city: city.name,
        isDemo: true,
      };
    }
  }

  return {
    lat: fallbackLat || 28.6139,
    lng: fallbackLng || 77.2090,
    city: "Real Geolocation",
    isDemo: false,
  };
}
