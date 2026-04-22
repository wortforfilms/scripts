import { ethers } from "ethers";

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

async function executeRealAnchor(merkleRoot: string, config: ChainProviderConfig): Promise<AnchorTx> {
  if (!config.rpcUrl || !config.privateKey || !config.contractAddress) {
    return {
      merkleRoot,
      txHash: `pending-${merkleRoot.slice(0, 32)}`,
      chain: config.chain,
      confirmed: false
    };
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);

  const abi = [
    "function anchorMerkleRoot(string memory root) public"
  ];

  const contract = new ethers.Contract(config.contractAddress, abi, wallet);

  const tx = await contract.anchorMerkleRoot(merkleRoot);
  const receipt = await tx.wait();

  return {
    merkleRoot,
    txHash: receipt.hash,
    chain: config.chain,
    confirmed: receipt.status === 1
  };
}

export async function prepareChainAnchor(merkleRoot: string): Promise<AnchorTx> {
  const config = getChainConfig();
  return executeRealAnchor(merkleRoot, config);
}
