export type FormParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function stringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export type SignInForm = {
  sessionToken: string;
  nextPath: string;
};

export function parseSignInForm(formData: FormData): FormParseResult<SignInForm> {
  const sessionToken = stringField(formData, "sessionToken");
  const nextPath = stringField(formData, "next");
  if (!sessionToken) return { ok: false, error: "A signed session token is required" };
  if (sessionToken.split(".").length !== 3) return { ok: false, error: "Session token must be a compact JWT" };
  return { ok: true, value: { sessionToken, nextPath: nextPath.startsWith("/") ? nextPath : "/dashboard" } };
}

export type GenerateSkuForm = {
  title: string;
  description?: string;
  amountInPaise: number;
};

export function parseGenerateSkuForm(formData: FormData): FormParseResult<GenerateSkuForm> {
  const title = stringField(formData, "title");
  const description = stringField(formData, "description");
  const amount = Number(stringField(formData, "amountInPaise"));
  if (!title) return { ok: false, error: "Title is required" };
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, error: "Amount must be a positive integer in paise" };
  return { ok: true, value: { title, description: description || undefined, amountInPaise: amount } };
}

export type CheckoutRequest = {
  skuIds: string[];
  acceptedLegal: boolean;
};

export function parseCheckoutRequest(input: unknown): FormParseResult<CheckoutRequest> {
  const body = input as { skuIds?: unknown; acceptedLegal?: unknown };
  if (!Array.isArray(body.skuIds) || body.skuIds.some((sku) => typeof sku !== "string")) {
    return { ok: false, error: "Cart contains invalid SKU ids" };
  }
  if (body.skuIds.length === 0) return { ok: false, error: "Cart is empty" };
  if (body.acceptedLegal !== true) return { ok: false, error: "Terms, Refund Policy, and Digital License must be accepted" };
  return { ok: true, value: { skuIds: body.skuIds, acceptedLegal: body.acceptedLegal } };
}
