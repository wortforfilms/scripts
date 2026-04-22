"use client";

import { useState } from "react";

type BadgeStatus = "UNVERIFIED" | "SIGNED" | "IPFS_STORED" | "CHAIN_ANCHORED" | "FULLY_VERIFIED";

const styles: Record<BadgeStatus, string> = {
  UNVERIFIED: "bg-gray-500/10 text-gray-300",
  SIGNED: "bg-blue-500/10 text-blue-300",
  IPFS_STORED: "bg-yellow-500/10 text-yellow-300",
  CHAIN_ANCHORED: "bg-purple-500/10 text-purple-300",
  FULLY_VERIFIED: "bg-emerald-500/10 text-emerald-300"
};

export default function BadgePage() {
  const [status, setStatus] = useState<BadgeStatus>("UNVERIFIED");

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <h1 className="text-3xl font-bold text-yellow-300">Verification Badge</h1>
        <p className="text-white/60">Visual representation of proof trust level.</p>

        <div className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-lg font-semibold ${styles[status]}`}>
          {status}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {(Object.keys(styles) as BadgeStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
