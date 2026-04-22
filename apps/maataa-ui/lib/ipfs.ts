export type IpfsProviderConfig = {
  mode: "local-node" | "pinata" | "web3-storage";
  endpoint?: string;
  apiKey?: string;
  secretApiKey?: string;
  jwt?: string;
};

export type PreparedIpfsRecord = {
  merkleRoot: string;
  cid: string;
  provider: string;
  published: boolean;
};

export function getIpfsConfig(): IpfsProviderConfig {
  return {
    mode: (process.env.IPFS_PROVIDER_MODE as IpfsProviderConfig["mode"]) || "local-node",
    endpoint: process.env.IPFS_API_ENDPOINT,
    apiKey: process.env.PINATA_API_KEY,
    secretApiKey: process.env.PINATA_SECRET_API_KEY,
    jwt: process.env.WEB3_STORAGE_JWT
  };
}

export async function prepareIpfsPublish(merkleRoot: string): Promise<PreparedIpfsRecord> {
  const config = getIpfsConfig();
  return {
    merkleRoot,
    cid: `pending-${merkleRoot.slice(0, 24)}`,
    provider: config.mode,
    published: false
  };
}
