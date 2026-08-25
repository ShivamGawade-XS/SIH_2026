// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HoneyChain
 * @dev Smart Contract for Blockchain-Based Honey Traceability & Smart Beekeeping (SIH 2026 PS: SIH26021)
 * Platform: TrueTag | Ministry: MSME (KVIC) & National Bee Board
 */
contract HoneyChain {

    struct Farmer {
        uint256 farmerId;
        string name;
        string location;        // e.g. "Sundarbans, West Bengal"
        string cooperativeId;
        bool isVerified;        // KVIC Field Officer verified
    }

    struct Batch {
        uint256 batchId;
        uint256 farmerId;
        uint256 harvestTimestamp;
        string ipfsHash;         // Points to full metadata JSON on IPFS (Pinata)
        uint8 qualityScore;      // AI Quality Score (0-100)
        bool isAuthentic;
    }

    struct CustodyEntry {
        string entity;           // e.g., "KVIC Processing Unit #4", "Retail Shelf"
        uint256 timestamp;
        string action;           // e.g., "Received", "Tested", "Bottled", "Dispatched"
    }

    address public admin;

    mapping(uint256 => Farmer) public farmers;
    mapping(uint256 => Batch) public batches;
    mapping(uint256 => CustodyEntry[]) public custodyChain;
    mapping(string => uint256) public qrToBatch;

    event FarmerRegistered(uint256 indexed farmerId, string name, string location);
    event BatchMinted(uint256 indexed batchId, uint256 indexed farmerId, string ipfsHash, uint8 qualityScore);
    event CustodyLogged(uint256 indexed batchId, string entity, string action);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @notice Register a new beekeeper/farmer profile
     */
    function registerFarmer(
        uint256 _farmerId,
        string memory _name,
        string memory _location,
        string memory _cooperativeId
    ) external {
        farmers[_farmerId] = Farmer({
            farmerId: _farmerId,
            name: _name,
            location: _location,
            cooperativeId: _cooperativeId,
            isVerified: true
        });

        emit FarmerRegistered(_farmerId, _name, _location);
    }

    /**
     * @notice Mint a new honey batch token with IPFS metadata & AI score
     */
    function mintBatch(
        uint256 _batchId,
        uint256 _farmerId,
        string memory _ipfsHash,
        uint8 _qualityScore,
        string memory _qrCode
    ) external {
        require(farmers[_farmerId].isVerified, "Farmer must be verified by KVIC");
        require(batches[_batchId].batchId == 0, "Batch already exists");

        batches[_batchId] = Batch({
            batchId: _batchId,
            farmerId: _farmerId,
            harvestTimestamp: block.timestamp,
            ipfsHash: _ipfsHash,
            qualityScore: _qualityScore,
            isAuthentic: true
        });

        qrToBatch[_qrCode] = _batchId;

        // Initial custody log
        custodyChain[_batchId].push(CustodyEntry({
            entity: "Apiary Harvest Site",
            timestamp: block.timestamp,
            action: "Harvested & Batch Minted"
        }));

        emit BatchMinted(_batchId, _farmerId, _ipfsHash, _qualityScore);
    }

    /**
     * @notice Add a custody step in supply chain
     */
    function addCustody(
        uint256 _batchId,
        string memory _entity,
        string memory _action
    ) external {
        require(batches[_batchId].batchId != 0, "Batch does not exist");

        custodyChain[_batchId].push(CustodyEntry({
            entity: _entity,
            timestamp: block.timestamp,
            action: _action
        }));

        emit CustodyLogged(_batchId, _entity, _action);
    }

    /**
     * @notice Get custody chain array length for a batch
     */
    function getCustodyCount(uint256 _batchId) external view returns (uint256) {
        return custodyChain[_batchId].length;
    }
}
