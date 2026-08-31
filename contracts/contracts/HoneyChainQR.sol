// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HoneyChainQR
 * @dev Dynamic Anti-Counterfeiting, Scan Counter & 2-Party Co-Signing Engine for HoneyChain / TrueTag
 * @notice SIH 2026 — Problem Statement SIH26021 | Ministry of MSME (KVIC)
 * @author Shivam Gawade (TrueTag Platform)
 */
contract HoneyChainQR is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant OFFICER_ROLE  = keccak256("OFFICER_ROLE");

    struct QRCommitment {
        bytes32 seedHash;
        uint256 batchId;
        address officer;
        uint256 committedAt;
        bool    revealed;
    }

    struct QRRecord {
        string  qrToken;
        uint256 batchId;
        uint256 createdAt;
        uint256 scanCount;
        uint256 lastScannedAt;
        bool    isFlagged;
        string  flagReason;
        bool    sealActivated;
        uint256 sealActivatedAt;
        address sealActivatedBy;
        int32   lastLatE4; // Scaled by 10,000 (e.g. 19.0760 -> 190760)
        int32   lastLngE4; // Scaled by 10,000 (e.g. 72.8777 -> 728777)
        bytes32 pinHash;   // keccak256 hash of secret under-cap/scratch PIN
        bool    isClaimed; // Permanently burned once consumer claims opening
        uint256 claimedAt;
        address claimedBy;
    }

    // Mapping: qrToken => QRRecord
    mapping(string => QRRecord) public qrRecords;
    // Mapping: qrToken => existence
    mapping(string => bool) public qrExists;
    // Mapping: batchId => QRCommitment
    mapping(uint256 => QRCommitment) public qrCommitments;

    event QRRegistered(string indexed qrToken, uint256 indexed batchId, uint256 timestamp);
    event QRRegisteredWithCommitment(string indexed qrToken, uint256 indexed batchId, address indexed officer, uint256 timestamp);
    event QRSeedCommitted(uint256 indexed batchId, bytes32 indexed seedHash, address indexed officer, uint256 timestamp);
    event QRSealActivated(string indexed qrToken, uint256 indexed batchId, address indexed officer, uint256 timestamp);
    event QRPinConfigured(string indexed qrToken, bytes32 indexed pinHash, uint256 timestamp);
    event JarClaimed(string indexed qrToken, uint256 indexed batchId, address indexed claimedBy, uint256 timestamp);
    event QRScanned(string indexed qrToken, uint256 indexed batchId, uint256 scanCount, uint256 timestamp);
    event QRScannedWithGeo(string indexed qrToken, uint256 indexed batchId, uint256 scanCount, int32 latE4, int32 lngE4, uint256 timestamp);
    event QRFlagged(string indexed qrToken, uint256 scanCount, string reason);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(OFFICER_ROLE, msg.sender);
    }

    // ─── 1. Commit-Reveal QR Registration (Solves Company Manipulation) ───────

    /**
     * @notice Step 1 of 2: Field Officer commits a cryptographic seed hash for a batch prior to QR generation
     * @param batchId Target batch ID
     * @param seedHash keccak256 hash of the officer's private secret seed
     */
    function commitQRSeed(uint256 batchId, bytes32 seedHash) external onlyRole(OFFICER_ROLE) {
        require(batchId > 0, "HoneyChainQR: Invalid batchId");
        require(seedHash != bytes32(0), "HoneyChainQR: Empty seed hash");
        require(qrCommitments[batchId].committedAt == 0 || qrCommitments[batchId].revealed, "HoneyChainQR: Active commitment already exists");

        qrCommitments[batchId] = QRCommitment({
            seedHash: seedHash,
            batchId: batchId,
            officer: msg.sender,
            committedAt: block.timestamp,
            revealed: false
        });

        emit QRSeedCommitted(batchId, seedHash, msg.sender, block.timestamp);
    }

    /**
     * @notice Step 2 of 2: Register QR with 2-Party Officer Signature and Revealed Seed
     * @param qrToken Generated QR token string
     * @param batchId Target batch ID
     * @param revealedSeed The raw bytes32 secret revealed by the officer
     * @param officerSignature ECDSA signature by authorized Field Officer over keccak256(qrToken, batchId, revealedSeed)
     */
    function registerQRWithCommitment(
        string calldata qrToken,
        uint256 batchId,
        bytes32 revealedSeed,
        bytes calldata officerSignature
    ) external onlyRole(OPERATOR_ROLE) {
        require(bytes(qrToken).length > 0, "HoneyChainQR: Token cannot be empty");
        require(!qrExists[qrToken], "HoneyChainQR: QR Token already registered");

        QRCommitment storage commitment = qrCommitments[batchId];
        require(commitment.committedAt > 0, "HoneyChainQR: No commitment found for batch");
        require(!commitment.revealed, "HoneyChainQR: Commitment already consumed");
        require(keccak256(abi.encode(revealedSeed)) == commitment.seedHash, "HoneyChainQR: Revealed seed does not match commitment");

        // Verify Officer Signature over the minted QR Token
        bytes32 messageHash = keccak256(abi.encodePacked(qrToken, batchId, revealedSeed));
        address recoveredSigner = _recoverSigner(messageHash, officerSignature);

        require(
            recoveredSigner == commitment.officer || hasRole(OFFICER_ROLE, recoveredSigner),
            "HoneyChainQR: Invalid officer signature"
        );

        commitment.revealed = true;

        qrRecords[qrToken] = QRRecord({
            qrToken: qrToken,
            batchId: batchId,
            createdAt: block.timestamp,
            scanCount: 0,
            lastScannedAt: 0,
            isFlagged: false,
            flagReason: "",
            sealActivated: false,
            sealActivatedAt: 0,
            sealActivatedBy: address(0),
            lastLatE4: 0,
            lastLngE4: 0,
            pinHash: bytes32(0),
            isClaimed: false,
            claimedAt: 0,
            claimedBy: address(0)
        });

        qrExists[qrToken] = true;
        emit QRRegisteredWithCommitment(qrToken, batchId, recoveredSigner, block.timestamp);
        emit QRRegistered(qrToken, batchId, block.timestamp);
    }

    /**
     * @notice Standard QR registration (backward compatible)
     */
    function registerQR(string calldata qrToken, uint256 batchId) external onlyRole(OPERATOR_ROLE) {
        require(bytes(qrToken).length > 0, "HoneyChainQR: Token cannot be empty");
        require(!qrExists[qrToken], "HoneyChainQR: QR Token already registered");

        qrRecords[qrToken] = QRRecord({
            qrToken: qrToken,
            batchId: batchId,
            createdAt: block.timestamp,
            scanCount: 0,
            lastScannedAt: 0,
            isFlagged: false,
            flagReason: "",
            sealActivated: false,
            sealActivatedAt: 0,
            sealActivatedBy: address(0),
            lastLatE4: 0,
            lastLngE4: 0,
            pinHash: bytes32(0),
            isClaimed: false,
            claimedAt: 0,
            claimedBy: address(0)
        });

        qrExists[qrToken] = true;
        emit QRRegistered(qrToken, batchId, block.timestamp);
    }

    // ─── 2. Tamper Seal & Under-Cap Secret PIN Lifecycle ──────────────────────

    /**
     * @notice Packaging station sets secret scratch-off/under-cap PIN hash for physical jar
     */
    function setJarPinHash(string calldata qrToken, bytes32 pinHash) external {
        require(hasRole(OFFICER_ROLE, msg.sender) || hasRole(OPERATOR_ROLE, msg.sender), "HoneyChainQR: Unauthorized");
        require(qrExists[qrToken], "HoneyChainQR: QR Token not found");
        QRRecord storage record = qrRecords[qrToken];
        require(record.pinHash == bytes32(0), "HoneyChainQR: PIN hash already set");

        record.pinHash = pinHash;
        emit QRPinConfigured(qrToken, pinHash, block.timestamp);
    }

    /**
     * @notice Field Officer or Packaging Unit activates physical holographic tamper seal
     * @param qrToken QR Token of the packaged jar
     */
    function activateSeal(string calldata qrToken) external {
        require(hasRole(OFFICER_ROLE, msg.sender) || hasRole(OPERATOR_ROLE, msg.sender), "HoneyChainQR: Unauthorized to activate seal");
        require(qrExists[qrToken], "HoneyChainQR: QR Token not found");
        QRRecord storage record = qrRecords[qrToken];
        require(!record.sealActivated, "HoneyChainQR: Seal already activated");

        record.sealActivated = true;
        record.sealActivatedAt = block.timestamp;
        record.sealActivatedBy = msg.sender;

        emit QRSealActivated(qrToken, record.batchId, msg.sender, block.timestamp);
    }

    /**
     * @notice Consumer claims & permanently burns the physical jar using the secret under-cap PIN
     * @dev Prevents middleman from refilling and reusing the same packaging, because claimed jars alert future buyers.
     */
    function claimJar(string calldata qrToken, string calldata secretPin) external returns (bool success) {
        require(qrExists[qrToken], "HoneyChainQR: QR Token not found");
        QRRecord storage record = qrRecords[qrToken];
        require(!record.isClaimed, "HoneyChainQR: Jar has already been opened and claimed");
        require(record.pinHash != bytes32(0), "HoneyChainQR: No secret PIN configured for this jar");
        require(keccak256(abi.encodePacked(secretPin)) == record.pinHash, "HoneyChainQR: Invalid secret PIN");

        record.isClaimed = true;
        record.claimedAt = block.timestamp;
        record.claimedBy = msg.sender;

        emit JarClaimed(qrToken, record.batchId, msg.sender, block.timestamp);
        return true;
    }

    // ─── 3. Consumer Verification & Geo-Velocity Anomaly Engine ───────────────

    /**
     * @notice Log consumer verification scan with geolocation & check for clone/velocity anomalies
     * @param qrToken Scanned QR token
     * @param latE4 Latitude scaled by 10,000
     * @param lngE4 Longitude scaled by 10,000
     */
    function recordScanWithGeo(
        string calldata qrToken,
        int32 latE4,
        int32 lngE4
    ) external returns (uint256 scanCount, bool isSuspicious, bool sealIntact) {
        require(qrExists[qrToken], "HoneyChainQR: QR Token not found");
        QRRecord storage record = qrRecords[qrToken];

        record.scanCount++;
        uint256 prevScannedAt = record.lastScannedAt;
        record.lastScannedAt = block.timestamp;

        // Geo-velocity teleportation check (if previous geo exists)
        if (prevScannedAt > 0 && (record.lastLatE4 != 0 || record.lastLngE4 != 0) && (latE4 != 0 || lngE4 != 0)) {
            uint256 timeDelta = block.timestamp - prevScannedAt;
            int64 dLat = int64(latE4) - int64(record.lastLatE4);
            int64 dLng = int64(lngE4) - int64(record.lastLngE4);
            int64 rawDistSq = dLat * dLat + dLng * dLng;
            uint256 distSq = uint256(uint64(rawDistSq > 0 ? rawDistSq : -rawDistSq));

            // If coordinates shifted > ~300km (approx 3.0 degrees delta => distSq > 900,000,000) in under 30 minutes (1800s)
            if (distSq > 900000000 && timeDelta < 1800 && !record.isFlagged) {
                record.isFlagged = true;
                record.flagReason = "Geo-velocity anomaly: physically impossible multi-location scans across disparate regions";
                emit QRFlagged(qrToken, record.scanCount, record.flagReason);
            }
        }

        // Clone volume anomaly check
        if (record.scanCount > 25 && !record.isFlagged) {
            record.isFlagged = true;
            record.flagReason = "Anomalous scan volume: potential physical QR clone replication";
            emit QRFlagged(qrToken, record.scanCount, record.flagReason);
        }

        if (latE4 != 0 || lngE4 != 0) {
            record.lastLatE4 = latE4;
            record.lastLngE4 = lngE4;
        }

        emit QRScannedWithGeo(qrToken, record.batchId, record.scanCount, latE4, lngE4, block.timestamp);
        emit QRScanned(qrToken, record.batchId, record.scanCount, block.timestamp);

        return (record.scanCount, record.isFlagged, record.sealActivated);
    }

    /**
     * @notice Standard consumer scan log
     */
    function recordScan(string calldata qrToken) external returns (uint256 scanCount, bool isSuspicious) {
        (uint256 count, bool suspicious,) = this.recordScanWithGeo(qrToken, 0, 0);
        return (count, suspicious);
    }

    // ─── 4. Internal Helpers ──────────────────────────────────────────────────

    function _recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
        bytes32 messageDigest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        if (signature.length != 65) return address(0);
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly ("memory-safe") {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        if (v < 27) v += 27;
        return ecrecover(messageDigest, v, r, s);
    }

    // ─── 5. View Queries ──────────────────────────────────────────────────────

    /**
     * @notice Query QR record comprehensive status
     */
    function getQRStatus(string calldata qrToken) external view returns (QRRecord memory) {
        require(qrExists[qrToken], "HoneyChainQR: QR Token not found");
        return qrRecords[qrToken];
    }
}
