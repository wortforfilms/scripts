import { describe, it, expect } from 'vitest';
import {
  sha256,
  buildMerkleLeaves,
  buildMerkleRoot,
  signRoot,
  verifyRoot,
  exportPublicKey,
} from '../lib/proof';

describe('proof: hashing + merkle + signature', () => {
  it('generates consistent sha256 hashes', () => {
    const input = 'maataa-test';
    const hash1 = sha256(input);
    const hash2 = sha256(input);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('builds deterministic Merkle leaves and root', () => {
    const payload = [
      { id: '1', type: 'scheduler.tick', time: '2026-04-22T00:00:00.000Z' },
      { id: '2', type: 'radio.now_playing', time: '2026-04-22T00:01:00.000Z' },
      { id: '3', type: 'proof.generated', time: '2026-04-22T00:02:00.000Z' },
    ];

    const leaves1 = buildMerkleLeaves(payload);
    const leaves2 = buildMerkleLeaves(payload);
    const root1 = buildMerkleRoot(leaves1);
    const root2 = buildMerkleRoot(leaves2);

    expect(leaves1).toEqual(leaves2);
    expect(root1).toBe(root2);
    expect(leaves1).toHaveLength(3);
    expect(root1).toHaveLength(64);
  });

  it('signs and verifies the Merkle root', () => {
    const payload = [
      { id: '1', type: 'scheduler.tick', time: '2026-04-22T00:00:00.000Z' },
      { id: '2', type: 'radio.now_playing', time: '2026-04-22T00:01:00.000Z' },
    ];

    const leaves = buildMerkleLeaves(payload);
    const root = buildMerkleRoot(leaves);
    const signature = signRoot(root);

    expect(signature.length).toBeGreaterThan(0);
    expect(verifyRoot(root, signature)).toBe(true);
    expect(verifyRoot(root + '-tampered', signature)).toBe(false);
  });

  it('exports a PEM public key', () => {
    const pem = exportPublicKey();
    expect(pem).toContain('BEGIN PUBLIC KEY');
    expect(pem).toContain('END PUBLIC KEY');
  });

  it('supports an HKD-like signed timeline payload shape', () => {
    const payload = [
      { id: '1', type: 'scheduler.tick', proofLabel: 'RUNTIME_EVENT' },
      { id: '2', type: 'radio.now_playing', proofLabel: 'BROADCAST_PROOF' },
      { id: '3', type: 'proof.generated', proofLabel: 'PROOF_EVENT' },
    ];

    const leaves = buildMerkleLeaves(payload);
    const merkleRoot = buildMerkleRoot(leaves);
    const signature = signRoot(merkleRoot);

    const hkd = {
      version: '0.2.1',
      type: 'HKD',
      merkleRoot,
      signature,
      publicKey: exportPublicKey(),
      payload,
      exportedAt: '2026-04-22T00:03:00.000Z',
    };

    expect(hkd.type).toBe('HKD');
    expect(hkd.payload).toHaveLength(3);
    expect(hkd.payload[1].proofLabel).toBe('BROADCAST_PROOF');
    expect(verifyRoot(hkd.merkleRoot, hkd.signature)).toBe(true);
  });
});
