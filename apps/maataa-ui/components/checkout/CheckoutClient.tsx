"use client";

import React, { useMemo, useState } from "react";
import type { CatalogSku } from "../../lib/catalog-db";

type CheckoutClientProps = {
  skus: CatalogSku[];
};

export function CheckoutClient({ skus }: CheckoutClientProps) {
  const [selectedSkuIds, setSelectedSkuIds] = useState<string[]>(skus[0] ? [skus[0].id] : []);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const selected = useMemo(() => skus.filter((sku) => selectedSkuIds.includes(sku.id)), [skus, selectedSkuIds]);
  const total = selected.reduce((sum, sku) => sum + sku.amountInPaise, 0);

  async function createOrder() {
    setStatus("Creating Razorpay test order...");
    const response = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skuIds: selectedSkuIds, acceptedLegal })
    });
    const payload = (await response.json()) as { error?: string; order?: { razorpayOrderId: string }; razorpay?: { mode: string } };
    if (!response.ok) {
      setStatus(payload.error ?? "Checkout failed");
      return;
    }
    setStatus(`Order created: ${payload.order?.razorpayOrderId ?? "pending"} (${payload.razorpay?.mode ?? "test"})`);
  }

  if (skus.length === 0) {
    return <p className="mt-6 rounded border border-white/10 bg-white/5 p-5 text-white/70">No published SKUs are available for checkout.</p>;
  }

  return (
    <div className="mt-6 rounded border border-white/10 bg-white/5 p-5">
      <div className="grid gap-3">
        {skus.map((sku) => (
          <label key={sku.id} className="flex items-start gap-3 rounded border border-white/10 bg-black/20 p-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={selectedSkuIds.includes(sku.id)}
              onChange={(event) => {
                setSelectedSkuIds((current) =>
                  event.target.checked ? [...current, sku.id] : current.filter((id) => id !== sku.id)
                );
              }}
            />
            <span className="flex-1">
              <strong className="block">{sku.title}</strong>
              <span className="text-sm text-white/60">{sku.code}</span>
            </span>
            <span className="text-sm text-white/70">{sku.currency} {(sku.amountInPaise / 100).toFixed(2)}</span>
          </label>
        ))}
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm text-white/80">
        <input checked={acceptedLegal} onChange={(event) => setAcceptedLegal(event.target.checked)} type="checkbox" className="mt-1" />
        <span>I agree to Terms, Refund Policy, and Digital License.</span>
      </label>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-white/70">Total: INR {(total / 100).toFixed(2)}</span>
        <button
          className="rounded bg-emerald-400 px-4 py-2 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
          disabled={selectedSkuIds.length === 0 || !acceptedLegal}
          onClick={createOrder}
          type="button"
        >
          Create Razorpay test order
        </button>
      </div>
      {status ? <p className="mt-4 text-sm text-white/70">{status}</p> : null}
    </div>
  );
}
