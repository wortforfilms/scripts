import { createHash, generateKeyPairSync, sign, verify } from "node:crypto";

export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, Object.keys(value as Record<string, unknown>).sort(), 2);
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
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

const keypair = generateKeyPairSync("ed25519");

export function signRoot(root: string): string {
  return sign(null, Buffer.from(root), keypair.privateKey).toString("base64");
}

export function verifyRoot(root: string, signature: string): boolean {
  return verify(null, Buffer.from(root), keypair.publicKey, Buffer.from(signature, "base64"));
}

export function exportPublicKey(): string {
  return keypair.publicKey.export({ type: "spki", format: "pem" }).toString();
}
