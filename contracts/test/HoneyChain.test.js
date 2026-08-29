const { expect } = require("chai");
const { ethers }  = require("hardhat");

describe("HoneyChain — 3-Role Approval Workflow", function () {
  let contract;
  let admin, fieldOfficer, supervisor, beekeeperWallet, stranger;

  // Role bytes32 constants
  const BEEKEEPER_ROLE           = ethers.keccak256(ethers.toUtf8Bytes("BEEKEEPER_ROLE"));
  const FIELD_OFFICER_ROLE       = ethers.keccak256(ethers.toUtf8Bytes("FIELD_OFFICER_ROLE"));
  const DISTRICT_SUPERVISOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("DISTRICT_SUPERVISOR_ROLE"));
  const ADMIN_ROLE               = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));

  const VALID_CID_1 = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uc1";
  const VALID_CID_2 = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uc2";
  const VALID_CID_3 = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uc3";

  beforeEach(async function () {
    [admin, fieldOfficer, supervisor, beekeeperWallet, stranger] = await ethers.getSigners();

    const HoneyChain = await ethers.getContractFactory("HoneyChain");
    contract = await HoneyChain.deploy();

    // Setup: admin grants roles
    await contract.connect(admin).grantFieldOfficer(fieldOfficer.address);
    await contract.connect(admin).grantDistrictSupervisor(supervisor.address);

    // Register the beekeeper
    await contract.connect(fieldOfficer).registerFarmer(
      beekeeperWallet.address,
      "Ramesh Kumar",
      "Sundarbans, West Bengal",
      "KVIC-WB-2024-001",
      VALID_CID_1
    );
  });

  // ─── RBAC Tests ───────────────────────────────────────────────────────────

  describe("Role-Based Access Control", function () {
    it("grants BEEKEEPER_ROLE to farmer wallet on registration", async () => {
      expect(await contract.hasRole(BEEKEEPER_ROLE, beekeeperWallet.address)).to.equal(true);
    });

    it("correctly assigns FIELD_OFFICER_ROLE", async () => {
      expect(await contract.hasRole(FIELD_OFFICER_ROLE, fieldOfficer.address)).to.equal(true);
    });

    it("correctly assigns DISTRICT_SUPERVISOR_ROLE", async () => {
      expect(await contract.hasRole(DISTRICT_SUPERVISOR_ROLE, supervisor.address)).to.equal(true);
    });

    it("blocks stranger from registering farmers", async () => {
      await expect(
        contract.connect(stranger).registerFarmer(
          stranger.address, "X", "Y", "Z", VALID_CID_1
        )
      ).to.be.reverted;
    });

    it("blocks stranger from submitting harvest", async () => {
      await expect(
        contract.connect(stranger).submitHarvest("Acacia", 50, VALID_CID_1)
      ).to.be.reverted;
    });
  });

  // ─── Step 1: Beekeeper Submits Harvest ────────────────────────────────────

  describe("Step 1 — Beekeeper: submitHarvest()", function () {
    it("allows a registered beekeeper to submit a harvest request", async () => {
      const tx = await contract.connect(beekeeperWallet).submitHarvest(
        "Mustard Blossom", 120, VALID_CID_1
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment?.name === "HarvestSubmitted");
      expect(event).to.not.be.undefined;
      expect(event.args.requestId).to.equal(1n);
      expect(event.args.quantityKg).to.equal(120n);
    });

    it("stores request in Pending state", async () => {
      await contract.connect(beekeeperWallet).submitHarvest("Acacia", 80, VALID_CID_2);
      const req = await contract.getHarvestRequest(1);
      expect(req.status).to.equal(0); // RequestStatus.Pending
      expect(req.floraSource).to.equal("Acacia");
    });

    it("blocks zero-quantity harvest submissions", async () => {
      await expect(
        contract.connect(beekeeperWallet).submitHarvest("Litchi", 0, VALID_CID_1)
      ).to.be.revertedWith("HoneyChain: Quantity must be > 0");
    });

    it("blocks unregistered callers", async () => {
      await expect(
        contract.connect(stranger).submitHarvest("Tulsi", 10, VALID_CID_1)
      ).to.be.reverted;
    });
  });

  // ─── Step 2: Field Officer Approves / Rejects ─────────────────────────────

  describe("Step 2 — Field Officer: approveHarvestAndMint()", function () {
    beforeEach(async () => {
      await contract.connect(beekeeperWallet).submitHarvest("Litchi", 200, VALID_CID_1);
    });

    it("mints a batch upon approval", async () => {
      const tx = await contract.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID_2, 87, "Grade A (Raw Organic)", "HCQR-001"
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment?.name === "BatchMinted");
      expect(event).to.not.be.undefined;
      expect(event.args.batchId).to.equal(1n);
      expect(event.args.qualityScore).to.equal(87n);
    });

    it("marks request as Approved", async () => {
      await contract.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID_2, 90, "Grade A+", "HCQR-002"
      );
      const req = await contract.getHarvestRequest(1);
      expect(req.status).to.equal(1); // RequestStatus.Approved
    });

    it("sets batch as authentic after minting", async () => {
      await contract.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID_2, 90, "Grade A+", "HCQR-003"
      );
      const batch = await contract.getBatch(1);
      expect(batch.isAuthentic).to.equal(true);
      expect(batch.isDisputed).to.equal(false);
      expect(batch.isRevoked).to.equal(false);
    });

    it("rejects duplicate QR token on second mint", async () => {
      await contract.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID_2, 80, "Grade B", "HCQR-DUPE"
      );
      // Submit another harvest
      await contract.connect(beekeeperWallet).submitHarvest("Ajwain", 50, VALID_CID_3);
      await expect(
        contract.connect(fieldOfficer).approveHarvestAndMint(
          2, VALID_CID_3, 75, "Grade B", "HCQR-DUPE"
        )
      ).to.be.revertedWith("HoneyChain: QR token already assigned");
    });

    it("prevents approving an already-approved request", async () => {
      await contract.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID_2, 80, "Grade A", "HCQR-X1"
      );
      await expect(
        contract.connect(fieldOfficer).approveHarvestAndMint(
          1, VALID_CID_3, 80, "Grade A", "HCQR-X2"
        )
      ).to.be.revertedWith("HoneyChain: Request not in pending state");
    });

    it("blocks stranger from approving", async () => {
      await expect(
        contract.connect(stranger).approveHarvestAndMint(
          1, VALID_CID_2, 80, "Grade A", "HCQR-S1"
        )
      ).to.be.reverted;
    });
  });

  describe("Step 2 — Field Officer: rejectHarvest()", function () {
    beforeEach(async () => {
      await contract.connect(beekeeperWallet).submitHarvest("Neem", 30, VALID_CID_1);
    });

    it("rejects a harvest with a reason", async () => {
      const tx = await contract.connect(fieldOfficer).rejectHarvest(
        1, "Moisture content exceeds FSSAI 20% threshold"
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(l => l.fragment?.name === "HarvestRejected");
      expect(event).to.not.be.undefined;
      expect(event.args.reason).to.include("FSSAI");
    });

    it("stores Rejected status", async () => {
      await contract.connect(fieldOfficer).rejectHarvest(1, "Failed origin verification");
      const req = await contract.getHarvestRequest(1);
      expect(req.status).to.equal(2); // RequestStatus.Rejected
    });

    it("blocks approving after rejection", async () => {
      await contract.connect(fieldOfficer).rejectHarvest(1, "Bad sample");
      await expect(
        contract.connect(fieldOfficer).approveHarvestAndMint(
          1, VALID_CID_2, 80, "Grade A", "HCQR-Y1"
        )
      ).to.be.revertedWith("HoneyChain: Request not in pending state");
    });
  });

  // ─── Step 3: District Supervisor Fraud Flag & Audit ───────────────────────

  describe("Step 3 — District Supervisor: flagFraud()", function () {
    beforeEach(async () => {
      await contract.connect(beekeeperWallet).submitHarvest("Acacia", 100, VALID_CID_1);
      await contract.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID_2, 85, "Grade A", "HCQR-AUDIT1"
      );
    });

    it("marks batch as disputed without deleting it", async () => {
      await contract.connect(supervisor).flagFraud(
        1, "C4 sugar (corn syrup) detected in NMR spectrometry"
      );
      const batch = await contract.getBatch(1);
      expect(batch.isDisputed).to.equal(true);
      expect(batch.isAuthentic).to.equal(false);
      expect(batch.isRevoked).to.equal(false); // NOT deleted
      expect(batch.disputeReason).to.include("corn syrup");
    });

    it("emits BatchDisputed event", async () => {
      await expect(
        contract.connect(supervisor).flagFraud(1, "Adulterated with rice syrup")
      )
        .to.emit(contract, "BatchDisputed")
        .withArgs(1n, "Adulterated with rice syrup", supervisor.address);
    });

    it("appends fraud flag to custody chain", async () => {
      await contract.connect(supervisor).flagFraud(1, "SMR 13C isotope anomaly");
      const chain = await contract.getCustodyChain(1);
      const lastEntry = chain[chain.length - 1];
      expect(lastEntry.action).to.include("FLAGGED AS FRAUDULENT");
      expect(lastEntry.actor).to.equal(supervisor.address);
    });

    it("blocks stranger from flagging fraud", async () => {
      await expect(
        contract.connect(stranger).flagFraud(1, "Tampered")
      ).to.be.reverted;
    });

    it("blocks Field Officer from flagging fraud", async () => {
      await expect(
        contract.connect(fieldOfficer).flagFraud(1, "Fraud")
      ).to.be.reverted;
    });
  });

  describe("Step 3 — District Supervisor: resolveDispute()", function () {
    beforeEach(async () => {
      await contract.connect(beekeeperWallet).submitHarvest("Jamun", 75, VALID_CID_1);
      await contract.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID_2, 92, "Grade A+", "HCQR-RES1"
      );
      await contract.connect(supervisor).flagFraud(1, "Suspected adulteration — pending retesting");
    });

    it("restores batch as authentic after secondary investigation clears it", async () => {
      await contract.connect(supervisor).resolveDispute(
        1, true, "Secondary NABL lab found no adulteration — batch cleared"
      );
      const batch = await contract.getBatch(1);
      expect(batch.isDisputed).to.equal(false);
      expect(batch.isAuthentic).to.equal(true);
      expect(batch.isRevoked).to.equal(false);
    });

    it("permanently revokes batch if fraud confirmed", async () => {
      await contract.connect(supervisor).resolveDispute(
        1, false, "FSSAI Kolkata lab confirmed C4 adulteration — REVOKED"
      );
      const batch = await contract.getBatch(1);
      expect(batch.isAuthentic).to.equal(false);
      expect(batch.isRevoked).to.equal(true);
    });

    it("emits DisputeResolved event", async () => {
      await expect(
        contract.connect(supervisor).resolveDispute(1, true, "Cleared by NABL lab")
      )
        .to.emit(contract, "DisputeResolved")
        .withArgs(1n, true, "Cleared by NABL lab", supervisor.address);
    });

    it("rejects resolving a non-disputed batch", async () => {
      await contract.connect(supervisor).resolveDispute(1, true, "Cleared");
      await expect(
        contract.connect(supervisor).resolveDispute(1, false, "Re-flag")
      ).to.be.revertedWith("HoneyChain: Batch is not currently disputed");
    });
  });

  // ─── Admin Revocation ─────────────────────────────────────────────────────

  describe("Admin: revokeBatch()", function () {
    beforeEach(async () => {
      await contract.connect(beekeeperWallet).submitHarvest("Tulsi", 60, VALID_CID_1);
      await contract.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID_2, 78, "Grade B", "HCQR-ADMIN1"
      );
    });

    it("revokes batch and marks it inauthentic", async () => {
      await contract.connect(admin).revokeBatch(1);
      const batch = await contract.getBatch(1);
      expect(batch.isRevoked).to.equal(true);
      expect(batch.isAuthentic).to.equal(false);
    });

    it("emits BatchRevoked event", async () => {
      await expect(contract.connect(admin).revokeBatch(1))
        .to.emit(contract, "BatchRevoked")
        .withArgs(1n, admin.address);
    });

    it("blocks Field Officer from revoking", async () => {
      await expect(contract.connect(fieldOfficer).revokeBatch(1)).to.be.reverted;
    });
  });

  // ─── QR Lookup ────────────────────────────────────────────────────────────

  describe("QR Token Lookup", function () {
    it("resolves QR token to correct batch", async () => {
      await contract.connect(beekeeperWallet).submitHarvest("Coriander", 40, VALID_CID_1);
      await contract.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID_2, 81, "Grade A", "HCQR-LOOKUP1"
      );
      const batch = await contract.getBatchByQR("HCQR-LOOKUP1");
      expect(batch.batchId).to.equal(1n);
      expect(batch.qualityScore).to.equal(81n);
    });
  });

  // ─── Custody Chain ────────────────────────────────────────────────────────

  describe("Custody Chain Logging", function () {
    it("logs full custody journey", async () => {
      await contract.connect(beekeeperWallet).submitHarvest("Sunflower", 90, VALID_CID_1);
      await contract.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID_2, 89, "Grade A+", "HCQR-CUST1"
      );
      await contract.connect(fieldOfficer).addCustody(1, "KVIC Processing Unit #7, Patna", "Received & Graded");
      await contract.connect(fieldOfficer).addCustody(1, "Pasteurization Facility, Jaipur", "Pasteurized at 40°C");

      const chain = await contract.getCustodyChain(1);
      expect(chain.length).to.equal(3); // 1 auto + 2 manual
      expect(chain[1].entity).to.include("Patna");
      expect(chain[2].entity).to.include("Jaipur");
    });
  });
});
