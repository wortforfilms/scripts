"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { buildMerkleLeaves, buildMerkleRoot, sha256, verifyRoot } from "@/lib/proof-client";

type HkdFile = {
  merkleRoot?: string;
  signature?: string;
  publicKey?: string;
  payload?: Array<Record<string, unknown>>;
};

type LayerNode = {
  hash: string;
  fromLeafRange: [number, number];
};

function buildLayerObjects(leaves: string[]) {
  if (leaves.length === 0) {
    return [[{ hash: sha256(""), fromLeafRange: [0, 0] as [number, number] }]];
  }

  let current: LayerNode[] = leaves.map((hash, index) => ({
    hash,
    fromLeafRange: [index, index]
  }));

  const layers: LayerNode[][] = [current];

  while (current.length > 1) {
    const next: LayerNode[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = current[i + 1] ?? current[i];
      next.push({
        hash: sha256(`${left.hash}:${right.hash}`),
        fromLeafRange: [left.fromLeafRange[0], right.fromLeafRange[1]]
      });
    }
    layers.push(next);
    current = next;
  }

  return layers;
}

function isInPath(range: [number, number], selectedIndex: number | null) {
  if (selectedIndex === null) return false;
  return selectedIndex >= range[0] && selectedIndex <= range[1];
}

export default function VerifyPage() {
  const [hkd, setHkd] = useState<HkdFile | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeLayer, setActiveLayer] = useState(-1);
  const [status, setStatus] = useState<{ rootMatches: boolean; signatureValid: boolean } | null>(null);

  const payload = hkd?.payload ?? [];
  const leaves = useMemo(() => buildMerkleLeaves(payload), [payload]);
  const layers = useMemo(() => buildLayerObjects(leaves), [leaves]);
  const recomputedRoot = useMemo(() => buildMerkleRoot(leaves), [leaves]);

  useEffect(() => {
    async function recomputeStatus() {
      if (!hkd) {
        setStatus(null);
        return;
      }

      const rootMatches = hkd.merkleRoot === buildMerkleRoot(buildMerkleLeaves(hkd.payload ?? []));
      const signatureValid =
        Boolean(hkd.signature && hkd.merkleRoot && hkd.publicKey) &&
        (await verifyRoot(hkd.merkleRoot!, hkd.signature!, hkd.publicKey!));

      setStatus({ rootMatches, signatureValid });
    }

    void recomputeStatus();
  }, [hkd]);

  async function onFileChange(file?: File | null) {
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text) as HkdFile;
    setHkd(parsed);
    setSelectedIndex(null);
    setActiveLayer(-1);
  }

  function startTraversal(index: number) {
    setSelectedIndex(index);
    setActiveLayer(0);
    let currentLayer = 0;
    const interval = setInterval(() => {
      currentLayer += 1;
      setActiveLayer(currentLayer);
      if (currentLayer >= layers.length - 1) {
        clearInterval(interval);
      }
    }, 350);
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-300">External HKD Verifier</h1>
          <p className="mt-2 text-white/60">Load an HKD file, verify its Merkle root and signature, then animate any proof path from leaf to root.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <label className="block text-sm text-white/70">Load HKD file</label>
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => void onFileChange(e.target.files?.[0])}
            className="mt-3 block w-full rounded-xl border border-white/10 bg-black/40 p-3"
          />
        </div>

        {hkd ? (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-white/50">Uploaded Root</div>
                <div className="mt-2 break-all font-mono text-sm text-white">{hkd.merkleRoot ?? "Unavailable"}</div>
                <div className="mt-4 text-sm text-white/50">Recomputed Root</div>
                <div className="mt-2 break-all font-mono text-sm text-white">{recomputedRoot}</div>
                <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs ${status?.rootMatches ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}`}>
                  {status?.rootMatches ? "Hash Check Passed" : "Hash Check Failed"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-white/50">Signature</div>
                <div className="mt-2 break-all font-mono text-sm text-white">{hkd.signature ?? "Unavailable"}</div>
                <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs ${status?.signatureValid ? "bg-emerald-500/10 text-emerald-300" : "bg-yellow-500/10 text-yellow-300"}`}>
                  {status?.signatureValid ? "Signature Verified" : "Signature Unavailable / Invalid"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-white/50">Traversal Status</div>
              <div className="mt-2 text-xs text-yellow-300/80">
                {selectedIndex !== null
                  ? `Traversing leaf #${selectedIndex} • current layer ${Math.max(activeLayer, 0)} / ${Math.max(layers.length - 1, 0)}`
                  : "Select a payload item below to animate its proof path."}
              </div>
            </div>

            <div className="space-y-5">
              {layers.map((layer, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 text-sm font-semibold text-yellow-300">Layer {idx} • {layer.length} node(s)</div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {layer.map((node, nodeIdx) => {
                      const inPath = isInPath(node.fromLeafRange, selectedIndex);
                      const highlighted = inPath && idx <= activeLayer;
                      const future = inPath && idx > activeLayer;

                      return (
                        <motion.div
                          key={`${idx}-${nodeIdx}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: highlighted ? 1.05 : future ? 1.01 : 1,
                            boxShadow: highlighted
                              ? "0 0 0 1px rgba(250,204,21,0.4), 0 0 28px rgba(250,204,21,0.22)"
                              : future
                                ? "0 0 0 1px rgba(250,204,21,0.16)"
                                : "0 0 0 1px rgba(255,255,255,0.04)"
                          }}
                          transition={{ duration: 0.25 }}
                          className={`rounded-xl p-3 ${highlighted ? "bg-yellow-400/12" : future ? "bg-yellow-400/5" : "bg-black/40"}`}
                        >
                          <div className="text-xs text-white/40">Node {nodeIdx}</div>
                          <div className="mt-1 break-all font-mono text-xs text-white/85">{node.hash}</div>
                          <div className="mt-2 text-[11px] text-yellow-300/80">Leaves {node.fromLeafRange[0]} → {node.fromLeafRange[1]}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 text-lg font-semibold text-white">Payload Leaves</div>
              <div className="space-y-2">
                {payload.map((event, index) => (
                  <button
                    key={index}
                    onClick={() => startTraversal(index)}
                    className={`block w-full rounded-xl border p-3 text-left transition ${selectedIndex === index ? "border-yellow-400/50 bg-yellow-400/10" : "border-white/10 bg-black/40 hover:border-yellow-400/40 hover:bg-black/50"}`}
                  >
                    <div className="text-sm font-medium text-white">{String(event.type ?? `event-${index}`)}</div>
                    <div className="text-xs text-white/50">{String(event.time ?? "unknown time")}</div>
                    <div className="mt-1 font-mono text-xs text-yellow-300/80">{leaves[index]}</div>
                    <div className="mt-2 text-[11px] text-white/45">Click to animate this proof path</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
