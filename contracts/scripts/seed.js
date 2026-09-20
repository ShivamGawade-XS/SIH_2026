const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("══════════════════════════════════════════════════════════");
  console.log("  HoneyChain TrueTag — On-Chain Seed Script (Amoy / Demo)");
  console.log("══════════════════════════════════════════════════════════");
  console.log(`  Network : ${network}`);
  console.log(`  Signer  : ${signer.address}`);

  // Retrieve contract address
  let contractAddress = process.env.CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!contractAddress) {
    const deployedJsonPath = path.join(__dirname, "..", "deployed-address.json");
    if (fs.existsSync(deployedJsonPath)) {
      const data = JSON.parse(fs.readFileSync(deployedJsonPath, "utf-8"));
      contractAddress = data.contractAddress;
    }
  }

  if (!contractAddress || !hre.ethers.isAddress(contractAddress)) {
    console.error("\n❌ Contract address not found. Please set CONTRACT_ADDRESS in .env or run deploy script first.");
    process.exit(1);
  }

  console.log(`  Target Contract : ${contractAddress}`);

  const HoneyChain = await hre.ethers.getContractFactory("HoneyChain");
  const honeyChain = HoneyChain.attach(contractAddress);

  // Standard 46-character sample IPFS CIDs
  const CID_FARMER_1 = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
  const CID_FARMER_2 = "bafybeihdwdcefgh4dqkjv67ui9p1qwe87yu123456789abcdef";
  const CID_BATCH_1  = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
  const CID_BATCH_2  = "QmZtmD2qt8fJpq3CLDHytnjZqW57vjDRRpdDx65UUM28Mr";

  console.log("\n🌾 1. Registering Demo Beekeepers...");

  // Register Farmer 1
  try {
    const totalFarmers = await honeyChain.totalFarmers();
    if (totalFarmers < 1n) {
      const tx1 = await honeyChain.registerFarmer(
        signer.address,
        "Rajesh Kumar Verma",
        "Muzaffarpur, Bihar",
        "KVIC-BH-002",
        CID_FARMER_1
      );
      await tx1.wait();
      console.log("  ✅ Farmer #1 Registered: Rajesh Kumar Verma (Muzaffarpur)");
    } else {
      console.log("  ℹ️  Farmer #1 already registered.");
    }
  } catch (err) {
    console.warn("  ⚠️  Farmer #1 note:", err.message);
  }

  // Register Farmer 2
  try {
    const totalFarmers = await honeyChain.totalFarmers();
    if (totalFarmers < 2n) {
      // Use a distinct deterministic derived address if same signer
      const farmer2Wallet = hre.ethers.Wallet.createRandom().address;
      const tx2 = await honeyChain.registerFarmer(
        farmer2Wallet,
        "Lakshmi Devi & Sundarbans Cooperative",
        "Sundarbans Biosphere Reserve, West Bengal",
        "KVIC-WB-019",
        CID_FARMER_2
      );
      await tx2.wait();
      console.log("  ✅ Farmer #2 Registered: Lakshmi Devi & Sundarbans Cooperative");
    } else {
      console.log("  ℹ️  Farmer #2 already registered.");
    }
  } catch (err) {
    console.warn("  ⚠️  Farmer #2 note:", err.message);
  }

  console.log("\n🍯 2. Minting Demo Batches...");

  // Mint Batch 1
  try {
    const b1Exists = await honeyChain.getBatch(1).then(() => true).catch(() => false);
    if (!b1Exists) {
      const txBatch1 = await honeyChain.mintBatch(
        1,
        1,
        250,
        CID_BATCH_1,
        94,
        "Grade A+ Premium Raw Organic",
        "TT-2026-00001"
      );
      await txBatch1.wait();
      console.log("  ✅ Batch #1 Minted on-chain: 250kg Muzaffarpur Litchi Honey (TT-2026-00001)");

      // Add custody logs
      await (await honeyChain.addCustody(1, "Patna Regional Testing Lab", "Passed NMR Spectroscopy & C4 EA-IRMS purity (94/100)")).wait();
      console.log("     Logged Custody Step for Batch #1");
    } else {
      console.log("  ℹ️  Batch #1 already exists on-chain.");
    }
  } catch (err) {
    console.warn("  ⚠️  Batch #1 note:", err.message);
  }

  // Mint Batch 2
  try {
    const b2Exists = await honeyChain.getBatch(2).then(() => true).catch(() => false);
    if (!b2Exists) {
      const txBatch2 = await honeyChain.mintBatch(
        2,
        2,
        180,
        CID_BATCH_2,
        91,
        "Grade A Wild Mangrove Honey",
        "TT-2026-00002"
      );
      await txBatch2.wait();
      console.log("  ✅ Batch #2 Minted on-chain: 180kg Sundarbans Wild Honey (TT-2026-00002)");

      // Add custody logs
      await (await honeyChain.addCustody(2, "KVIC Kolkata Processing Hub", "Filtered, Bottled & Cryptographic Seal Activated")).wait();
      console.log("     Logged Custody Step for Batch #2");
    } else {
      console.log("  ℹ️  Batch #2 already exists on-chain.");
    }
  } catch (err) {
    console.warn("  ⚠️  Batch #2 note:", err.message);
  }

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  🎉 SEEDING COMPLETE! Test Links for Verification:");
  console.log("══════════════════════════════════════════════════════════");
  console.log("  Batch #1: http://localhost:3000/verify/1 (or ?qr=TT-2026-00001)");
  console.log("  Batch #2: http://localhost:3000/verify/2 (or ?qr=TT-2026-00002)");
  console.log("══════════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Seeding failed:", err);
    process.exit(1);
  });
