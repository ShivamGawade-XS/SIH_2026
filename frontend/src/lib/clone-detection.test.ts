/**
 * Unit Tests: Geo-Velocity Clone Scan Detection & Haversine Distance
 * Smart India Hackathon 2026 — HoneyChain by TrueTag
 */

import { haversineDistanceKm, evaluateScanVelocity, DEMO_CITIES, ScanRecord } from "./clone-detection";

function runTests() {
  console.log("══════════════════════════════════════════════════════════");
  console.log("  Running Unit Tests: Clone Scan & Velocity Detection");
  console.log("══════════════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test Haversine Distance Calculation (Delhi to Mumbai ~1,148 km)
  const delhi = DEMO_CITIES["delhi"];
  const mumbai = DEMO_CITIES["mumbai"];
  const distDelhiMumbai = haversineDistanceKm(delhi.lat, delhi.lng, mumbai.lat, mumbai.lng);
  assert(
    distDelhiMumbai > 1100 && distDelhiMumbai < 1200,
    `Haversine distance Delhi-Mumbai is ~1,150km (calculated: ${distDelhiMumbai}km)`
  );

  // 2. Test Zero Distance for Same Coordinates
  const zeroDist = haversineDistanceKm(delhi.lat, delhi.lng, delhi.lat, delhi.lng);
  assert(zeroDist === 0, `Zero distance for identical coordinates (calculated: ${zeroDist}km)`);

  // 3. Test Clone Flag: Scanned in Delhi, then in Mumbai 2 minutes later (>500km in <=5min)
  const now = Math.floor(Date.now() / 1000);
  const scanDelhi: ScanRecord = {
    batchId: 1,
    qrToken: "TT-2026-00001",
    lat: delhi.lat,
    lng: delhi.lng,
    city: delhi.name,
    timestamp: now - 120, // 2 minutes ago
    isDemoLocation: true,
  };

  const scanMumbai: ScanRecord = {
    batchId: 1,
    qrToken: "TT-2026-00001",
    lat: mumbai.lat,
    lng: mumbai.lng,
    city: mumbai.name,
    timestamp: now,
    isDemoLocation: true,
  };

  const cloneResult = evaluateScanVelocity(scanDelhi, scanMumbai);
  assert(
    cloneResult.isClone === true,
    `Flag clone anomaly when 1,150km traveled in 120s (implied speed: ${cloneResult.impliedSpeedKmh} km/h)`
  );
  assert(
    cloneResult.warningMessage === "This QR was scanned in two places that are too far apart. It may be copied.",
    `Warning message exactly matches specification: "${cloneResult.warningMessage}"`
  );

  // 4. Test Legitimate Flow: Scanned in same city (Delhi) 2 minutes later
  const scanDelhiSecond: ScanRecord = {
    batchId: 1,
    qrToken: "TT-2026-00001",
    lat: delhi.lat + 0.01,
    lng: delhi.lng + 0.01,
    city: delhi.name,
    timestamp: now,
    isDemoLocation: true,
  };

  const legitResult = evaluateScanVelocity(scanDelhi, scanDelhiSecond);
  assert(
    legitResult.isClone === false,
    `Legitimate nearby scans within same city are NOT flagged as clone (${legitResult.distanceKm}km in 120s)`
  );

  // 5. Test Realistic Travel: Delhi to Mumbai 6 hours later (>500km, but >5min)
  const scanMumbaiLater: ScanRecord = {
    batchId: 1,
    qrToken: "TT-2026-00001",
    lat: mumbai.lat,
    lng: mumbai.lng,
    city: mumbai.name,
    timestamp: now + 21600, // 6 hours later
    isDemoLocation: true,
  };

  const flightResult = evaluateScanVelocity(scanDelhi, scanMumbaiLater);
  assert(
    flightResult.isClone === false,
    `Travel > 500km with realistic time delta (> 5 min) is NOT flagged as clone (${flightResult.distanceKm}km in ${flightResult.timeDeltaSeconds / 60}min)`
  );

  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`  Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("══════════════════════════════════════════════════════════\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
