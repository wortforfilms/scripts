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

async function publishToPinata(merkleRoot: string, config: IpfsProviderConfig): Promise<PreparedIpfsRecord> {
  if (!config.apiKey || !config.secretApiKey) {
    return {
      merkleRoot,
      cid: `pending-${merkleRoot.slice(0, 24)}`,
      provider: "pinata",
      published: false
    };
  }

  const payload = {
    pinataContent: {
      merkleRoot,
      exportedAt: new Date().toISOString()
    },
    pinataMetadata: {
      name: `maataa-${merkleRoot.slice(0, 12)}`
    }
  };

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: config.apiKey,
      pinata_secret_api_key: config.secretApiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return {
      merkleRoot,
      cid: `pending-${merkleRoot.slice(0, 24)}`,
      provider: "pinata",
      published: false
    };
  }

  const data = await response.json();

  return {
    merkleRoot,
    cid: data.IpfsHash,
    provider: "pinata",
    published: true
  };
}

export async function prepareIpfsPublish(merkleRoot: string): Promise<PreparedIpfsRecord> {
  const config = getIpfsConfig();

  if (config.mode === "pinata") {
    return publishToPinata(merkleRoot, config);
  }

  return {
    merkleRoot,
    cid: `pending-${merkleRoot.slice(0, 24)}`,
    provider: config.mode,
    published: false
  };
}
