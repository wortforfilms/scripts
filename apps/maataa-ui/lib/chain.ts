export type ChainProviderConfig = {
  chain: "polygon" | "ethereum" | "base" | "custom";
  rpcUrl?: string;
  privateKey?: string;
  contractAddress?: string;
};

export type AnchorTx = {
  merkleRoot: string;
  txHash: string;
  chain: string;
  confirmed: boolean;
};

export function getChainConfig(): ChainProviderConfig {
  return {
    chain: (process.env.CHAIN_NAME as ChainProviderConfig["chain"]) || "polygon",
    rpcUrl: process.env.CHAIN_RPC_URL,
    privateKey: process.env.CHAIN_PRIVATE_KEY,
    contractAddress: process.env.CHAIN_CONTRACT_ADDRESS
  };
}

export async function prepareChainAnchor(merkleRoot: string): Promise<AnchorTx> {
  const config = getChainConfig();
  return {
    merkleRoot,
    txHash: `pending-${merkleRoot.slice(0, 32)}`,
    chain: config.chain,
    confirmed: false
  };
}
