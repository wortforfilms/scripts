import type { AccessViewer, UserPlan, UserRole } from "../access/types";

export const SESSION_COOKIE_NAME = "maataa_session";

type SessionPayload = {
  sub: string;
  role?: UserRole;
  plan?: UserPlan;
  permissions?: string[];
  exp?: number;
  iss?: string;
  aud?: string;
};

function base64UrlEncode(bytes: Uint8Array | string) {
  const binary = typeof bytes === "string" ? bytes : String.fromCharCode(...bytes);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function hmacSha256(data: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function normalizePayload(payload: SessionPayload): AccessViewer {
  return {
    id: payload.sub,
    role: payload.role ?? "USER",
    plan: payload.plan ?? "FREE",
    permissions: payload.permissions ?? [],
    isLoggedIn: true
  };
}

export async function verifySessionToken(token: string | undefined, secret = process.env.AUTH_SESSION_SECRET): Promise<AccessViewer | null> {
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signature] = parts;
  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerPart))) as { alg?: string; typ?: string };
  if (header.alg !== "HS256" || header.typ !== "JWT") return null;

  const expected = base64UrlEncode(await hmacSha256(`${headerPart}.${payloadPart}`, secret));
  if (!safeEqual(expected, signature)) return null;

  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadPart))) as SessionPayload;
  if (!payload.sub) return null;
  if (payload.exp && payload.exp <= Math.floor(Date.now() / 1000)) return null;
  if (process.env.AUTH_SESSION_ISSUER && payload.iss !== process.env.AUTH_SESSION_ISSUER) return null;
  if (process.env.AUTH_SESSION_AUDIENCE && payload.aud !== process.env.AUTH_SESSION_AUDIENCE) return null;
  return normalizePayload(payload);
}

export async function createSessionTokenForTests(payload: SessionPayload, secret: string) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode(await hmacSha256(`${header}.${body}`, secret));
  return `${header}.${body}.${signature}`;
}
