// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HoneyChainQR
 * @dev Dynamic Anti-Counterfeiting & Scan Counter Engine for HoneyChain / TrueTag
 * @notice SIH 2026 — Problem Statement SIH26021 | Ministry of MSME (KVIC)
 * @author Shivam Gawade (TrueTag Platform)
 */
contract HoneyChainQR is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    struct QRRecord {
        string qrToken;
        uint256 batchId;
        uint256 createdAt;
        uint256 scanCount;
        uint256 lastScannedAt;
        bool isFlagged;
        string flagReason;
    }

    // Mapping: qrToken => QRRecord
    mapping(string => QRRecord) public qrRecords;
    // Mapping: qrToken => existence
    mapping(string => bool) public qrExists;

    event QRRegistered(string indexed qrToken, uint256 indexed batchId, uint256 timestamp);
    event QRScanned(string indexed qrToken, uint256 indexed batchId, uint256 scanCount, uint256 timestamp);
    event QRFlagged(string indexed qrToken, uint256 scanCount, string reason);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice Register a newly minted batch QR code
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
            flagReason: ""
        });

        qrExists[qrToken] = true;
        emit QRRegistered(qrToken, batchId, block.timestamp);
    }

    /**
     * @notice Log a consumer verification scan and check for clone anomalies
     * @param qrToken QR token string scanned from physical jar
     */
    function recordScan(string calldata qrToken) external returns (uint256 scanCount, bool isSuspicious) {
        require(qrExists[qrToken], "HoneyChainQR: QR Token not found");
        QRRecord storage record = qrRecords[qrToken];

        record.scanCount++;
        record.lastScannedAt = block.timestamp;

        // Anti-counterfeiting heuristic: excessive rapid scans across disparate locations indicates cloned QR
        if (record.scanCount > 25 && !record.isFlagged) {
            record.isFlagged = true;
            record.flagReason = "Anomalous scan volume: potential physical QR clone replication";
            emit QRFlagged(qrToken, record.scanCount, record.flagReason);
        }

        emit QRScanned(qrToken, record.batchId, record.scanCount, block.timestamp);
        return (record.scanCount, record.isFlagged);
    }

    /**
     * @notice Query QR record status
     */
    function getQRStatus(string calldata qrToken) external view returns (
        uint256 batchId,
        uint256 scanCount,
        uint256 lastScannedAt,
        bool isFlagged,
        string memory flagReason
    ) {
        require(qrExists[qrToken], "HoneyChainQR: QR Token not found");
        QRRecord memory record = qrRecords[qrToken];
        return (
            record.batchId,
            record.scanCount,
            record.lastScannedAt,
            record.isFlagged,
            record.flagReason
        );
    }
}
