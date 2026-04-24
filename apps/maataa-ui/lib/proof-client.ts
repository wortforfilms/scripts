import { sha256 as ethersSha256, toUtf8Bytes } from "ethers";

function hexSha256(input: string) {
  return ethersSha256(toUtf8Bytes(input)).replace(/^0x/, "");
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, Object.keys(value as Record<string, unknown>).sort(), 2);
}

export function sha256(input: string): string {
  return hexSha256(input);
}

export function buildMerkleLeaves(events: Array<Record<string, unknown>>): string[] {
  return events.map((event) => sha256(canonicalJson(event)));
}

export function buildMerkleRoot(leaves: string[]): string {
  if (leaves.length === 0) return sha256("");
  let layer = [...leaves];
  while (layer.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = layer[i + 1] ?? left;
      next.push(sha256(`${left}:${right}`));
    }
    layer = next;
  }
  return layer[0];
}

export async function verifyRoot(root: string, signature: string, publicKey: string): Promise<boolean> {
  try {
    const algorithm = { name: "Ed25519" } as EcKeyImportParams;
    const key = await crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(publicKey),
      algorithm,
      false,
      ["verify"]
    );

    const signatureBytes = Uint8Array.from(atob(signature), (char) => char.charCodeAt(0));
    const data = new TextEncoder().encode(root);
    return crypto.subtle.verify("Ed25519", key, signatureBytes, data);
  } catch {
    return false;
  }
}
