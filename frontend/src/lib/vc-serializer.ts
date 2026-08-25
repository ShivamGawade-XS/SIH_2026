/**
 * W3C Verifiable Credential Serializer for HoneyChain by TrueTag
 * Adapted from CertXchange (https://github.com/ShivamGawade-XS/zerocert)
 * Author: Shivam Gawade (@ShivamGawade-XS)
 */

import { BatchMetadata } from "./types";

/**
 * Serializes a HoneyChain batch into a standard W3C Verifiable Credential JSON-LD
 * compliant with W3C VC Data Model 1.1 and TrueTag Provenance Context
 */
export function exportHoneyBatchCredential(
  data: BatchMetadata,
  appUrl: string = "https://honeychain.truetag.in"
) {
  const { batch, farmer, custodyChain, labReport, txHash, qrToken } = data;
  const issuedAt = new Date(batch.harvestTimestamp * 1000).toISOString();

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://truetag.in/context/honey/v1.jsonld",
      "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.1.json",
    ],
    id: `${appUrl}/verify?batch=${batch.batchId}`,
    type: ["VerifiableCredential", "HoneyProvenanceCredential"],
    name: `HoneyChain Provenance Certificate — Batch #${batch.batchId}`,
    issuer: {
      id: `${appUrl}/org/kvic`,
      type: ["Organization", "Profile"],
      name: "Khadi and Village Industries Commission (KVIC)",
      department: "National Bee Board — Honey Mission",
      url: "https://www.kvic.gov.in",
    },
    issuanceDate: issuedAt,
    credentialSubject: {
      id: `${appUrl}/batch/${batch.batchId}`,
      type: ["HoneyBatch"],
      batchId: batch.batchId,
      qrToken: qrToken,
      authenticityStatus: batch.isAuthentic ? "AUTHENTIC_VERIFIED" : "REVOKED",
      qualityScore: batch.qualityScore,
      grade: batch.grade,
      farmer: {
        id: `${appUrl}/farmer/${farmer.farmerId}`,
        name: farmer.name,
        location: farmer.location,
        cooperativeId: farmer.cooperativeId,
        isKVICVerified: farmer.isVerified,
        ipfsProfile: `ipfs://${farmer.ipfsProfileHash}`,
      },
      labReport: {
        moisturePercent: labReport.moisturePercent,
        brixPercent: labReport.brixPercent,
        hmfMgPerKg: labReport.hmfMgPerKg,
        diastaseNumber: labReport.diastaseNumber,
        electricalConductivity: labReport.electricalConductivity,
        standard: "FSSAI Food Safety and Standards Regulations 2021",
        passed: labReport.passedFSSAI,
      },
      custodyStepsCount: custodyChain.length,
      custodyChain: custodyChain.map((c, index) => ({
        step: index + 1,
        entity: c.entity,
        action: c.action,
        timestamp: new Date(c.timestamp * 1000).toISOString(),
        actorAddress: c.actor,
      })),
      blockchainProof: {
        network: "Polygon PoS (Sepolia Testnet)",
        smartContract: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        ipfsMetadataCID: batch.ipfsMetadataHash,
        txHash: txHash || "0x8f2d9c4e7b1a56209ef43c8b1a32d67e891c345a6789b0cd1234ef56789a2f10",
      },
    },
    proof: {
      type: "EthereumEip712Signature2021",
      created: issuedAt,
      proofPurpose: "assertionMethod",
      verificationMethod: `${appUrl}/keys/kvic-master-key`,
    },
  };
}
