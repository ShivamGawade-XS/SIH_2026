/**
 * IPFS Pinata Service Integration for HoneyChain by TrueTag
 * Author: Shivam Gawade (ShivamGawade-XS)
 */

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

/**
 * Pin JSON metadata document to IPFS
 */
export async function pinJSONToIPFS(body: Record<string, any>, name: string): Promise<string> {
  if (!PINATA_JWT) {
    // Generate deterministic mock hash if API keys not configured
    const pseudoHash = "Qm" + Array.from({ length: 44 }, () =>
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]
    ).join("");
    console.warn("Pinata JWT not set. Generated mock IPFS CID:", pseudoHash);
    return pseudoHash;
  }

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataOptions: { cidVersion: 1 },
        pinataMetadata: { name: `HoneyChain_${name}` },
        pinataContent: body,
      }),
    });

    if (!res.ok) {
      throw new Error(`Pinata pin failed with status ${res.status}`);
    }

    const data: PinataResponse = await res.json();
    return data.IpfsHash;
  } catch (err) {
    console.error("IPFS pinning error:", err);
    throw err;
  }
}

/**
 * Format IPFS URI into a reachable gateway URL
 */
export function getIPFSGatewayUrl(cidOrUri: string): string {
  if (!cidOrUri) return "";
  const cleanCID = cidOrUri.replace("ipfs://", "");
  return `${PINATA_GATEWAY}${cleanCID}`;
}
