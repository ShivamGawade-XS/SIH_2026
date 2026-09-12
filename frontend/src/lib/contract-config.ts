// contract-config.ts
// Single source of truth for blockchain configuration.
// Reads from Vercel/Next.js environment variables.

export const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "80002"),
  explorerUrl:
    process.env.NEXT_PUBLIC_EXPLORER_URL || "https://amoy.polygonscan.com",
  rpcUrl:
    process.env.NEXT_PUBLIC_RPC_URL || "https://rpc-amoy.polygon.technology",
  networkName:
    parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "80002") === 137
      ? "Polygon Mainnet"
      : "Polygon Amoy Testnet",
  isLive: !!(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS),
} as const;

/** Returns a Polygonscan link to a transaction hash */
export function getTxUrl(txHash: string): string {
  return `${CONTRACT_CONFIG.explorerUrl}/tx/${txHash}`;
}

/** Returns a Polygonscan link to the deployed contract */
export function getContractUrl(): string {
  return `${CONTRACT_CONFIG.explorerUrl}/address/${CONTRACT_CONFIG.address}`;
}

/** Returns a Polygonscan link to a wallet address */
export function getAddressUrl(address: string): string {
  return `${CONTRACT_CONFIG.explorerUrl}/address/${address}`;
}
