"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { checkEmailAddress } from "@/lib/email-address";
import { prisma } from "@/lib/db";
import { postLoginPath } from "@/lib/post-login-path";
import { canRequestMagicLink } from "@/lib/membership-requests";
import {
  allowMagicLinkRequest,
  clientIpFromHeaders,
} from "@/lib/rate-limit";

function passwordLoginEnabled() {
  return process.env.AUTH_ENABLE_PASSWORD_LOGIN === "1";
}

async function resolvePostLoginRedirect(email: string, fallback: string) {
  if (fallback && fallback !== "/dashboard") return fallback;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return postLoginPath(user?.role, fallback);
}

export type AuthEmailActionResult =
  | { ok: true }
  | { ok: false; error: string; suggestion?: string | null };

export async function requestMagicLinkAction(
  formData: FormData,
): Promise<AuthEmailActionResult> {
  const checked = checkEmailAddress(String(formData.get("email") ?? ""));
  if (!checked.ok) {
    return {
      ok: false,
      error: checked.error ?? "Bitte eine gültige E-Mail-Adresse eingeben.",
      suggestion: checked.suggestion,
    };
  }

  const email = checked.normalized;
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");

  const hdrs = await headers();
  const ip = clientIpFromHeaders(hdrs);
  const rateOk = allowMagicLinkRequest(email, ip);
  const allowed = rateOk && (await canRequestMagicLink(email));

  if (!allowed) {
    redirect("/auth/error?error=AccessDenied");
  }

  try {
    const redirectTo = await resolvePostLoginRedirect(email, callbackUrl);
    await signIn("resend", {
      email,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/auth/error?error=${error.type}`);
    }
    throw error;
  }

  return { ok: true };
}

export async function requestPasswordSignInAction(
  formData: FormData,
): Promise<AuthEmailActionResult> {
  if (!passwordLoginEnabled()) {
    return { ok: false, error: "Passwort-Login ist nicht aktiviert." };
  }

  const checked = checkEmailAddress(String(formData.get("email") ?? ""));
  if (!checked.ok) {
    return {
      ok: false,
      error: checked.error ?? "Bitte eine gültige E-Mail-Adresse eingeben.",
      suggestion: checked.suggestion,
    };
  }

  const email = checked.normalized;
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");
  if (!password) {
    return { ok: false, error: "Bitte Passwort eingeben." };
  }

  try {
    const redirectTo = await resolvePostLoginRedirect(email, callbackUrl);
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/auth/error?error=${error.type}`);
    }
    throw error;
  }

  return { ok: true };
}
