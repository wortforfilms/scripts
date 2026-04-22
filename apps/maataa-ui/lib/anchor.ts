export type AnchorStatus = "UNVERIFIED" | "SIGNED" | "IPFS_STORED" | "CHAIN_ANCHORED" | "FULLY_VERIFIED";

export type ProofAnchorRecord = {
  merkleRoot: string;
  signature?: string;
  publicKey?: string;
  ipfsCid?: string | null;
  txHash?: string | null;
  chainId?: string | null;
  anchorStatus: AnchorStatus;
  anchoredAt?: string | null;
};

export function buildMockIpfsCid(merkleRoot: string): string {
  return `bafy${merkleRoot.slice(0, 20)}`;
}

export function buildMockTxHash(merkleRoot: string): string {
  return `0x${merkleRoot.padEnd(64, "0").slice(0, 64)}`;
}

export function deriveBadgeStatus(record: ProofAnchorRecord): AnchorStatus {
  if (record.ipfsCid && record.txHash && record.signature) return "FULLY_VERIFIED";
  if (record.txHash) return "CHAIN_ANCHORED";
  if (record.ipfsCid) return "IPFS_STORED";
  if (record.signature) return "SIGNED";
  return "UNVERIFIED";
}
