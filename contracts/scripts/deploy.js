const hre = require("hardhat");

async function main() {
  console.log("Deploying HoneyChain smart contract to Polygon PoS...");

  const HoneyChain = await hre.ethers.getContractFactory("HoneyChain");
  const honeyChain = await HoneyChain.deploy();

  await honeyChain.waitForDeployment();

  const contractAddress = await honeyChain.getAddress();
  console.log(`✅ HoneyChain deployed successfully to: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
