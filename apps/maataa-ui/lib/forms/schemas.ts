export type FormParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function stringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export type SignInForm = {
  sessionToken: string;
  nextPath: string;
};

export type CredentialSignInForm = {
  email: string;
  password: string;
  nextPath: string;
};

export type SignupForm = CredentialSignInForm & {
  name: string;
  selectedScript?: string;
};

export function parseSignInForm(formData: FormData): FormParseResult<SignInForm> {
  const sessionToken = stringField(formData, "sessionToken");
  const nextPath = stringField(formData, "next");
  if (!sessionToken) return { ok: false, error: "A signed session token is required" };
  if (sessionToken.split(".").length !== 3) return { ok: false, error: "Session token must be a compact JWT" };
  return { ok: true, value: { sessionToken, nextPath: nextPath.startsWith("/") ? nextPath : "/dashboard" } };
}

function nextPathFrom(formData: FormData) {
  const nextPath = stringField(formData, "next");
  return nextPath.startsWith("/") ? nextPath : "/dashboard";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseCredentialSignInForm(formData: FormData): FormParseResult<CredentialSignInForm> {
  const email = stringField(formData, "email").toLowerCase();
  const password = stringField(formData, "password");
  if (!isEmail(email)) return { ok: false, error: "A valid email is required" };
  if (!password) return { ok: false, error: "Password is required" };
  return { ok: true, value: { email, password, nextPath: nextPathFrom(formData) } };
}

export function parseSignupForm(formData: FormData): FormParseResult<SignupForm> {
  const email = stringField(formData, "email").toLowerCase();
  const name = stringField(formData, "name");
  const password = stringField(formData, "password");
  const selectedScript = stringField(formData, "selectedScript");
  if (!name) return { ok: false, error: "Name is required" };
  if (!isEmail(email)) return { ok: false, error: "A valid email is required" };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters" };
  return {
    ok: true,
    value: {
      email,
      name,
      password,
      nextPath: nextPathFrom(formData),
      selectedScript: selectedScript || undefined
    }
  };
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
