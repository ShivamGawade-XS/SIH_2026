const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HoneyChainQR — Anti-Counterfeiting & Clone Detection", function () {
  let qrContract;
  let admin, operator, consumer, stranger;

  const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));

  beforeEach(async function () {
    [admin, operator, consumer, stranger] = await ethers.getSigners();

    const HoneyChainQR = await ethers.getContractFactory("HoneyChainQR");
    qrContract = await HoneyChainQR.deploy();

    await qrContract.grantRole(OPERATOR_ROLE, operator.address);
  });

  describe("Role-Based Access Control", function () {
    it("assigns DEFAULT_ADMIN_ROLE and OPERATOR_ROLE to deployer", async () => {
      expect(await qrContract.hasRole(OPERATOR_ROLE, admin.address)).to.equal(true);
    });

    it("allows operator to register QR codes", async () => {
      await expect(qrContract.connect(operator).registerQR("TT-2026-00001", 1))
        .to.emit(qrContract, "QRRegistered")
        .withArgs("TT-2026-00001", 1n, (val) => val > 0n);
    });

    it("blocks non-operators from registering QR codes", async () => {
      await expect(
        qrContract.connect(stranger).registerQR("TT-2026-00002", 2)
      ).to.be.reverted;
    });
  });

  describe("Scan Tracking & Anti-Counterfeit Flagging", function () {
    beforeEach(async function () {
      await qrContract.connect(operator).registerQR("TT-2026-00001", 1);
    });

    it("records consumer scan count incrementally", async () => {
      await qrContract.connect(consumer).recordScan("TT-2026-00001");
      await qrContract.connect(consumer).recordScan("TT-2026-00001");

      const status = await qrContract.getQRStatus("TT-2026-00001");
      expect(status.batchId).to.equal(1n);
      expect(status.scanCount).to.equal(2n);
      expect(status.isFlagged).to.equal(false);
    });

    it("flags QR as suspicious clone when scan count exceeds threshold (>25)", async () => {
      for (let i = 0; i < 25; i++) {
        await qrContract.connect(consumer).recordScan("TT-2026-00001");
      }

      // 26th scan triggers anomaly flag
      await expect(qrContract.connect(consumer).recordScan("TT-2026-00001"))
        .to.emit(qrContract, "QRFlagged");

      const status = await qrContract.getQRStatus("TT-2026-00001");
      expect(status.scanCount).to.equal(26n);
      expect(status.isFlagged).to.equal(true);
      expect(status.flagReason).to.include("physical QR clone");
    });

    it("rejects recording scan for unregistered QR token", async () => {
      await expect(
        qrContract.connect(consumer).recordScan("UNKNOWN-TOKEN-999")
      ).to.be.revertedWith("HoneyChainQR: QR Token not found");
    });
  });
});
