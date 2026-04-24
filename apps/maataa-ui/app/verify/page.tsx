import { ProofInspector } from "@/components/proof-inspector";

export default function VerifyPage() {
  return <ProofInspector title="External HKD Verifier" subtitle="Load an HKD file, verify its Merkle root and signature, then animate any proof path from leaf to root." />;
}
