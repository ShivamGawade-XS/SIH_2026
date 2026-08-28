/**
 * Database Seeder for HoneyChain by TrueTag
 * Seeds initial KVIC officers (with bcrypt password hashes), verified beekeepers with GPS coordinates,
 * authentic demo batches with FSSAI lab results, and initial complaints.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting HoneyChain database seed...");

  // 1. Clean existing records
  await prisma.tipPayment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.labTest.deleteMany();
  await prisma.custodyLog.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Officer & Admin Users
  const officerHash = await bcrypt.hash("kvic2026password", 10);
  const labHash = await bcrypt.hash("lab2026password", 10);
  const adminHash = await bcrypt.hash("admin2026password", 10);

  const officer = await prisma.user.create({
    data: {
      email: "officer@kvic.gov.in",
      passwordHash: officerHash,
      name: "Dr. Ananya Ray",
      role: "FIELD_OFFICER",
      phone: "+919876543210",
      cooperative: "KVIC-BH-002",
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const labAnalyst = await prisma.user.create({
    data: {
      email: "lab@bee-board.gov.in",
      passwordHash: labHash,
      name: "K. S. Narayanan (Chief Chemist)",
      role: "LAB_ANALYST",
      phone: "+919876543211",
      cooperative: "NBB-DEL-LAB-01",
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@truetag.in",
      passwordHash: adminHash,
      name: "Shivam Gawade (TrueTag Director)",
      role: "ADMIN",
      phone: "+919876543212",
      cooperative: "TRUETAG-HQ",
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  console.log("   ✅ Created 3 officer & admin accounts with bcrypt hashes");

  // 3. Create Verified Farmers / Beekeepers with Real GPS Coordinates
  const farmer1 = await prisma.farmer.create({
    data: {
      id: 1,
      name: "Rajesh Kumar Verma",
      location: "Muzaffarpur, Bihar",
      cooperativeId: "KVIC-BH-002",
      gpsLat: 26.1209,
      gpsLng: 85.3647,
      ipfsProfileHash: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      upiVpa: "rajesh.verma@sbi",
      isVerified: true,
      registeredById: officer.id,
    },
  });

  const farmer2 = await prisma.farmer.create({
    data: {
      id: 2,
      name: "Lakshmi Devi",
      location: "Sundarbans Biosphere Reserve, West Bengal",
      cooperativeId: "KVIC-WB-009",
      gpsLat: 21.9497,
      gpsLng: 89.1833,
      ipfsProfileHash: "bafybeicx3m2j5t7qrv47u98zxp4321fedcba0987654321",
      upiVpa: "lakshmi.devi@oksbi",
      isVerified: true,
      registeredById: officer.id,
    },
  });

  const farmer3 = await prisma.farmer.create({
    data: {
      id: 3,
      name: "Ghulam Hassan Lone",
      location: "Kashmir Valley, Jammu & Kashmir",
      cooperativeId: "KVIC-JK-004",
      gpsLat: 34.0837,
      gpsLng: 74.7973,
      ipfsProfileHash: "bafybeihq7k3z5l9pqr47u88yxp654321abcdef0123456789",
      upiVpa: "ghulam.hassan@jkb",
      isVerified: true,
      registeredById: officer.id,
    },
  });

  console.log("   ✅ Created 3 verified beekeepers with GPS coordinates");

  // 4. Create Batch #1 (Muzaffarpur Litchi Honey)
  const batch1 = await prisma.batch.create({
    data: {
      id: 1,
      farmerId: farmer1.id,
      harvestTimestamp: new Date("2026-08-14T07:00:00Z"),
      ipfsMetadataHash: "bafybeic2h4t6l8w0x2y4z6a8b0c2d4e6f8g0h2i4j6k8l0m2n4o6p8q0r",
      qualityScore: 94,
      grade: "Grade A+ (Premium Raw Organic)",
      isAuthentic: true,
      isRevoked: false,
      isDisputed: false,
      qrToken: "TT-2026-00001",
      txHash: "0x98f4c2b1e7a6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0",
      blockNumber: 59341029,
      botanicalFlora: "Litchi chinensis (Shahi Litchi Blossom)",
    },
  });

  // Lab Test for Batch #1
  await prisma.labTest.create({
    data: {
      batchId: batch1.id,
      moisturePercent: 17.2,
      brixIndex: 81.5,
      hmfMgKg: 14.2,
      diastaseActivity: 18.5,
      electricalConductivity: 0.38,
      c13IsotopeDelta: -25.4,
      c4SugarPercent: 1.2,
      smrMarker: 0.02,
      purityScore: 94,
      grade: "Grade A+ (Premium Raw Organic)",
      engine: "Scikit-Learn Random Forest (FSSAI/NMR Calibrated)",
      passedFSSAI: true,
      testedById: labAnalyst.id,
    },
  });

  // Custody Chain for Batch #1
  await prisma.custodyLog.createMany({
    data: [
      {
        batchId: batch1.id,
        actor: "Rajesh Kumar Verma (Beekeeper)",
        entity: "Direct Producer — Muzaffarpur Apiary #04",
        action: "Harvest extracted and sealed in tamper-evident food-grade containers",
        timestamp: new Date("2026-08-14T07:00:00Z"),
      },
      {
        batchId: batch1.id,
        actor: "Dr. Ananya Ray (KVIC Field Officer)",
        entity: "KVIC Regional Center • Station #BH-002",
        action: "Physical inspection passed, Brix refractometer confirmed at 81.5%",
        timestamp: new Date("2026-08-15T10:30:00Z"),
      },
      {
        batchId: batch1.id,
        actor: "NABL Accredited Testing Facility #DEL-01",
        entity: "National Bee Board Quality Assurance Lab",
        action: "NMR Spectrometry & C13 stable isotope analysis cleared (Score: 94/100)",
        timestamp: new Date("2026-08-16T14:45:00Z"),
      },
      {
        batchId: batch1.id,
        actor: "Polygon PoS Amoy Smart Contract",
        entity: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        action: "Cryptographic Batch Token minted with IPFS CID anchor & QR hash",
        timestamp: new Date("2026-08-17T09:12:00Z"),
      },
    ],
  });

  // 5. Create Batch #2 (Sundarbans Wild Mangrove Honey)
  const batch2 = await prisma.batch.create({
    data: {
      id: 2,
      farmerId: farmer2.id,
      harvestTimestamp: new Date("2026-08-18T05:30:00Z"),
      ipfsMetadataHash: "bafybeih6m2k4p8r0t2v4x6z8b0d2f4h6j8l0n2p4r6t8v0x2z4b6d8f0h",
      qualityScore: 91,
      grade: "Grade A+ (Premium Raw Organic)",
      isAuthentic: true,
      isRevoked: false,
      isDisputed: false,
      qrToken: "TT-2026-00002",
      txHash: "0x77c1d3e5f7a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1",
      blockNumber: 59348912,
      botanicalFlora: "Rhizophora & Avicennia (Wild Mangrove Flora)",
    },
  });

  // Lab Test for Batch #2
  await prisma.labTest.create({
    data: {
      batchId: batch2.id,
      moisturePercent: 18.1,
      brixIndex: 80.2,
      hmfMgKg: 22.0,
      diastaseActivity: 12.8,
      electricalConductivity: 0.52,
      c13IsotopeDelta: -26.1,
      c4SugarPercent: 1.8,
      smrMarker: 0.03,
      purityScore: 91,
      grade: "Grade A+ (Premium Raw Organic)",
      engine: "Scikit-Learn Random Forest (FSSAI/NMR Calibrated)",
      passedFSSAI: true,
      testedById: labAnalyst.id,
    },
  });

  // Custody Chain for Batch #2
  await prisma.custodyLog.createMany({
    data: [
      {
        batchId: batch2.id,
        actor: "Lakshmi Devi (Mouli Collector)",
        entity: "Sundarbans Biosphere Reserve Cluster",
        action: "Wild tidal mangrove honey collected and filtered",
        timestamp: new Date("2026-08-18T05:30:00Z"),
      },
      {
        batchId: batch2.id,
        actor: "KVIC Coastal Mission Inspector",
        entity: "KVIC WB Center #WB-009",
        action: "Batch logged, anti-tamper QR seal serialized",
        timestamp: new Date("2026-08-19T11:00:00Z"),
      },
      {
        batchId: batch2.id,
        actor: "Polygon PoS Amoy Smart Contract",
        entity: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        action: "Batch Token minted on-chain",
        timestamp: new Date("2026-08-20T16:20:00Z"),
      },
    ],
  });

  // 6. Create Initial Complaints
  await prisma.complaint.createMany({
    data: [
      {
        id: "CMP-2026-881",
        batchId: batch2.id,
        qrToken: "TT-2026-00002",
        reportedBy: "Consumer (Kolkata Market)",
        reason: "Broken QR seal on lid and unusually thin consistency",
        status: "Under Lab Review",
        date: "2026-08-24",
      },
      {
        id: "CMP-2026-882",
        batchId: batch1.id,
        qrToken: "TT-2026-00001",
        reportedBy: "Retailer (New Delhi)",
        reason: "Routine verification inquiry",
        status: "Verified Authentic",
        date: "2026-08-25",
      },
    ],
  });

  console.log("   ✅ Created 2 batches with full custody chains, lab tests, and complaints");
  console.log("🎉 HoneyChain database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
