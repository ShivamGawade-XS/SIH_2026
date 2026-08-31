const { expect } = require("chai");
const { ethers }  = require("hardhat");

/**
 * HoneyChain Multi-Farmer Pooled Batch Tests
 * Verifies the addFarmerContribution() and getBatchContributors() functions
 * introduced in the Fix 3 — Multi-Farmer Batch Schema change.
 */
describe("HoneyChain — Multi-Farmer Pooled Batch (Fix 3)", function () {
  let contract;
  let admin, fieldOfficer, supervisor;
  let beekeeper1, beekeeper2, beekeeper3;

  const VALID_CID_1 = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uc1";
  const VALID_CID_2 = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uc2";
  const VALID_CID_3 = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uc3";

  beforeEach(async function () {
    [admin, fieldOfficer, supervisor, beekeeper1, beekeeper2, beekeeper3] = await ethers.getSigners();

    const HoneyChain = await ethers.getContractFactory("HoneyChain");
    contract = await HoneyChain.deploy();

    await contract.connect(admin).grantFieldOfficer(fieldOfficer.address);
    await contract.connect(admin).grantDistrictSupervisor(supervisor.address);

    // Register three beekeepers
    await contract.connect(fieldOfficer).registerFarmer(beekeeper1.address, "Raju Singh",  "Sundarbans, WB",   "KVIC-WB-001", VALID_CID_1);
    await contract.connect(fieldOfficer).registerFarmer(beekeeper2.address, "Meena Devi",  "Bankura, WB",      "KVIC-WB-002", VALID_CID_2);
    await contract.connect(fieldOfficer).registerFarmer(beekeeper3.address, "Govind Ram",  "Purulia, WB",      "KVIC-WB-003", VALID_CID_3);

    // Beekeeper 1 submits the primary harvest for the batch
    await contract.connect(beekeeper1).submitHarvest("Forest Acacia", 20, VALID_CID_1);

    // Field Officer approves and mints the batch (initialised with beekeeper1's contribution)
    await contract.connect(fieldOfficer).approveHarvestAndMint(
      1, VALID_CID_2, 88, "Grade A (Raw Organic)", "POOL-QR-001"
    );
  });

  // ─── Initial State after Mint ──────────────────────────────────────────────

  describe("Initial batch state after mint", function () {
    it("initialises farmerIds[] with the primary farmer", async function () {
      const [farmerIds, contributions, totalKg] = await contract.getBatchContributors(1);
      expect(farmerIds.length).to.equal(1);
      expect(farmerIds[0]).to.equal(1n); // farmerId 1 = Raju Singh
    });

    it("initialises contributionKg[] with the harvest quantityKg", async function () {
      const [, contributions,] = await contract.getBatchContributors(1);
      expect(contributions[0]).to.equal(20n);
    });

    it("initialises totalKg with the harvest quantityKg", async function () {
      const [,, totalKg] = await contract.getBatchContributors(1);
      expect(totalKg).to.equal(20n);
    });

    it("getBatch() returns the batch with empty farmerIds replaced by array", async function () {
      const batch = await contract.getBatch(1);
      // farmerIds is returned as array (not a single uint256)
      expect(Array.isArray(batch.farmerIds)).to.equal(true);
      expect(batch.farmerIds.length).to.be.greaterThan(0);
    });
  });

  // ─── addFarmerContribution() ───────────────────────────────────────────────

  describe("addFarmerContribution()", function () {
    it("allows Field Officer to add a second farmer's contribution", async function () {
      await contract.connect(fieldOfficer).addFarmerContribution(1, 2, 18); // farmerId 2 = Meena Devi, 18kg
      const [farmerIds, contributions, totalKg] = await contract.getBatchContributors(1);
      expect(farmerIds.length).to.equal(2);
      expect(farmerIds[1]).to.equal(2n);
      expect(contributions[1]).to.equal(18n);
      expect(totalKg).to.equal(38n); // 20 + 18
    });

    it("allows adding a third farmer and accumulates totalKg correctly", async function () {
      await contract.connect(fieldOfficer).addFarmerContribution(1, 2, 18);
      await contract.connect(fieldOfficer).addFarmerContribution(1, 3, 12); // farmerId 3 = Govind Ram, 12kg
      const [farmerIds, contributions, totalKg] = await contract.getBatchContributors(1);
      expect(farmerIds.length).to.equal(3);
      expect(totalKg).to.equal(50n); // 20 + 18 + 12
    });

    it("emits FarmerContributionAdded event with correct args", async function () {
      await expect(
        contract.connect(fieldOfficer).addFarmerContribution(1, 2, 18)
      )
        .to.emit(contract, "FarmerContributionAdded")
        .withArgs(1n, 2n, 18n, fieldOfficer.address);
    });

    it("blocks adding contribution to a non-existent batch", async function () {
      await expect(
        contract.connect(fieldOfficer).addFarmerContribution(999, 2, 18)
      ).to.be.revertedWith("HoneyChain: Batch does not exist");
    });

    it("blocks adding contribution for an unregistered farmer", async function () {
      await expect(
        contract.connect(fieldOfficer).addFarmerContribution(1, 999, 18)
      ).to.be.revertedWith("HoneyChain: Farmer not registered");
    });

    it("blocks zero-kg contribution", async function () {
      await expect(
        contract.connect(fieldOfficer).addFarmerContribution(1, 2, 0)
      ).to.be.revertedWith("HoneyChain: Contribution must be > 0");
    });

    it("blocks a non-officer from adding contributions", async function () {
      await expect(
        contract.connect(beekeeper2).addFarmerContribution(1, 2, 18)
      ).to.be.reverted;
    });

    it("blocks adding contribution to a revoked batch", async function () {
      await contract.connect(admin).revokeBatch(1);
      await expect(
        contract.connect(fieldOfficer).addFarmerContribution(1, 2, 18)
      ).to.be.revertedWith("HoneyChain: Batch is revoked");
    });
  });

  // ─── getBatchContributors() ────────────────────────────────────────────────

  describe("getBatchContributors()", function () {
    it("returns consistent farmerIds and contributionKg arrays (same length)", async function () {
      await contract.connect(fieldOfficer).addFarmerContribution(1, 2, 18);
      await contract.connect(fieldOfficer).addFarmerContribution(1, 3, 12);
      const [farmerIds, contributions, totalKg] = await contract.getBatchContributors(1);
      expect(farmerIds.length).to.equal(contributions.length);
    });

    it("totalKg equals sum of all contributionKg entries", async function () {
      await contract.connect(fieldOfficer).addFarmerContribution(1, 2, 18);
      await contract.connect(fieldOfficer).addFarmerContribution(1, 3, 12);
      const [, contributions, totalKg] = await contract.getBatchContributors(1);
      const sum = contributions.reduce((a, b) => a + b, 0n);
      expect(sum).to.equal(totalKg);
    });

    it("reverts for non-existent batchId", async function () {
      await expect(
        contract.getBatchContributors(888)
      ).to.be.revertedWith("HoneyChain: Batch does not exist");
    });
  });
});
