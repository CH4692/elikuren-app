import { normalizeEmail } from "@/lib/permissions";
import { isProductionEnv } from "@/lib/site-url";

export type EmailKind = "transactional" | "magic-link";

/** transactional may redirect; magic-link never uses EMAIL_REDIRECT_TO. */
export function resolveOutboundRecipient(options: {
  to: string;
  kind: EmailKind;
  redirectTo?: string | null;
}): { to: string; redirected: boolean } {
  const original = normalizeEmail(options.to);
  if (options.kind === "magic-link") {
    return { to: original, redirected: false };
  }
  const redirect = options.redirectTo?.trim();
  if (redirect) {
    return { to: normalizeEmail(redirect), redirected: true };
  }
  return { to: original, redirected: false };
}

export function parseEmailAllowlist(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((part) => normalizeEmail(part))
      .filter(Boolean),
  );
}

/**
 * Production always allows.
 * Non-production: if EMAIL_AUTH_ALLOWED_RECIPIENTS is unset/empty, allow all
 * (opt-in restriction). If set, only listed addresses may receive magic links.
 * Magic links are never redirected via EMAIL_REDIRECT_TO.
 */
export function isMagicLinkRecipientAllowed(
  recipient: string,
  allowlistRaw: string | undefined = process.env.EMAIL_AUTH_ALLOWED_RECIPIENTS,
  production: boolean = isProductionEnv(),
): boolean {
  if (production) return true;
  if (!allowlistRaw?.trim()) return true;
  const allowlist = parseEmailAllowlist(allowlistRaw);
  return allowlist.has(normalizeEmail(recipient));
}

/** Detect logs that accidentally include magic-link secrets. */
export function logPayloadLooksSafe(
  payload: Record<string, unknown>,
): boolean {
  const serialized = JSON.stringify(payload);
  if (/token=/i.test(serialized)) return false;
  if (/\/api\/auth\/callback\//i.test(serialized)) return false;
  if (/callbackUrl=/i.test(serialized)) return false;
  return true;
}
