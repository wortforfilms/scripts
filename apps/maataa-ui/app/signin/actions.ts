"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseCredentialSignInForm, parseSignInForm, parseSignupForm } from "../../lib/forms/schemas";
import type { AccessViewer } from "../../lib/access/types";
import { authenticateWithPassword, createAuthUser } from "../../lib/auth/auth-db";
import { createSessionToken, SESSION_COOKIE_NAME, verifySessionToken } from "../../lib/auth/session";

async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

async function tokenForViewer(viewer: AccessViewer) {
  if (!viewer.id) throw new Error("Cannot create a session for a guest viewer");
  return createSessionToken({
    sub: viewer.id,
    accountId: viewer.accountId ?? undefined,
    accountType: viewer.accountType ?? undefined,
    accountRole: viewer.accountRole ?? undefined,
    role: viewer.role,
    plan: viewer.plan,
    permissions: viewer.permissions
  });
}

export async function signInWithCredentials(formData: FormData) {
  const parsed = parseCredentialSignInForm(formData);
  if (!parsed.ok) redirect(`/signin?error=${encodeURIComponent(parsed.error)}`);
  const result = await authenticateWithPassword(parsed.value);
  if (!result) redirect("/signin?error=Invalid%20email%20or%20password");
  await setSessionCookie(await tokenForViewer(result.viewer));
  redirect(parsed.value.nextPath);
}

export async function signUpWithCredentials(formData: FormData) {
  const parsed = parseSignupForm(formData);
  if (!parsed.ok) redirect(`/signup?error=${encodeURIComponent(parsed.error)}`);
  let redirectPath = parsed.value.nextPath;
  try {
    const result = await createAuthUser(parsed.value);
    await setSessionCookie(await tokenForViewer(result.viewer));
    redirectPath = parsed.value.nextPath;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create account";
    redirect(`/signup?error=${encodeURIComponent(message)}`);
  }
  redirect(redirectPath);
}

export async function signInWithSessionToken(formData: FormData) {
  const parsed = parseSignInForm(formData);
  if (!parsed.ok) redirect(`/signin?error=${encodeURIComponent(parsed.error)}`);

  const viewer = await verifySessionToken(parsed.value.sessionToken);
  if (!viewer) redirect("/signin?error=Invalid%20or%20expired%20session%20token");

  await setSessionCookie(parsed.value.sessionToken);
  redirect(parsed.value.nextPath);
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  redirect("/signin");
}
