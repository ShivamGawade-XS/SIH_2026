const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HoneyChain — Advanced Unsolved Problems Fixes Test Suite", function () {
  let honeyChain, honeyChainQR;
  let admin, fieldOfficer, supervisor, operator, beekeeper, tipper, stranger;

  const VALID_CID = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uc1";

  beforeEach(async function () {
    [admin, fieldOfficer, supervisor, operator, beekeeper, tipper, stranger] = await ethers.getSigners();

    // Deploy HoneyChain
    const HoneyChain = await ethers.getContractFactory("HoneyChain");
    honeyChain = await HoneyChain.deploy();

    // Deploy HoneyChainQR
    const HoneyChainQR = await ethers.getContractFactory("HoneyChainQR");
    honeyChainQR = await HoneyChainQR.deploy();

    // Setup HoneyChain roles
    await honeyChain.connect(admin).grantFieldOfficer(fieldOfficer.address);
    await honeyChain.connect(admin).grantDistrictSupervisor(supervisor.address);

    // Register a Beekeeper
    await honeyChain.connect(fieldOfficer).registerFarmer(
      beekeeper.address,
      "Dinesh Sharma",
      "Sundarbans Mangrove Forest, WB",
      "KVIC-WB-099",
      VALID_CID
    );

    // Setup HoneyChainQR roles
    const OFFICER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OFFICER_ROLE"));
    const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
    await honeyChainQR.connect(admin).grantRole(OFFICER_ROLE, fieldOfficer.address);
    await honeyChainQR.connect(admin).grantRole(OPERATOR_ROLE, operator.address);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PROBLEM 1 FIX: 2-PARTY COMMIT-REVEAL CO-SIGNING (No Company Manipulation)
  // ═══════════════════════════════════════════════════════════════════════════
  describe("Problem 1: 2-Party Commit-Reveal QR Registration", function () {
    const batchId = 101;
    const secretSeed = ethers.keccak256(ethers.toUtf8Bytes("KVIC_SECRET_OFFICER_SEED_2026"));
    const seedHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["bytes32"], [secretSeed]));
    const qrToken = "TT-2026-00101-SECURE";

    it("allows Field Officer to commit a secret seed hash for a batch", async function () {
      const tx = await honeyChainQR.connect(fieldOfficer).commitQRSeed(batchId, seedHash);
      const receipt = await tx.wait();
      const event = receipt.logs.find((l) => l.fragment?.name === "QRSeedCommitted");
      expect(event).to.not.be.undefined;
      expect(event.args.batchId).to.equal(batchId);
      expect(event.args.seedHash).to.equal(seedHash);
      expect(event.args.officer).to.equal(fieldOfficer.address);

      const commitment = await honeyChainQR.qrCommitments(batchId);
      expect(commitment.seedHash).to.equal(seedHash);
      expect(commitment.officer).to.equal(fieldOfficer.address);
      expect(commitment.revealed).to.equal(false);
    });

    it("blocks operator from registering QR without officer signature & seed reveal", async function () {
      await honeyChainQR.connect(fieldOfficer).commitQRSeed(batchId, seedHash);

      const fakeSig = "0x" + "00".repeat(65);
      await expect(
        honeyChainQR.connect(operator).registerQRWithCommitment(qrToken, batchId, secretSeed, fakeSig)
      ).to.be.revertedWith("HoneyChainQR: Invalid officer signature");
    });

    it("blocks registration if company reveals a wrong seed hash", async function () {
      await honeyChainQR.connect(fieldOfficer).commitQRSeed(batchId, seedHash);

      const wrongSeed = ethers.keccak256(ethers.toUtf8Bytes("WRONG_SEED"));
      const msgHash = ethers.keccak256(ethers.solidityPacked(["string", "uint256", "bytes32"], [qrToken, batchId, wrongSeed]));
      const sig = await fieldOfficer.signMessage(ethers.getBytes(msgHash));

      await expect(
        honeyChainQR.connect(operator).registerQRWithCommitment(qrToken, batchId, wrongSeed, sig)
      ).to.be.revertedWith("HoneyChainQR: Revealed seed does not match commitment");
    });

    it("successfully registers QR when valid officer signature & revealed seed match", async function () {
      // 1. Officer commits seed hash
      await honeyChainQR.connect(fieldOfficer).commitQRSeed(batchId, seedHash);

      // 2. Officer signs messageHash = keccak256(qrToken, batchId, secretSeed)
      const msgHash = ethers.keccak256(ethers.solidityPacked(["string", "uint256", "bytes32"], [qrToken, batchId, secretSeed]));
      const sig = await fieldOfficer.signMessage(ethers.getBytes(msgHash));

      // 3. Operator submits both on-chain
      const tx = await honeyChainQR.connect(operator).registerQRWithCommitment(qrToken, batchId, secretSeed, sig);
      const receipt = await tx.wait();
      const event = receipt.logs.find((l) => l.fragment?.name === "QRRegisteredWithCommitment");
      expect(event).to.not.be.undefined;
      expect(event.args.batchId).to.equal(batchId);
      expect(event.args.officer).to.equal(fieldOfficer.address);

      const qrStatus = await honeyChainQR.getQRStatus(qrToken);
      expect(qrStatus.batchId).to.equal(batchId);
      expect(qrStatus.scanCount).to.equal(0);
      expect(qrStatus.isFlagged).to.equal(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PROBLEM 2 FIX: TAMPER SEAL LIFECYCLE & GEO-VELOCITY ANOMALY DETECTION
  // ═══════════════════════════════════════════════════════════════════════════
  describe("Problem 2: Tamper Seal Lifecycle & Geo-Velocity Teleportation Engine", function () {
    const qrToken = "TT-2026-GEO-TEST-01";
    const batchId = 202;

    beforeEach(async function () {
      await honeyChainQR.connect(operator).registerQR(qrToken, batchId);
    });

    it("allows packaging officer to activate tamper seal", async function () {
      await expect(honeyChainQR.connect(fieldOfficer).activateSeal(qrToken))
        .to.emit(honeyChainQR, "QRSealActivated")
        .withArgs(qrToken, batchId, fieldOfficer.address, (await ethers.provider.getBlock("latest")).timestamp + 1);

      const status = await honeyChainQR.getQRStatus(qrToken);
      expect(status.sealActivated).to.equal(true);
      expect(status.sealActivatedAt).to.be.greaterThan(0);
    });

    it("records standard geo scan and logs coordinates", async function () {
      // Mumbai coordinates: lat 19.0760 (190760), lng 72.8777 (728777)
      await honeyChainQR.connect(stranger).recordScanWithGeo(qrToken, 190760, 728777);
      const status = await honeyChainQR.getQRStatus(qrToken);
      expect(status.scanCount).to.equal(1);
      expect(status.isFlagged).to.equal(false);
    });

    it("detects and flags physical teleportation / geo-velocity anomaly", async function () {
      // Scan 1 in Kolkata: Lat 22.5726 (225726), Lng 88.3639 (883639)
      await honeyChainQR.connect(stranger).recordScanWithGeo(qrToken, 225726, 883639);

      // Scan 2 only 5 seconds later in Delhi (> 1,300 km away): Lat 28.7041 (287041), Lng 77.1025 (771025)
      // Delta coordinate distance is massive in negligible time => Impossible
      const tx = await honeyChainQR.connect(stranger).recordScanWithGeo(qrToken, 287041, 771025);
      const receipt = await tx.wait();

      const flagEvent = receipt.logs.find((l) => l.fragment?.name === "QRFlagged");
      expect(flagEvent).to.not.be.undefined;

      const status = await honeyChainQR.getQRStatus(qrToken);
      expect(status.isFlagged).to.equal(true);
      expect(status.flagReason).to.include("Geo-velocity anomaly");
    });

    it("allows packaging station to configure under-cap PIN hash", async function () {
      const secretPin = "7492";
      const pinHash = ethers.keccak256(ethers.toUtf8Bytes(secretPin));

      await expect(honeyChainQR.connect(operator).setJarPinHash(qrToken, pinHash))
        .to.emit(honeyChainQR, "QRPinConfigured");

      const status = await honeyChainQR.getQRStatus(qrToken);
      expect(status.pinHash).to.equal(pinHash);
      expect(status.isClaimed).to.equal(false);
    });

    it("allows consumer to claim & burn jar with correct under-cap PIN", async function () {
      const secretPin = "7492";
      const pinHash = ethers.keccak256(ethers.toUtf8Bytes(secretPin));
      await honeyChainQR.connect(operator).setJarPinHash(qrToken, pinHash);

      await expect(honeyChainQR.connect(stranger).claimJar(qrToken, secretPin))
        .to.emit(honeyChainQR, "JarClaimed");

      const status = await honeyChainQR.getQRStatus(qrToken);
      expect(status.isClaimed).to.equal(true);
      expect(status.claimedBy).to.equal(stranger.address);
      expect(status.claimedAt).to.be.greaterThan(0);
    });

    it("blocks second claim attempt on an already opened & claimed jar", async function () {
      const secretPin = "7492";
      const pinHash = ethers.keccak256(ethers.toUtf8Bytes(secretPin));
      await honeyChainQR.connect(operator).setJarPinHash(qrToken, pinHash);
      await honeyChainQR.connect(stranger).claimJar(qrToken, secretPin);

      // Attempting to claim the same jar second time reverts (tamper detection)
      await expect(
        honeyChainQR.connect(stranger).claimJar(qrToken, secretPin)
      ).to.be.revertedWith("HoneyChainQR: Jar has already been opened and claimed");
    });

    it("blocks claim with incorrect secret PIN", async function () {
      const secretPin = "7492";
      const pinHash = ethers.keccak256(ethers.toUtf8Bytes(secretPin));
      await honeyChainQR.connect(operator).setJarPinHash(qrToken, pinHash);

      await expect(
        honeyChainQR.connect(stranger).claimJar(qrToken, "9999")
      ).to.be.revertedWith("HoneyChainQR: Invalid secret PIN");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. PROBLEM 3 FIX: DIRECT FARMER REMUNERATION & ON-CHAIN MICRO-TIPPING
  // ═══════════════════════════════════════════════════════════════════════════
  describe("Problem 3: Direct Farmer Remuneration (100% Payout to Beekeeper)", function () {
    it("transfers 100% of consumer tip directly to beekeeper wallet with zero fee deduction", async function () {
      const tipAmount = ethers.parseEther("0.25");
      const beekeeperInitialBal = await ethers.provider.getBalance(beekeeper.address);

      await expect(
        honeyChain.connect(tipper).tipFarmer(1, 10, { value: tipAmount })
      )
        .to.emit(honeyChain, "DirectTipForwarded")
        .withArgs(10, 1, beekeeper.address, tipper.address, tipAmount);

      const beekeeperFinalBal = await ethers.provider.getBalance(beekeeper.address);
      expect(beekeeperFinalBal - beekeeperInitialBal).to.equal(tipAmount);
    });

    it("reverts if attempting to tip an unregistered farmer", async function () {
      await expect(
        honeyChain.connect(tipper).tipFarmer(999, 10, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("HoneyChain: Farmer does not exist");
    });

    it("reverts if tip amount is 0", async function () {
      await expect(
        honeyChain.connect(tipper).tipFarmer(1, 10, { value: 0 })
      ).to.be.revertedWith("HoneyChain: Tip amount must be > 0");
    });

    it("automatically disburses proportional MSP procurement payment across multiple beekeepers", async function () {
      // Register second beekeeper
      const [, , , , , , , beekeeper2] = await ethers.getSigners();
      await honeyChain.connect(fieldOfficer).registerFarmer(
        beekeeper2.address,
        "Suneeta Devi",
        "Bankura, WB",
        "KVIC-WB-100",
        VALID_CID
      );

      // Beekeeper 1 submits 30kg harvest, minted as Batch #1
      await honeyChain.connect(beekeeper).submitHarvest("Acacia", 30, VALID_CID);
      await honeyChain.connect(fieldOfficer).approveHarvestAndMint(
        1, VALID_CID, 90, "Grade A+", "TT-BATCH-PROCURE-01"
      );

      // Field Officer adds Beekeeper 2's 70kg contribution (Total: 100kg: 30% Beekeeper 1, 70% Beekeeper 2)
      await honeyChain.connect(fieldOfficer).addFarmerContribution(1, 2, 70);

      const bal1Before = await ethers.provider.getBalance(beekeeper.address);
      const bal2Before = await ethers.provider.getBalance(beekeeper2.address);

      // Commercial Brand procures the 100kg batch for 1.0 ETH
      const procurementPayment = ethers.parseEther("1.0");
      await expect(
        honeyChain.connect(tipper).settleBatchProcurement(1, { value: procurementPayment })
      ).to.emit(honeyChain, "BatchProcurementSettled");

      const bal1After = await ethers.provider.getBalance(beekeeper.address);
      const bal2After = await ethers.provider.getBalance(beekeeper2.address);

      // Beekeeper 1 gets exactly 30% (0.3 ETH), Beekeeper 2 gets 70% (0.7 ETH)
      expect(bal1After - bal1Before).to.equal(ethers.parseEther("0.3"));
      expect(bal2After - bal2Before).to.equal(ethers.parseEther("0.7"));
    });
  });
});
