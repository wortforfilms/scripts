export type UpiPaymentIntent = {
  mode: "manual-upi";
  providerOrderId: string;
  reference: string;
  payeeVpa: string;
  payeeName: string;
  amountInPaise: number;
  currency: "INR";
  upiUri: string;
};

function configuredPayee() {
  const payeeVpa = process.env.UPI_PAYEE_VPA?.trim();
  const payeeName = process.env.UPI_PAYEE_NAME?.trim() || "Maataa Scripts";
  if (!payeeVpa) throw new Error("UPI_PAYEE_VPA is required for UPI checkout");
  if (!/^[a-z0-9.\-_]{2,256}@[a-z][a-z0-9.\-_]{2,64}$/i.test(payeeVpa)) throw new Error("UPI_PAYEE_VPA is not a valid VPA");
  return { payeeVpa, payeeName };
}

export function createUpiPaymentIntent(input: {
  amountInPaise: number;
  currency: string;
  orderId?: string;
  note?: string;
}): UpiPaymentIntent {
  if (input.currency !== "INR") throw new Error("UPI checkout only supports INR");
  if (!Number.isInteger(input.amountInPaise) || input.amountInPaise <= 0) throw new Error("UPI amount must be positive paise");
  const { payeeVpa, payeeName } = configuredPayee();
  const providerOrderId = input.orderId ?? `upi_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`;
  const reference = `MAATAA-${providerOrderId.replace(/^upi_/, "").slice(0, 18).toUpperCase()}`;
  const params = new URLSearchParams({
    pa: payeeVpa,
    pn: payeeName,
    am: (input.amountInPaise / 100).toFixed(2),
    cu: "INR",
    tr: reference,
    tn: input.note ?? `Maataa order ${reference}`
  });
  const merchantCode = process.env.UPI_MERCHANT_CODE?.trim();
  if (merchantCode) params.set("mc", merchantCode);

  return {
    mode: "manual-upi",
    providerOrderId,
    reference,
    payeeVpa,
    payeeName,
    amountInPaise: input.amountInPaise,
    currency: "INR",
    upiUri: `upi://pay?${params.toString()}`
  };
}
