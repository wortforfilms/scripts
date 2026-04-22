import { readAnchorStore } from "@/lib/anchor-store";

export async function GET() {
  const records = await readAnchorStore();
  const latest = records[0] ?? null;

  const affidavit = {
    title: "Section 65B Affidavit Scaffold",
    generatedAt: new Date().toISOString(),
    deponent: {
      name: "<DEONENT_NAME>",
      role: "System Operator",
      organization: "Maataa"
    },
    statement: {
      summary: "This scaffold records the latest available electronic proof package for later legal formatting.",
      deviceContext: "Generated from Maataa proof and anchor records.",
      integrityMethod: "Merkle hashing, signature, persistent anchor record, and public verification endpoint."
    },
    annexures: latest
      ? [
          { label: "Annexure A", type: "Anchor Record", recordId: latest.id },
          { label: "Annexure B", type: "Merkle Root", value: latest.merkleRoot },
          { label: "Annexure C", type: "IPFS CID", value: latest.ipfsCid ?? null },
          { label: "Annexure D", type: "Transaction Hash", value: latest.txHash ?? null },
          { label: "Annexure E", type: "Public Verification URL", value: `/verify/${latest.id}` }
        ]
      : [],
    latestRecord: latest
  };

  return Response.json(affidavit);
}
