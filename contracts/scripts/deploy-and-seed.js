// deploy-and-seed.js
// Deploys HoneyChain.sol to Polygon Amoy Testnet and seeds 2 demo batches.
// Usage: npx hardhat run scripts/deploy-and-seed.js --network amoy

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("═══════════════════════════════════════════════════════");
  console.log("  HoneyChain TrueTag — SIH 2026 Deployment Script");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Network  : ${network}`);
  console.log(`  Deployer : ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`  Balance  : ${hre.ethers.formatEther(balance)} POL`);

  if (balance === 0n) {
    console.error("\n❌ Wallet has 0 POL. Please fund it first:");
    console.error("   https://faucet.polygon.technology");
    console.error(`   Address: ${deployer.address}`);
    process.exit(1);
  }

  // ── 1. Deploy Contract ──────────────────────────────────────────────────
  console.log("\n📦 Deploying HoneyChain.sol...");
  const HoneyChain = await hre.ethers.getContractFactory("HoneyChain");
  const honeyChain = await HoneyChain.deploy();
  await honeyChain.waitForDeployment();

  const contractAddress = await honeyChain.getAddress();
  const deployTx = honeyChain.deploymentTransaction();

  console.log(`\n✅ Contract deployed!`);
  console.log(`   Address : ${contractAddress}`);
  console.log(`   Tx Hash : ${deployTx?.hash}`);

  const explorerBase =
    network === "amoy"
      ? "https://amoy.polygonscan.com"
      : "https://polygonscan.com";
  console.log(`   Explorer: ${explorerBase}/address/${contractAddress}`);

  // ── 2. Save deployed address ─────────────────────────────────────────────
  const outputPath = path.join(__dirname, "..", "deployed-address.json");
  const deploymentData = {
    network,
    chainId: network === "amoy" ? 80002 : 137,
    contractAddress,
    deployTxHash: deployTx?.hash,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    explorerUrl: `${explorerBase}/address/${contractAddress}`,
  };
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log(`\n💾 Deployment info saved to: deployed-address.json`);

  // ── 3. Role Setup ─────────────────────────────────────────────────────────
  console.log("\n── Role Setup ──────────────────────────────────────────");
  console.log("  Deployer auto-granted: ADMIN, FIELD_OFFICER, DISTRICT_SUPERVISOR");

  // ── 4. Seed Demo Batches ─────────────────────────────────────────────────
  console.log("\n🌱 Seeding demo batches on-chain...");

  try {
    const dummyCid1 = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"; // 46 chars
    const dummyCid2 = "QmZtmD2qt8fJpq3CLDHytnjZqW57vjDRRpdDx65UUM28Mr"; // 46 chars

    // Register demo beekeeper with deployer wallet (grants BEEKEEPER_ROLE so deployer can submitHarvest)
    const registerTx = await honeyChain.registerFarmer(
      deployer.address,
      "Rajesh K. Verma",
      "Muzaffarpur, Bihar",
      "KVIC-BIH-042",
      dummyCid1
    );
    await registerTx.wait();
    console.log("  ✅ Beekeeper registered: Rajesh K. Verma (Muzaffarpur)");

    // Submit harvest for batch 1
    const harvest1Tx = await honeyChain.submitHarvest(
      "Litchi Blossom — Muzaffarpur, Bihar", // floraSource
      250,                                   // quantityKg
      dummyCid1                             // ipfsMetadataHash (>= 44 chars)
    );
    await harvest1Tx.wait();
    console.log("  ✅ Harvest submitted: Muzaffarpur Litchi Honey (250kg)");

    // Approve & mint batch 1
    const approve1Tx = await honeyChain.approveHarvestAndMint(
      1,                                     // requestId
      dummyCid2,                             // ipfsMetadataHash (>= 44 chars)
      94,                                    // qualityScore (0-100)
      "Grade A+ (Premium Raw Organic)",      // grade
      "TT-2026-00001"                        // qrToken
    );
    await approve1Tx.wait();
    console.log("  ✅ Batch 1 approved & minted on-chain (TT-2026-00001)");

    // Add custody step
    const custodyTx = await honeyChain.addCustody(
      1,
      "KVIC Muzaffarpur Regional Testing Lab",
      "NMR Spectroscopy & C4 EA-IRMS purity verified (94/100)"
    );
    await custodyTx.wait();
    console.log("  ✅ Custody entry logged for Batch 1");

  } catch (seedErr) {
    console.warn("  ⚠️  Seeding note:", seedErr.message);
    console.warn("     The contract is deployed — you can seed manually via dashboard.");
  }

  // ── 5. Verify on Polygonscan ─────────────────────────────────────────────
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("\n🔍 Verifying source on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("  ✅ Contract source verified on Polygonscan");
    } catch (verifyErr) {
      console.warn("  ⚠️  Verification failed (may already be verified):", verifyErr.message);
    }
  } else {
    console.log("\n💡 To verify source on Polygonscan, add POLYGONSCAN_API_KEY to .env");
    console.log(`   Then run: npx hardhat verify --network amoy ${contractAddress}`);
  }

  // ── 6. Final Instructions ────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  🎉 DEPLOYMENT COMPLETE!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("\n  Next steps:");
  console.log(`  1. Add to Vercel env vars:`);
  console.log(`     NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`     NEXT_PUBLIC_CHAIN_ID=80002`);
  console.log(`     NEXT_PUBLIC_EXPLORER_URL=https://amoy.polygonscan.com`);
  console.log(`\n  2. Verify on Polygonscan (if API key not set above):`);
  console.log(`     npx hardhat verify --network amoy ${contractAddress}`);
  console.log(`\n  3. Share this URL with judges:`);
  console.log(`     ${explorerBase}/address/${contractAddress}`);
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Deployment failed:", err);
    process.exit(1);
  });
