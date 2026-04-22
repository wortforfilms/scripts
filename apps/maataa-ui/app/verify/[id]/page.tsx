"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PublicVerifyPage() {
  const params = useParams();
  const id = params?.id as string;
  const [record, setRecord] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/public/verify/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Verification record not found");
        return r.json();
      })
      .then(setRecord)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return <div className="min-h-screen bg-black p-6 text-white">{error}</div>;
  }

  if (!record) {
    return <div className="min-h-screen bg-black p-6 text-white">Loading public verification...</div>;
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-300">Public Verification</h1>
          <p className="mt-2 text-white/60">Shareable proof record for independent verification.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/50">Record ID</div>
            <div className="mt-2 font-mono text-sm text-white">{record.id}</div>
            <div className="mt-4 text-sm text-white/50">Anchor Status</div>
            <div className="mt-2 inline-flex rounded-full bg-yellow-500/10 px-3 py-1 text-sm text-yellow-300">
              {record.anchorStatus}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/50">Created At</div>
            <div className="mt-2 text-sm text-white">{record.createdAt}</div>
            <div className="mt-4 text-sm text-white/50">Chain</div>
            <div className="mt-2 text-sm text-white">{record.chainId ?? "Not anchored"}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/50">Merkle Root</div>
          <div className="mt-2 break-all font-mono text-sm text-white">{record.merkleRoot}</div>
          <div className="mt-4 text-sm text-white/50">IPFS CID</div>
          <div className="mt-2 break-all font-mono text-sm text-white">{record.ipfsCid ?? "Unavailable"}</div>
          <div className="mt-4 text-sm text-white/50">Transaction Hash</div>
          <div className="mt-2 break-all font-mono text-sm text-white">{record.txHash ?? "Unavailable"}</div>
        </div>
      </div>
    </div>
  );
}
