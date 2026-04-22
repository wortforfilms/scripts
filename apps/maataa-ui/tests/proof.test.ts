import { describe, it, expect } from 'vitest';
import { sha256Hex } from '../lib/proof';

describe('proof: sha256', () => {
  it('generates consistent hash', async () => {
    const input = 'maataa-test';
    const hash1 = await sha256Hex(input);
    const hash2 = await sha256Hex(input);
    expect(hash1).toBe(hash2);
  });
});
