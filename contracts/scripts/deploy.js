const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("══════════════════════════════════════════════════════════");
  console.log("  HoneyChain TrueTag — SIH 2026 Contract Deployment");
  console.log("══════════════════════════════════════════════════════════");
  console.log(`  Network  : ${network}`);
  console.log(`  Deployer : ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`  Balance  : ${hre.ethers.formatEther(balance)} POL`);

  if (balance === 0n && network !== "hardhat" && network !== "localhost") {
    console.error("\n❌ Wallet has 0 POL on Polygon Amoy. Please fund it first:");
    console.error("   https://faucet.polygon.technology");
    console.error(`   Address: ${deployer.address}`);
    process.exit(1);
  }

  // 1. Deploy Contract
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

  // 2. Grant FIELD_OFFICER_ROLE if specified in env
  const officerWallet = process.env.FIELD_OFFICER_ADDRESS || process.env.FIELD_OFFICER_WALLET;
  if (officerWallet && hre.ethers.isAddress(officerWallet)) {
    console.log(`\n👮 Granting FIELD_OFFICER_ROLE to: ${officerWallet}`);
    const tx = await honeyChain.grantFieldOfficer(officerWallet);
    await tx.wait();
    console.log(`   ✅ FIELD_OFFICER_ROLE granted!`);
  } else {
    console.log(`\nℹ️  Deployer (${deployer.address}) auto-granted DEFAULT_ADMIN, FIELD_OFFICER, and DISTRICT_SUPERVISOR roles.`);
  }

  // 3. Save deployment record
  const outputPath = path.join(__dirname, "..", "deployed-address.json");
  const deploymentData = {
    network,
    chainId: network === "amoy" ? 80002 : (network === "localhost" ? 1337 : 137),
    contractAddress,
    deployTxHash: deployTx?.hash || "",
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    explorerUrl: `${explorerBase}/address/${contractAddress}`,
  };
  fs.writeFileSync(outputPath, JSON.stringify(deploymentData, null, 2));
  console.log(`\n💾 Saved deployment details to: contracts/deployed-address.json`);

  // 4. Instructions for Vercel and Frontend
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  📋 NEXT STEPS: Configure Frontend & Vercel");
  console.log("══════════════════════════════════════════════════════════");
  console.log("  Set these Environment Variables in frontend/.env & Vercel:");
  console.log(`  NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`  NEXT_PUBLIC_CHAIN_ID=80002`);
  console.log(`  NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology`);
  console.log(`  NEXT_PUBLIC_EXPLORER_URL=https://amoy.polygonscan.com`);
  console.log("══════════════════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Deployment failed:", err);
    process.exit(1);
  });
