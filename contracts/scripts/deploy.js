const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying HoneyChain with 3-role workflow...");
  console.log("Deployer address:", deployer.address);

  const HoneyChain = await hre.ethers.getContractFactory("HoneyChain");
  const honeyChain  = await HoneyChain.deploy();
  await honeyChain.waitForDeployment();

  const addr = await honeyChain.getAddress();
  console.log("✅ HoneyChain deployed to:", addr);
  console.log("\n── Role Setup ──────────────────────────────────────────");
  console.log("  Deployer auto-granted: ADMIN, FIELD_OFFICER, DISTRICT_SUPERVISOR");
  console.log("  Use grantFieldOfficer(addr)      to add KVIC Field Officers");
  console.log("  Use grantDistrictSupervisor(addr) to add District Supervisors");
  console.log("  Beekeepers receive BEEKEEPER_ROLE automatically on registerFarmer()");
  console.log("\n── 3-Role Workflow ────────────────────────────────────");
  console.log("  1. BeeKeeper    → submitHarvest()");
  console.log("  2. FieldOfficer → approveHarvestAndMint() OR rejectHarvest()");
  console.log("  3. Supervisor   → flagFraud() / resolveDispute() / auditBatch()");
  console.log("     Admin        → revokeBatch() (emergency only)");
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
