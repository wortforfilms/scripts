"use client";

import React, { useMemo, useState } from "react";
import type { CatalogSku } from "../../lib/catalog-db";

type CheckoutClientProps = {
  skus: CatalogSku[];
};

export function CheckoutClient({ skus }: CheckoutClientProps) {
  const [selectedSkuIds, setSelectedSkuIds] = useState<string[]>(skus[0] ? [skus[0].id] : []);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "UPI_MANUAL">("RAZORPAY");
  const [status, setStatus] = useState<string | null>(null);
  const [upiIntent, setUpiIntent] = useState<{
    upiUri: string;
    reference: string;
    payeeVpa: string;
    payeeName: string;
    amountInPaise: number;
  } | null>(null);
  const selected = useMemo(() => skus.filter((sku) => selectedSkuIds.includes(sku.id)), [skus, selectedSkuIds]);
  const total = selected.reduce((sum, sku) => sum + sku.amountInPaise, 0);

  async function createOrder() {
    setUpiIntent(null);
    setStatus(paymentMethod === "UPI_MANUAL" ? "Creating UPI payment reference..." : "Creating Razorpay test order...");
    const response = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skuIds: selectedSkuIds, acceptedLegal, paymentMethod })
    });
    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      order?: { razorpayOrderId?: string | null; providerOrderId?: string; paymentReference?: string | null };
      razorpay?: { mode: string };
      upi?: {
        upiUri: string;
        reference: string;
        payeeVpa: string;
        payeeName: string;
        amountInPaise: number;
      };
    };
    if (!response.ok) {
      setStatus(payload.error ?? "Checkout failed");
      return;
    }
    if (payload.upi) {
      setUpiIntent(payload.upi);
      setStatus(`${payload.message ?? "UPI order created"} Reference: ${payload.upi.reference}`);
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

      <fieldset className="mt-5 grid gap-3 rounded border border-white/10 bg-black/20 p-4">
        <legend className="px-1 text-sm font-semibold text-white/80">Payment option</legend>
        <label className="flex items-start gap-3 text-sm text-white/75">
          <input
            type="radio"
            className="mt-1"
            checked={paymentMethod === "RAZORPAY"}
            onChange={() => setPaymentMethod("RAZORPAY")}
          />
          <span>
            <strong className="block text-white">Razorpay test mode</strong>
            Webhook verification unlocks access after captured payment.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-white/75">
          <input
            type="radio"
            className="mt-1"
            checked={paymentMethod === "UPI_MANUAL"}
            onChange={() => setPaymentMethod("UPI_MANUAL")}
          />
          <span>
            <strong className="block text-white">Own UPI</strong>
            Creates a UPI intent and reference. Access stays locked until admin/server reconciliation verifies payment.
          </span>
        </label>
      </fieldset>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-white/70">Total: INR {(total / 100).toFixed(2)}</span>
        <button
          className="rounded bg-emerald-400 px-4 py-2 font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
          disabled={selectedSkuIds.length === 0 || !acceptedLegal}
          onClick={createOrder}
          type="button"
        >
          {paymentMethod === "UPI_MANUAL" ? "Create UPI reference" : "Create Razorpay test order"}
        </button>
      </div>
      {status ? <p className="mt-4 text-sm text-white/70">{status}</p> : null}
      {upiIntent ? (
        <div className="mt-4 rounded border border-amber-300/40 bg-amber-300/10 p-4 text-sm text-white/80">
          <p className="font-semibold text-white">UPI payment reference created</p>
          <dl className="mt-3 grid gap-2">
            <div><dt className="text-white/50">Payee</dt><dd>{upiIntent.payeeName}</dd></div>
            <div><dt className="text-white/50">UPI ID</dt><dd>{upiIntent.payeeVpa}</dd></div>
            <div><dt className="text-white/50">Reference</dt><dd>{upiIntent.reference}</dd></div>
            <div><dt className="text-white/50">Amount</dt><dd>INR {(upiIntent.amountInPaise / 100).toFixed(2)}</dd></div>
          </dl>
          <a className="mt-4 inline-flex rounded bg-amber-300 px-4 py-2 font-semibold text-black" href={upiIntent.upiUri}>
            Open UPI app
          </a>
          <p className="mt-3 text-xs text-white/60">
            Keep the reference in the UPI note. This screen is not proof of payment; access unlocks only after server-side verification.
          </p>
        </div>
      ) : null}
    </div>
  );
}
