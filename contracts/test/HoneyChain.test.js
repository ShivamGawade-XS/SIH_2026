const { expect } = require("chai");
const { ethers }  = require("hardhat");

/**
 * HoneyChain.sol — Full Test Suite
 * Tests: RBAC roles, farmer registration, batch minting, custody chain, QR verify, revocation
 */
describe("HoneyChain", function () {
  let honeyChain;
  let admin, fieldOfficer, labAnalyst, consumer, unauthorized;

  // Role hashes
  let ADMIN_ROLE, FIELD_OFFICER_ROLE, LAB_ANALYST_ROLE;

  // Shared test data
  const farmerData = {
    name:            "Rajesh Kumar Verma",
    location:        "Muzaffarpur, Bihar",
    cooperativeId:   "KVIC-BH-002",
    ipfsProfileHash: "QmFarmerProfileHash123"
  };
  const batchData = {
    ipfsMetadataHash: "QmBatchMetadataHash456",
    qualityScore:     88,
    grade:            "Grade A+ Premium Raw Organic",
    qrToken:          "TT-2026-00001"
  };

  beforeEach(async function () {
    [admin, fieldOfficer, labAnalyst, consumer, unauthorized] = await ethers.getSigners();

    const HoneyChain = await ethers.getContractFactory("HoneyChain");
    honeyChain = await HoneyChain.deploy();
    await honeyChain.waitForDeployment();

    ADMIN_ROLE         = await honeyChain.ADMIN_ROLE();
    FIELD_OFFICER_ROLE = await honeyChain.FIELD_OFFICER_ROLE();
    LAB_ANALYST_ROLE   = await honeyChain.LAB_ANALYST_ROLE();

    // Grant roles
    await honeyChain.connect(admin).grantFieldOfficer(fieldOfficer.address);
    await honeyChain.connect(admin).grantLabAnalyst(labAnalyst.address);
  });

  // ─── Deployment & RBAC ─────────────────────────────────────────────────────
  describe("Deployment & RBAC", function () {
    it("should grant deployer admin and field officer roles", async function () {
      expect(await honeyChain.hasRole(ADMIN_ROLE,         admin.address)).to.be.true;
      expect(await honeyChain.hasRole(FIELD_OFFICER_ROLE, admin.address)).to.be.true;
    });

    it("should grant fieldOfficer the FIELD_OFFICER_ROLE", async function () {
      expect(await honeyChain.hasRole(FIELD_OFFICER_ROLE, fieldOfficer.address)).to.be.true;
    });

    it("should grant labAnalyst the LAB_ANALYST_ROLE", async function () {
      expect(await honeyChain.hasRole(LAB_ANALYST_ROLE, labAnalyst.address)).to.be.true;
    });

    it("should start with 0 farmers and 0 batches", async function () {
      expect(await honeyChain.totalFarmers()).to.equal(0);
      expect(await honeyChain.totalBatches()).to.equal(0);
    });

    it("should revert when unauthorized tries to grant Field Officer role", async function () {
      await expect(
        honeyChain.connect(unauthorized).grantFieldOfficer(consumer.address)
      ).to.be.reverted;
    });
  });

  // ─── Farmer Registration ────────────────────────────────────────────────────
  describe("Farmer Registration", function () {
    it("should allow field officer to register a farmer", async function () {
      const tx = await honeyChain.connect(fieldOfficer).registerFarmer(
        farmerData.name, farmerData.location, farmerData.cooperativeId, farmerData.ipfsProfileHash
      );

      await expect(tx)
        .to.emit(honeyChain, "FarmerRegistered")
        .withArgs(1, farmerData.name, farmerData.location, fieldOfficer.address);

      const farmer = await honeyChain.farmers(1);
      expect(farmer.name).to.equal(farmerData.name);
      expect(farmer.location).to.equal(farmerData.location);
      expect(farmer.cooperativeId).to.equal(farmerData.cooperativeId);
      expect(farmer.isVerified).to.be.true;
      expect(farmer.farmerId).to.equal(1);
    });

    it("should increment farmer counter correctly", async function () {
      await honeyChain.connect(fieldOfficer).registerFarmer(
        farmerData.name, farmerData.location, farmerData.cooperativeId, farmerData.ipfsProfileHash
      );
      await honeyChain.connect(fieldOfficer).registerFarmer(
        "Priya Sharma", "Aurangabad, Maharashtra", "KVIC-MH-009", "QmFarmer2"
      );
      expect(await honeyChain.totalFarmers()).to.equal(2);
    });

    it("should revert when unauthorized user tries to register farmer", async function () {
      await expect(
        honeyChain.connect(unauthorized).registerFarmer(
          farmerData.name, farmerData.location, farmerData.cooperativeId, farmerData.ipfsProfileHash
        )
      ).to.be.reverted;
    });
  });

  // ─── Batch Minting ──────────────────────────────────────────────────────────
  describe("Batch Minting", function () {
    let farmerId;

    beforeEach(async function () {
      const tx = await honeyChain.connect(fieldOfficer).registerFarmer(
        farmerData.name, farmerData.location, farmerData.cooperativeId, farmerData.ipfsProfileHash
      );
      const receipt = await tx.wait();
      farmerId = 1;
    });

    it("should allow field officer to mint a batch", async function () {
      const tx = await honeyChain.connect(fieldOfficer).mintBatch(
        farmerId, batchData.ipfsMetadataHash, batchData.qualityScore, batchData.grade, batchData.qrToken
      );

      await expect(tx)
        .to.emit(honeyChain, "BatchMinted")
        .withArgs(1, farmerId, batchData.ipfsMetadataHash, batchData.qualityScore, batchData.grade, fieldOfficer.address);

      const batch = await honeyChain.batches(1);
      expect(batch.farmerId).to.equal(farmerId);
      expect(batch.qualityScore).to.equal(batchData.qualityScore);
      expect(batch.grade).to.equal(batchData.grade);
      expect(batch.isAuthentic).to.be.true;
      expect(batch.isRevoked).to.be.false;
    });

    it("should link QR token to batch", async function () {
      await honeyChain.connect(fieldOfficer).mintBatch(
        farmerId, batchData.ipfsMetadataHash, batchData.qualityScore, batchData.grade, batchData.qrToken
      );
      expect(await honeyChain.qrToBatch(batchData.qrToken)).to.equal(1);
    });

    it("should auto-log initial custody entry on mint", async function () {
      await honeyChain.connect(fieldOfficer).mintBatch(
        farmerId, batchData.ipfsMetadataHash, batchData.qualityScore, batchData.grade, batchData.qrToken
      );
      const chain = await honeyChain.getCustodyChain(1);
      expect(chain.length).to.equal(1);
      expect(chain[0].action).to.equal("Harvested & Minted on HoneyChain");
    });

    it("should revert when QR token is already used", async function () {
      await honeyChain.connect(fieldOfficer).mintBatch(
        farmerId, batchData.ipfsMetadataHash, batchData.qualityScore, batchData.grade, batchData.qrToken
      );
      await expect(
        honeyChain.connect(fieldOfficer).mintBatch(
          farmerId, "QmOther", 75, "Grade B", batchData.qrToken  // same QR token
        )
      ).to.be.revertedWith("HoneyChain: QR token already used");
    });

    it("should revert when quality score > 100", async function () {
      await expect(
        honeyChain.connect(fieldOfficer).mintBatch(farmerId, "QmX", 101, "Invalid", "TT-999")
      ).to.be.revertedWith("HoneyChain: Score must be 0-100");
    });

    it("should revert minting for non-existent farmer", async function () {
      await expect(
        honeyChain.connect(fieldOfficer).mintBatch(999, "QmX", 80, "Grade A", "TT-888")
      ).to.be.revertedWith("HoneyChain: Farmer not registered");
    });
  });

  // ─── Custody Chain ──────────────────────────────────────────────────────────
  describe("Custody Chain", function () {
    beforeEach(async function () {
      await honeyChain.connect(fieldOfficer).registerFarmer(
        farmerData.name, farmerData.location, farmerData.cooperativeId, farmerData.ipfsProfileHash
      );
      await honeyChain.connect(fieldOfficer).mintBatch(
        1, batchData.ipfsMetadataHash, batchData.qualityScore, batchData.grade, batchData.qrToken
      );
    });

    it("should log additional custody entries correctly", async function () {
      await honeyChain.connect(fieldOfficer).addCustody(1, "KVIC Processing Unit #4, Jaipur", "Received");
      await honeyChain.connect(fieldOfficer).addCustody(1, "FSSAI National Quality Lab", "Certified");

      const chain = await honeyChain.getCustodyChain(1);
      expect(chain.length).to.equal(3); // 1 auto + 2 added
      expect(chain[1].entity).to.equal("KVIC Processing Unit #4, Jaipur");
      expect(chain[2].entity).to.equal("FSSAI National Quality Lab");
    });

    it("should emit CustodyLogged event", async function () {
      await expect(
        honeyChain.connect(fieldOfficer).addCustody(1, "Warehouse A", "Stored")
      ).to.emit(honeyChain, "CustodyLogged").withArgs(1, "Warehouse A", "Stored", fieldOfficer.address);
    });

    it("should return correct custody count", async function () {
      await honeyChain.connect(fieldOfficer).addCustody(1, "Unit 1", "Processed");
      expect(await honeyChain.getCustodyCount(1)).to.equal(2);
    });
  });

  // ─── QR Verification ───────────────────────────────────────────────────────
  describe("QR Verification (Consumer Scan)", function () {
    beforeEach(async function () {
      await honeyChain.connect(fieldOfficer).registerFarmer(
        farmerData.name, farmerData.location, farmerData.cooperativeId, farmerData.ipfsProfileHash
      );
      await honeyChain.connect(fieldOfficer).mintBatch(
        1, batchData.ipfsMetadataHash, batchData.qualityScore, batchData.grade, batchData.qrToken
      );
    });

    it("should return batch and farmer data from QR token", async function () {
      const [batch, farmer] = await honeyChain.verifyByQR(batchData.qrToken);
      expect(batch.qualityScore).to.equal(batchData.qualityScore);
      expect(batch.grade).to.equal(batchData.grade);
      expect(farmer.name).to.equal(farmerData.name);
      expect(farmer.location).to.equal(farmerData.location);
    });

    it("should revert on invalid QR token", async function () {
      await expect(honeyChain.verifyByQR("INVALID-QR")).to.be.revertedWith("HoneyChain: Invalid QR token");
    });

    it("should revert on revoked batch QR", async function () {
      await honeyChain.connect(admin).revokeBatch(1);
      await expect(honeyChain.verifyByQR(batchData.qrToken)).to.be.revertedWith("HoneyChain: Product has been recalled");
    });
  });

  // ─── Quality Score Update ───────────────────────────────────────────────────
  describe("Quality Score Update (Lab Analyst)", function () {
    beforeEach(async function () {
      await honeyChain.connect(fieldOfficer).registerFarmer(
        farmerData.name, farmerData.location, farmerData.cooperativeId, farmerData.ipfsProfileHash
      );
      await honeyChain.connect(fieldOfficer).mintBatch(
        1, batchData.ipfsMetadataHash, batchData.qualityScore, batchData.grade, batchData.qrToken
      );
    });

    it("should allow lab analyst to update quality score", async function () {
      await expect(
        honeyChain.connect(labAnalyst).updateQualityScore(1, 95, "Grade S Premium Verified")
      ).to.emit(honeyChain, "QualityScoreUpdated")
        .withArgs(1, 88, 95, "Grade S Premium Verified", labAnalyst.address);

      const batch = await honeyChain.batches(1);
      expect(batch.qualityScore).to.equal(95);
      expect(batch.grade).to.equal("Grade S Premium Verified");
    });

    it("should revert when field officer tries to update quality score", async function () {
      await expect(
        honeyChain.connect(fieldOfficer).updateQualityScore(1, 70, "Grade B")
      ).to.be.reverted;
    });
  });

  // ─── Admin Revocation ──────────────────────────────────────────────────────
  describe("Admin Batch Revocation", function () {
    beforeEach(async function () {
      await honeyChain.connect(fieldOfficer).registerFarmer(
        farmerData.name, farmerData.location, farmerData.cooperativeId, farmerData.ipfsProfileHash
      );
      await honeyChain.connect(fieldOfficer).mintBatch(
        1, batchData.ipfsMetadataHash, batchData.qualityScore, batchData.grade, batchData.qrToken
      );
    });

    it("should allow admin to revoke a batch", async function () {
      await expect(honeyChain.connect(admin).revokeBatch(1))
        .to.emit(honeyChain, "BatchRevoked").withArgs(1, admin.address);

      const batch = await honeyChain.batches(1);
      expect(batch.isRevoked).to.be.true;
    });

    it("should prevent custody logging on revoked batch", async function () {
      await honeyChain.connect(admin).revokeBatch(1);
      await expect(
        honeyChain.connect(fieldOfficer).addCustody(1, "Distributor", "Shipped")
      ).to.be.revertedWith("HoneyChain: Batch has been revoked");
    });

    it("should revert when unauthorized tries to revoke", async function () {
      await expect(honeyChain.connect(consumer).revokeBatch(1)).to.be.reverted;
    });
  });
});
