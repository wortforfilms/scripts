"use client";

import { useState } from "react";

type AnchorResult = {
  merkleRoot?: string;
  ipfsCid?: string;
  txHash?: string;
  chainId?: string;
  note?: string;
  badgeStatus?: string;
};

export default function AnchorPage() {
  const [payloadText, setPayloadText] = useState("[]");
  const [ipfs, setIpfs] = useState<AnchorResult | null>(null);
  const [anchor, setAnchor] = useState<AnchorResult | null>(null);
  const [badge, setBadge] = useState<AnchorResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function prepareIpfs() {
    setLoading("ipfs");
    try {
      const payload = JSON.parse(payloadText);
      const res = await fetch("/api/proof/ipfs/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload })
      });
      setIpfs(await res.json());
      setAnchor(null);
      setBadge(null);
    } finally {
      setLoading(null);
    }
  }

  async function prepareAnchor() {
    if (!ipfs?.merkleRoot) return;
    setLoading("anchor");
    try {
      const res = await fetch("/api/proof/anchor/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merkleRoot: ipfs.merkleRoot })
      });
      setAnchor(await res.json());
      setBadge(null);
    } finally {
      setLoading(null);
    }
  }

  async function createBadge() {
    setLoading("badge");
    try {
      const record = {
        merkleRoot: ipfs?.merkleRoot,
        ipfsCid: ipfs?.ipfsCid,
        txHash: anchor?.txHash,
        chainId: anchor?.chainId,
        signature: "present"
      };
      const res = await fetch("/api/proof/badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      });
      setBadge(await res.json());
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-300">Anchor Flow</h1>
          <p className="mt-2 text-white/60">Prepare an HKD payload for IPFS, chain anchoring, and badge issuance.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <label className="mb-3 block text-sm text-white/70">Payload JSON</label>
          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="min-h-[180px] w-full rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm text-white outline-none"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={prepareIpfs} disabled={loading !== null} className="rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-black disabled:opacity-50">
              {loading === "ipfs" ? "Preparing IPFS..." : "Prepare IPFS"}
            </button>
            <button onClick={prepareAnchor} disabled={!ipfs?.merkleRoot || loading !== null} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white disabled:opacity-50">
              {loading === "anchor" ? "Preparing Anchor..." : "Prepare Chain Anchor"}
            </button>
            <button onClick={createBadge} disabled={!anchor?.txHash || loading !== null} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white disabled:opacity-50">
              {loading === "badge" ? "Creating Badge..." : "Create Badge"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-yellow-300">IPFS Prepare</div>
            <pre className="mt-3 overflow-auto rounded-xl bg-black/40 p-3 text-xs text-white/80">{JSON.stringify(ipfs, null, 2)}</pre>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-yellow-300">Chain Anchor</div>
            <pre className="mt-3 overflow-auto rounded-xl bg-black/40 p-3 text-xs text-white/80">{JSON.stringify(anchor, null, 2)}</pre>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-yellow-300">Badge</div>
            <pre className="mt-3 overflow-auto rounded-xl bg-black/40 p-3 text-xs text-white/80">{JSON.stringify(badge, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
