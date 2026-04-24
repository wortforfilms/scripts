"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseSignInForm } from "../../lib/forms/schemas";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../lib/auth/session";

export async function signInWithSessionToken(formData: FormData) {
  const parsed = parseSignInForm(formData);
  if (!parsed.ok) redirect(`/signin?error=${encodeURIComponent(parsed.error)}`);

  const viewer = await verifySessionToken(parsed.value.sessionToken);
  if (!viewer) redirect("/signin?error=Invalid%20or%20expired%20session%20token");

  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, parsed.value.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  redirect(parsed.value.nextPath);
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  redirect("/signin");
}
