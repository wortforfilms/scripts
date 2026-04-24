import { ProofInspector } from "@/components/proof-inspector";

export default function ProofInspectorPage() {
  return (
    <ProofInspector
      title="Proof Inspector"
      subtitle="Inspect HKD payloads, verify their signatures, and replay proof traversal from any leaf to the Merkle root."
    />
  );
}
