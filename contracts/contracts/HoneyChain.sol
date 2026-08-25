// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HoneyChain
 * @dev Blockchain-based honey traceability & authentication for KVIC / National Bee Board
 * @notice SIH 2026 — Problem Statement SIH26021 | Ministry of MSME (KVIC)
 * @author Shivam Gawade (TrueTag Platform)
 */
contract HoneyChain is AccessControl {


    // ─── Roles ───────────────────────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE         = keccak256("ADMIN_ROLE");
    bytes32 public constant FIELD_OFFICER_ROLE = keccak256("FIELD_OFFICER_ROLE");
    bytes32 public constant LAB_ANALYST_ROLE   = keccak256("LAB_ANALYST_ROLE");

    // ─── Counters ─────────────────────────────────────────────────────────────
    uint256 private _farmerIdCounter;
    uint256 private _batchIdCounter;

    // ─── Data Structures ──────────────────────────────────────────────────────

    /**
     * @dev Represents a registered KVIC-verified beekeeper/farmer
     */
    struct Farmer {
        uint256 farmerId;
        string  name;
        string  location;          // e.g. "Sundarbans, West Bengal"
        string  cooperativeId;     // KVIC cooperative code
        string  ipfsProfileHash;   // IPFS CID for farmer photo + documents
        bool    isVerified;        // Approved by KVIC Field Officer
        uint256 registeredAt;      // Unix timestamp
    }

    /**
     * @dev Represents an immutable honey harvest batch token
     */
    struct Batch {
        uint256 batchId;
        uint256 farmerId;
        uint256 harvestTimestamp;
        string  ipfsMetadataHash;  // IPFS CID for full metadata JSON
        uint8   qualityScore;      // AI Purity Score (0-100)
        string  grade;             // e.g. "Grade A+ (Premium Raw Organic)"
        bool    isAuthentic;
        bool    isRevoked;         // Emergency revocation by admin
    }

    /**
     * @dev Represents a single custody transfer in the supply chain
     */
    struct CustodyEntry {
        address actor;             // Who logged this step
        string  entity;            // e.g. "KVIC Processing Unit #4, Jaipur"
        uint256 timestamp;
        string  action;            // e.g. "Received", "Pasteurized", "Dispatched"
    }

    // ─── State ────────────────────────────────────────────────────────────────
    mapping(uint256 => Farmer)        public farmers;
    mapping(uint256 => Batch)         public batches;
    mapping(uint256 => CustodyEntry[]) private _custodyChain;
    mapping(string  => uint256)       public qrToBatch;     // QR token → batchId
    mapping(uint256 => bool)          private _farmerExists;
    mapping(uint256 => bool)          private _batchExists;

    // ─── Events ───────────────────────────────────────────────────────────────
    event FarmerRegistered(
        uint256 indexed farmerId,
        string  name,
        string  location,
        address registeredBy
    );

    event BatchMinted(
        uint256 indexed batchId,
        uint256 indexed farmerId,
        string  ipfsMetadataHash,
        uint8   qualityScore,
        string  grade,
        address mintedBy
    );

    event CustodyLogged(
        uint256 indexed batchId,
        string  entity,
        string  action,
        address loggedBy
    );

    event QualityScoreUpdated(
        uint256 indexed batchId,
        uint8   oldScore,
        uint8   newScore,
        string  newGrade,
        address updatedBy
    );

    event BatchRevoked(
        uint256 indexed batchId,
        address revokedBy
    );

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE,         msg.sender);
        _grantRole(FIELD_OFFICER_ROLE, msg.sender);
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    /**
     * @notice Grant Field Officer role to a KVIC field officer address
     */
    function grantFieldOfficer(address officer) external onlyRole(ADMIN_ROLE) {
        _grantRole(FIELD_OFFICER_ROLE, officer);
    }

    /**
     * @notice Grant Lab Analyst role to an authorized quality testing lab
     */
    function grantLabAnalyst(address analyst) external onlyRole(ADMIN_ROLE) {
        _grantRole(LAB_ANALYST_ROLE, analyst);
    }

    /**
     * @notice Emergency revocation of a fraudulent batch
     */
    function revokeBatch(uint256 batchId) external onlyRole(ADMIN_ROLE) {
        require(_batchExists[batchId], "HoneyChain: Batch does not exist");
        batches[batchId].isRevoked = true;
        emit BatchRevoked(batchId, msg.sender);
    }

    // ─── Field Officer Functions ──────────────────────────────────────────────

    /**
     * @notice Register a new beekeeper with KVIC verification
     * @param name           Full name of the beekeeper
     * @param location       Geographic location (village, district, state)
     * @param cooperativeId  KVIC cooperative identifier
     * @param ipfsProfileHash IPFS CID containing farmer photo and documents
     */
    function registerFarmer(
        string calldata name,
        string calldata location,
        string calldata cooperativeId,
        string calldata ipfsProfileHash
    ) external onlyRole(FIELD_OFFICER_ROLE) returns (uint256 farmerId) {
        _farmerIdCounter++;
        farmerId = _farmerIdCounter;

        farmers[farmerId] = Farmer({
            farmerId:        farmerId,
            name:            name,
            location:        location,
            cooperativeId:   cooperativeId,
            ipfsProfileHash: ipfsProfileHash,
            isVerified:      true,
            registeredAt:    block.timestamp
        });

        _farmerExists[farmerId] = true;

        emit FarmerRegistered(farmerId, name, location, msg.sender);
    }

    /**
     * @notice Mint an immutable honey batch token at harvest
     * @param farmerId         The registered farmer's ID
     * @param ipfsMetadataHash Full harvest metadata JSON pinned on IPFS
     * @param qualityScore     AI purity score (0-100) from TrueTag AI service
     * @param grade            Human-readable grade string
     * @param qrToken          Unique QR token string linked to this batch
     */
    function mintBatch(
        uint256 farmerId,
        string  calldata ipfsMetadataHash,
        uint8   qualityScore,
        string  calldata grade,
        string  calldata qrToken
    ) external onlyRole(FIELD_OFFICER_ROLE) returns (uint256 batchId) {
        require(_farmerExists[farmerId],      "HoneyChain: Farmer not registered");
        require(farmers[farmerId].isVerified, "HoneyChain: Farmer not KVIC verified");
        require(qualityScore <= 100,          "HoneyChain: Score must be 0-100");
        require(qrToBatch[qrToken] == 0,      "HoneyChain: QR token already used");

        _batchIdCounter++;
        batchId = _batchIdCounter;

        batches[batchId] = Batch({
            batchId:          batchId,
            farmerId:         farmerId,
            harvestTimestamp: block.timestamp,
            ipfsMetadataHash: ipfsMetadataHash,
            qualityScore:     qualityScore,
            grade:            grade,
            isAuthentic:      true,
            isRevoked:        false
        });

        _batchExists[batchId]  = true;
        qrToBatch[qrToken]     = batchId;

        // Auto-log initial custody entry
        _custodyChain[batchId].push(CustodyEntry({
            actor:     msg.sender,
            entity:    "Apiary Harvest Site",
            timestamp: block.timestamp,
            action:    "Harvested & Minted on HoneyChain"
        }));

        emit BatchMinted(batchId, farmerId, ipfsMetadataHash, qualityScore, grade, msg.sender);
    }

    /**
     * @notice Log a custody transfer step in the supply chain
     * @param batchId Batch to log custody for
     * @param entity  Name of facility or entity taking custody
     * @param action  Description of custody action (e.g. "Received", "Pasteurized")
     */
    function addCustody(
        uint256 batchId,
        string calldata entity,
        string calldata action
    ) external onlyRole(FIELD_OFFICER_ROLE) {
        require(_batchExists[batchId],          "HoneyChain: Batch does not exist");
        require(!batches[batchId].isRevoked,    "HoneyChain: Batch has been revoked");

        _custodyChain[batchId].push(CustodyEntry({
            actor:     msg.sender,
            entity:    entity,
            timestamp: block.timestamp,
            action:    action
        }));

        emit CustodyLogged(batchId, entity, action, msg.sender);
    }

    // ─── Lab Analyst Functions ────────────────────────────────────────────────

    /**
     * @notice Update AI quality score after FSSAI lab testing
     * @param batchId      Batch to update quality for
     * @param newScore     New purity score (0-100)
     * @param newGrade     New grade string after lab verification
     */
    function updateQualityScore(
        uint256 batchId,
        uint8   newScore,
        string calldata newGrade
    ) external onlyRole(LAB_ANALYST_ROLE) {
        require(_batchExists[batchId],       "HoneyChain: Batch does not exist");
        require(!batches[batchId].isRevoked, "HoneyChain: Batch has been revoked");
        require(newScore <= 100,             "HoneyChain: Score must be 0-100");

        uint8 oldScore = batches[batchId].qualityScore;
        batches[batchId].qualityScore = newScore;
        batches[batchId].grade        = newGrade;

        emit QualityScoreUpdated(batchId, oldScore, newScore, newGrade, msg.sender);
    }

    // ─── Public Read Functions ────────────────────────────────────────────────

    /**
     * @notice Get full custody chain for a batch (for consumer verify page)
     * @param batchId The batch ID to query
     * @return Array of CustodyEntry structs
     */
    function getCustodyChain(uint256 batchId)
        external view returns (CustodyEntry[] memory)
    {
        require(_batchExists[batchId], "HoneyChain: Batch does not exist");
        return _custodyChain[batchId];
    }

    /**
     * @notice Get batch by QR token (called directly from consumer scan)
     * @param qrToken The unique QR token on the honey jar label
     * @return batch The Batch struct, farmer The Farmer struct
     */
    function verifyByQR(string calldata qrToken)
        external view returns (Batch memory batch, Farmer memory farmer)
    {
        uint256 batchId = qrToBatch[qrToken];
        require(batchId != 0,                    "HoneyChain: Invalid QR token");
        require(!batches[batchId].isRevoked,     "HoneyChain: Product has been recalled");

        batch  = batches[batchId];
        farmer = farmers[batch.farmerId];
    }

    /**
     * @notice Get total registered farmers count
     */
    function totalFarmers() external view returns (uint256) {
        return _farmerIdCounter;
    }

    /**
     * @notice Get total minted batches count
     */
    function totalBatches() external view returns (uint256) {
        return _batchIdCounter;
    }

    /**
     * @notice Get custody chain length for a batch
     */
    function getCustodyCount(uint256 batchId) external view returns (uint256) {
        return _custodyChain[batchId].length;
    }
}
