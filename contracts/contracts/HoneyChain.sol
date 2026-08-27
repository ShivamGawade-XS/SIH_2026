// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HoneyChain
 * @dev Blockchain-based honey traceability & 3-role approval workflow for KVIC / National Bee Board
 * @notice SIH 2026 — Problem Statement SIH26021 | Ministry of MSME (KVIC)
 * @author Shivam Gawade (TrueTag Platform)
 */
contract HoneyChain is AccessControl {

    // ─── Roles ───────────────────────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE               = keccak256("ADMIN_ROLE");
    bytes32 public constant BEEKEEPER_ROLE           = keccak256("BEEKEEPER_ROLE");
    bytes32 public constant FIELD_OFFICER_ROLE       = keccak256("FIELD_OFFICER_ROLE");
    bytes32 public constant DISTRICT_SUPERVISOR_ROLE = keccak256("DISTRICT_SUPERVISOR_ROLE");

    // ─── Counters ─────────────────────────────────────────────────────────────
    uint256 private _farmerIdCounter;
    uint256 private _requestIdCounter;
    uint256 private _batchIdCounter;

    // ─── Enums & Data Structures ──────────────────────────────────────────────

    enum RequestStatus {
        Pending,
        Approved,
        Rejected
    }

    /**
     * @dev Represents a registered KVIC-verified beekeeper/farmer
     */
    struct Farmer {
        uint256 farmerId;
        address walletAddress;
        string  name;
        string  location;          // e.g. "Sundarbans, West Bengal"
        string  cooperativeId;     // KVIC cooperative code
        string  ipfsProfileHash;   // IPFS CID for farmer photo + KYC
        bool    isVerified;        // Approved by KVIC Field Officer
        uint256 registeredAt;      // Unix timestamp
    }

    /**
     * @dev Step 1: Harvest data submitted by the Beekeeper for Field Officer verification
     */
    struct HarvestRequest {
        uint256       requestId;
        uint256       farmerId;
        address       beekeeperAddress;
        string        floraSource;       // Botanical origin e.g. "Acacia Blossom"
        uint256       quantityKg;        // Harvest weight in kg
        string        ipfsMetadataHash;  // IPFS CID containing raw hive & harvest sensory data
        uint256       submittedAt;
        RequestStatus status;
        address       reviewedBy;
        uint256       reviewedAt;
        string        reviewRemarks;
    }

    /**
     * @dev Step 2: Minted Honey Batch (only created upon Field Officer approval)
     */
    struct Batch {
        uint256 batchId;
        uint256 requestId;         // Linked harvest request
        uint256 farmerId;
        uint256 harvestTimestamp;
        string  ipfsMetadataHash;  // IPFS CID for full verified metadata JSON
        uint8   qualityScore;      // AI Purity Score (0-100)
        string  grade;             // e.g. "Grade A+ (Premium Raw Organic)"
        bool    isAuthentic;
        bool    isDisputed;        // Marked as disputed by District Supervisor (non-destructive)
        string  disputeReason;     // Reason for dispute/fraud flag
        address flaggedBy;         // Supervisor who flagged the batch
        bool    isRevoked;         // Emergency revocation
    }

    /**
     * @dev Supply chain custody log entry
     */
    struct CustodyEntry {
        address actor;             // Who logged this step
        string  entity;            // Facility/Station name
        uint256 timestamp;
        string  action;            // Action performed
    }

    // ─── State ────────────────────────────────────────────────────────────────
    mapping(uint256 => Farmer)         public farmers;
    mapping(address => uint256)        public beekeeperToFarmerId;
    mapping(uint256 => HarvestRequest) public harvestRequests;
    mapping(uint256 => Batch)          public batches;
    mapping(uint256 => CustodyEntry[]) private _custodyChain;
    mapping(string  => uint256)        public qrToBatch;          // QR token → batchId
    mapping(uint256 => bool)           private _farmerExists;
    mapping(uint256 => bool)           private _requestExists;
    mapping(uint256 => bool)           private _batchExists;

    // ─── Events ───────────────────────────────────────────────────────────────
    event FarmerRegistered(
        uint256 indexed farmerId,
        address indexed walletAddress,
        string  name,
        string  location,
        address registeredBy
    );

    event HarvestSubmitted(
        uint256 indexed requestId,
        uint256 indexed farmerId,
        address indexed beekeeper,
        uint256 quantityKg,
        string  floraSource,
        string  ipfsMetadataHash
    );

    event HarvestApproved(
        uint256 indexed requestId,
        uint256 indexed batchId,
        address indexed officer,
        uint8   qualityScore,
        string  grade
    );

    event HarvestRejected(
        uint256 indexed requestId,
        address indexed officer,
        string  reason
    );

    event BatchMinted(
        uint256 indexed batchId,
        uint256 indexed requestId,
        uint256 indexed farmerId,
        string  ipfsMetadataHash,
        uint8   qualityScore,
        string  grade,
        address mintedBy
    );

    event BatchDisputed(
        uint256 indexed batchId,
        string  reason,
        address indexed supervisor
    );

    event DisputeResolved(
        uint256 indexed batchId,
        bool    isAuthentic,
        string  resolutionRemarks,
        address indexed supervisor
    );

    event BatchAudited(
        uint256 indexed batchId,
        string  auditNotes,
        address indexed supervisor
    );

    event CustodyLogged(
        uint256 indexed batchId,
        string  entity,
        string  action,
        address loggedBy
    );

    event BatchRevoked(
        uint256 indexed batchId,
        address revokedBy
    );

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE,         msg.sender);
        _grantRole(ADMIN_ROLE,                 msg.sender);
        _grantRole(FIELD_OFFICER_ROLE,         msg.sender);
        _grantRole(DISTRICT_SUPERVISOR_ROLE,   msg.sender);
    }

    // ─── Role Management ──────────────────────────────────────────────────────

    /**
     * @notice Assign Beekeeper role to a farmer wallet
     */
    function grantBeekeeper(address beekeeper) external onlyRole(ADMIN_ROLE) {
        _grantRole(BEEKEEPER_ROLE, beekeeper);
    }

    /**
     * @notice Assign Field Officer role to authorized KVIC field personnel
     */
    function grantFieldOfficer(address officer) external onlyRole(ADMIN_ROLE) {
        _grantRole(FIELD_OFFICER_ROLE, officer);
    }

    /**
     * @notice Assign District Supervisor role for audit and dispute governance
     */
    function grantDistrictSupervisor(address supervisor) external onlyRole(ADMIN_ROLE) {
        _grantRole(DISTRICT_SUPERVISOR_ROLE, supervisor);
    }

    // ─── Workflow Step 0: Beekeeper Registration (Field Officer / Admin) ───────

    /**
     * @notice Register and verify a beekeeper in the KVIC national database
     */
    function registerFarmer(
        address walletAddress,
        string  calldata name,
        string  calldata location,
        string  calldata cooperativeId,
        string  calldata ipfsProfileHash
    ) external onlyRole(FIELD_OFFICER_ROLE) returns (uint256 farmerId) {
        require(walletAddress != address(0), "HoneyChain: Invalid wallet address");

        _farmerIdCounter++;
        farmerId = _farmerIdCounter;

        farmers[farmerId] = Farmer({
            farmerId:        farmerId,
            walletAddress:   walletAddress,
            name:            name,
            location:        location,
            cooperativeId:   cooperativeId,
            ipfsProfileHash: ipfsProfileHash,
            isVerified:      true,
            registeredAt:    block.timestamp
        });

        _farmerExists[farmerId]            = true;
        beekeeperToFarmerId[walletAddress] = farmerId;

        // Auto-assign BEEKEEPER_ROLE to the farmer wallet
        _grantRole(BEEKEEPER_ROLE, walletAddress);

        emit FarmerRegistered(farmerId, walletAddress, name, location, msg.sender);
    }

    // ─── Workflow Step 1: Beekeeper Submits Harvest ───────────────────────────

    /**
     * @notice Step 1: Beekeeper submits raw harvest data for verification
     * @param floraSource      Botanical flower species (e.g., "Mustard", "Litchi")
     * @param quantityKg       Total harvest yield in kg
     * @param ipfsMetadataHash IPFS CID containing raw hive telemetry & harvest logs
     */
    function submitHarvest(
        string calldata floraSource,
        uint256 quantityKg,
        string calldata ipfsMetadataHash
    ) external onlyRole(BEEKEEPER_ROLE) returns (uint256 requestId) {
        uint256 farmerId = beekeeperToFarmerId[msg.sender];
        require(farmerId != 0 && _farmerExists[farmerId], "HoneyChain: Caller not a registered farmer");
        require(farmers[farmerId].isVerified,             "HoneyChain: Farmer not verified");
        require(quantityKg > 0,                           "HoneyChain: Quantity must be > 0");

        _requestIdCounter++;
        requestId = _requestIdCounter;

        harvestRequests[requestId] = HarvestRequest({
            requestId:        requestId,
            farmerId:         farmerId,
            beekeeperAddress: msg.sender,
            floraSource:      floraSource,
            quantityKg:       quantityKg,
            ipfsMetadataHash: ipfsMetadataHash,
            submittedAt:      block.timestamp,
            status:           RequestStatus.Pending,
            reviewedBy:       address(0),
            reviewedAt:       0,
            reviewRemarks:    ""
        });

        _requestExists[requestId] = true;

        emit HarvestSubmitted(requestId, farmerId, msg.sender, quantityKg, floraSource, ipfsMetadataHash);
    }

    // ─── Workflow Step 2: Field Officer Approves & Mints Batch ────────────────

    /**
     * @notice Step 2: Field Officer approves harvest request and mints immutable batch
     * @dev Enforces rule: No batch mints without FieldOfficer approval of a valid request
     * @param requestId        The harvest request ID to approve
     * @param ipfsMetadataHash Full verified laboratory & provenance metadata IPFS CID
     * @param qualityScore     AI / Lab Purity Score (0-100)
     * @param grade            Grade classification string
     * @param qrToken          Unique physical QR token identifier
     */
    function approveHarvestAndMint(
        uint256 requestId,
        string  calldata ipfsMetadataHash,
        uint8   qualityScore,
        string  calldata grade,
        string  calldata qrToken
    ) external onlyRole(FIELD_OFFICER_ROLE) returns (uint256 batchId) {
        require(_requestExists[requestId], "HoneyChain: Request does not exist");
        HarvestRequest storage req = harvestRequests[requestId];
        require(req.status == RequestStatus.Pending, "HoneyChain: Request not in pending state");
        require(qualityScore <= 100,                 "HoneyChain: Quality score must be 0-100");
        require(qrToBatch[qrToken] == 0,             "HoneyChain: QR token already assigned");

        // Update request status
        req.status        = RequestStatus.Approved;
        req.reviewedBy    = msg.sender;
        req.reviewedAt    = block.timestamp;
        req.reviewRemarks = "Approved by KVIC Field Officer";

        // Mint Batch
        _batchIdCounter++;
        batchId = _batchIdCounter;

        batches[batchId] = Batch({
            batchId:          batchId,
            requestId:        requestId,
            farmerId:         req.farmerId,
            harvestTimestamp: block.timestamp,
            ipfsMetadataHash: ipfsMetadataHash,
            qualityScore:     qualityScore,
            grade:            grade,
            isAuthentic:      true,
            isDisputed:       false,
            disputeReason:    "",
            flaggedBy:        address(0),
            isRevoked:        false
        });

        _batchExists[batchId] = true;
        qrToBatch[qrToken]    = batchId;

        // Auto-log initial custody entry
        _custodyChain[batchId].push(CustodyEntry({
            actor:     msg.sender,
            entity:    "Field Inspection Station",
            timestamp: block.timestamp,
            action:    "Harvest Verified & Minted on HoneyChain"
        }));

        emit HarvestApproved(requestId, batchId, msg.sender, qualityScore, grade);
        emit BatchMinted(batchId, requestId, req.farmerId, ipfsMetadataHash, qualityScore, grade, msg.sender);
    }

    /**
     * @notice Reject a harvest request if quality, origin, or KYC validation fails
     */
    function rejectHarvest(
        uint256 requestId,
        string calldata reason
    ) external onlyRole(FIELD_OFFICER_ROLE) {
        require(_requestExists[requestId], "HoneyChain: Request does not exist");
        HarvestRequest storage req = harvestRequests[requestId];
        require(req.status == RequestStatus.Pending, "HoneyChain: Request not in pending state");

        req.status        = RequestStatus.Rejected;
        req.reviewedBy    = msg.sender;
        req.reviewedAt    = block.timestamp;
        req.reviewRemarks = reason;

        emit HarvestRejected(requestId, msg.sender, reason);
    }

    /**
     * @notice Log custody transfer step in supply chain
     */
    function addCustody(
        uint256 batchId,
        string calldata entity,
        string calldata action
    ) external onlyRole(FIELD_OFFICER_ROLE) {
        require(_batchExists[batchId],       "HoneyChain: Batch does not exist");
        require(!batches[batchId].isRevoked, "HoneyChain: Batch has been revoked");

        _custodyChain[batchId].push(CustodyEntry({
            actor:     msg.sender,
            entity:    entity,
            timestamp: block.timestamp,
            action:    action
        }));

        emit CustodyLogged(batchId, entity, action, msg.sender);
    }

    // ─── Workflow Step 3: District Supervisor Audit & Fraud Flagging ───────────

    /**
     * @notice Step 3: District Supervisor audits and flags a batch as fraudulent/disputed
     * @dev Marks batch as disputed WITHOUT deleting it, maintaining transparent audit history
     * @param batchId Batch ID under dispute
     * @param reason  Reason for fraud/adulteration dispute
     */
    function flagFraud(
        uint256 batchId,
        string calldata reason
    ) external onlyRole(DISTRICT_SUPERVISOR_ROLE) {
        require(_batchExists[batchId], "HoneyChain: Batch does not exist");
        Batch storage b = batches[batchId];

        b.isDisputed     = true;
        b.isAuthentic    = false;
        b.disputeReason  = reason;
        b.flaggedBy      = msg.sender;

        _custodyChain[batchId].push(CustodyEntry({
            actor:     msg.sender,
            entity:    "District Supervisor Audit Office",
            timestamp: block.timestamp,
            action:    string(abi.encodePacked("FLAGGED AS FRAUDULENT: ", reason))
        }));

        emit BatchDisputed(batchId, reason, msg.sender);
    }

    /**
     * @notice Resolve a disputed batch after secondary laboratory / field investigation
     * @param batchId           Batch ID to resolve
     * @param restoreAuthentic  True if cleared of fraud, False if confirmed adulterated
     * @param resolutionRemarks Official resolution notes
     */
    function resolveDispute(
        uint256 batchId,
        bool    restoreAuthentic,
        string  calldata resolutionRemarks
    ) external onlyRole(DISTRICT_SUPERVISOR_ROLE) {
        require(_batchExists[batchId], "HoneyChain: Batch does not exist");
        Batch storage b = batches[batchId];
        require(b.isDisputed,          "HoneyChain: Batch is not currently disputed");

        b.isDisputed    = false;
        b.isAuthentic   = restoreAuthentic;
        b.disputeReason = resolutionRemarks;

        if (!restoreAuthentic) {
            b.isRevoked = true;
        }

        _custodyChain[batchId].push(CustodyEntry({
            actor:     msg.sender,
            entity:    "District Supervisor Audit Office",
            timestamp: block.timestamp,
            action:    string(abi.encodePacked("DISPUTE RESOLVED: ", resolutionRemarks))
        }));

        emit DisputeResolved(batchId, restoreAuthentic, resolutionRemarks, msg.sender);
    }

    /**
     * @notice Log formal supervisory audit record
     */
    function auditBatch(
        uint256 batchId,
        string calldata auditNotes
    ) external onlyRole(DISTRICT_SUPERVISOR_ROLE) {
        require(_batchExists[batchId], "HoneyChain: Batch does not exist");

        _custodyChain[batchId].push(CustodyEntry({
            actor:     msg.sender,
            entity:    "District Supervisor Quality Audit",
            timestamp: block.timestamp,
            action:    auditNotes
        }));

        emit BatchAudited(batchId, auditNotes, msg.sender);
    }

    /**
     * @notice Emergency revocation of a fraudulent batch by Admin
     */
    function revokeBatch(uint256 batchId) external onlyRole(ADMIN_ROLE) {
        require(_batchExists[batchId], "HoneyChain: Batch does not exist");
        batches[batchId].isRevoked   = true;
        batches[batchId].isAuthentic = false;

        _custodyChain[batchId].push(CustodyEntry({
            actor:     msg.sender,
            entity:    "KVIC Central Administration",
            timestamp: block.timestamp,
            action:    "PERMANENT EMERGENCY REVOCATION"
        }));

        emit BatchRevoked(batchId, msg.sender);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function getFarmer(uint256 farmerId) external view returns (Farmer memory) {
        require(_farmerExists[farmerId], "HoneyChain: Farmer does not exist");
        return farmers[farmerId];
    }

    function getHarvestRequest(uint256 requestId) external view returns (HarvestRequest memory) {
        require(_requestExists[requestId], "HoneyChain: Request does not exist");
        return harvestRequests[requestId];
    }

    function getBatch(uint256 batchId) external view returns (Batch memory) {
        require(_batchExists[batchId], "HoneyChain: Batch does not exist");
        return batches[batchId];
    }

    function getBatchByQR(string calldata qrToken) external view returns (Batch memory) {
        uint256 batchId = qrToBatch[qrToken];
        require(batchId != 0, "HoneyChain: QR token not found");
        return batches[batchId];
    }

    function getCustodyChain(uint256 batchId) external view returns (CustodyEntry[] memory) {
        require(_batchExists[batchId], "HoneyChain: Batch does not exist");
        return _custodyChain[batchId];
    }

    function totalFarmers() external view returns (uint256) {
        return _farmerIdCounter;
    }

    function totalRequests() external view returns (uint256) {
        return _requestIdCounter;
    }

    function totalBatches() external view returns (uint256) {
        return _batchIdCounter;
    }
}
