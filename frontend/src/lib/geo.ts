/**
 * Geolocation, Reverse Geocoding & GI Zone Geofencing for HoneyChain
 * Uses Browser Geolocation API + OpenStreetMap Nominatim (free, no API key)
 */

// ─── GI-Tagged Honey Zones (Approximate bounding boxes) ────────────────────

export interface GIZone {
  key: string;
  name: string;
  region: string;
  state: string;
  giCertNo: string;
  flora: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export const GI_ZONES: GIZone[] = [
  {
    key: "muzaffarpur",
    name: "Muzaffarpur Shahi Litchi Honey",
    region: "Muzaffarpur, Bihar",
    state: "Bihar",
    giCertNo: "GI-IND-BH-2018-0524",
    flora: "Litchi chinensis (Shahi Litchi Blossom)",
    bounds: { minLat: 25.85, maxLat: 26.45, minLng: 85.0, maxLng: 85.85 },
  },
  {
    key: "sundarbans",
    name: "Sundarbans Wild Mangrove Honey",
    region: "Sundarbans Biosphere Reserve, West Bengal",
    state: "West Bengal",
    giCertNo: "GI-IND-WB-2024-0689",
    flora: "Rhizophora & Avicennia (Wild Mangrove Flora)",
    bounds: { minLat: 21.5, maxLat: 22.4, minLng: 88.5, maxLng: 89.9 },
  },
  {
    key: "kashmir",
    name: "Kashmir White Acacia Honey",
    region: "Kashmir Valley, Jammu & Kashmir",
    state: "Jammu & Kashmir",
    giCertNo: "GI-IND-JK-2021-0412",
    flora: "Robinia pseudoacacia (Kashmir White Acacia)",
    bounds: { minLat: 33.3, maxLat: 34.7, minLng: 73.8, maxLng: 75.5 },
  },
  {
    key: "nilgiris",
    name: "Nilgiris Shola Forest Honey",
    region: "Nilgiris Biosphere Reserve, Tamil Nadu",
    state: "Tamil Nadu",
    giCertNo: "GI-IND-TN-2023-0598",
    flora: "Strobilanthes kunthiana (Shola Mountain Flora)",
    bounds: { minLat: 11.1, maxLat: 11.6, minLng: 76.3, maxLng: 77.0 },
  },
  {
    key: "coorg",
    name: "Coorg Coffee Blossom Honey",
    region: "Kodagu (Coorg), Karnataka",
    state: "Karnataka",
    giCertNo: "GI-IND-KA-2022-0487",
    flora: "Coffea arabica (Coffee Blossom)",
    bounds: { minLat: 12.15, maxLat: 12.75, minLng: 75.5, maxLng: 76.2 },
  },
];

// ─── Browser Geolocation ────────────────────────────────────────────────────

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

/**
 * Get the user's current GPS position using the Browser Geolocation API
 */
export function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission denied by user"));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable"));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out"));
            break;
          default:
            reject(new Error("An unknown geolocation error occurred"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

// ─── Reverse Geocoding (OpenStreetMap Nominatim — Free, No API Key) ─────────

export interface GeocodedAddress {
  display: string;
  district: string;
  state: string;
  country: string;
}

/**
 * Reverse geocode GPS coordinates to a human-readable address
 * Uses OpenStreetMap Nominatim (free, rate-limited to 1 req/sec)
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodedAddress> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`,
      {
        headers: {
          "User-Agent": "HoneyChain-SIH2026/2.0 (honeychain@truetag.in)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    return {
      display: data.display_name || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
      district:
        addr.county ||
        addr.city_district ||
        addr.city ||
        addr.town ||
        addr.village ||
        "Unknown District",
      state:
        addr.state || addr.region || "Unknown State",
      country: addr.country || "India",
    };
  } catch (err) {
    console.warn("Reverse geocoding failed:", err);
    return {
      display: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
      district: "Unknown",
      state: "Unknown",
      country: "India",
    };
  }
}

// ─── GI Zone Geofencing ─────────────────────────────────────────────────────

/**
 * Check if GPS coordinates fall within any registered GI-tagged honey zone
 * Uses simple bounding box containment check
 */
export function checkGIZone(lat: number, lng: number): GIZone | null {
  for (const zone of GI_ZONES) {
    const b = zone.bounds;
    if (lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng) {
      return zone;
    }
  }
  return null;
}

/**
 * Haversine distance between two GPS points (in kilometers)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Generate an OpenStreetMap embed URL for displaying an apiary marker
 */
export function getMapEmbedUrl(lat: number, lng: number, zoom: number = 13): string {
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05},${lat - 0.03},${lng + 0.05},${lat + 0.03}&layer=mapnik&marker=${lat},${lng}`;
}
