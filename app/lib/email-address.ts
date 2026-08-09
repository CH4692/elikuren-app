import { normalizeEmail } from "@/lib/permissions";

/** Practical format check — requires local@domain.tld (dot in domain). */
const EMAIL_FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.de",
  "outlook.com",
  "outlook.de",
  "live.com",
  "live.de",
  "icloud.com",
  "me.com",
  "mac.com",
  "yahoo.com",
  "yahoo.de",
  "web.de",
  "gmx.de",
  "gmx.net",
  "gmx.com",
  "t-online.de",
  "freenet.de",
  "posteo.de",
  "proton.me",
  "protonmail.com",
  "mail.de",
  "aol.com",
  "example.com",
] as const;

export type EmailAddressCheck = {
  normalized: string;
  ok: boolean;
  error: string | null;
  /** Full suggested address when the domain looks like a common typo. */
  suggestion: string | null;
};

export function isEmailFormatValid(email: string): boolean {
  if (!email || email.length > 254) return false;
  if (!EMAIL_FORMAT_RE.test(email)) return false;
  const [local, domain] = email.split("@");
  if (!local || !domain) return false;
  if (local.length > 64) return false;
  if (email.includes("..")) return false;
  return true;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]!;
  }
  return prev[b.length]!;
}

/** Suggest a corrected domain for common typos (e.g. gmial.com → gmail.com). */
export function suggestEmailDomain(domain: string): string | null {
  const d = domain.trim().toLowerCase();
  if (!d) return null;
  if ((COMMON_EMAIL_DOMAINS as readonly string[]).includes(d)) return null;

  let best: string | null = null;
  let bestDistance = Infinity;

  for (const candidate of COMMON_EMAIL_DOMAINS) {
    // Skip very short domains unless lengths are close (avoids noisy matches).
    if (Math.abs(candidate.length - d.length) > 2) continue;
    const distance = levenshtein(d, candidate);
    const maxDistance = d.length <= 5 ? 1 : 2;
    if (distance > 0 && distance <= maxDistance && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

export function suggestEmailAddress(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!isEmailFormatValid(normalized)) return null;
  const at = normalized.lastIndexOf("@");
  if (at < 0) return null;
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const suggestedDomain = suggestEmailDomain(domain);
  if (!suggestedDomain) return null;
  return `${local}@${suggestedDomain}`;
}

/**
 * Normalize + format-validate an email, with optional typo suggestion.
 * Suggestion is informational and does not fail the check by itself.
 */
export function checkEmailAddress(raw: string): EmailAddressCheck {
  const normalized = normalizeEmail(raw);
  if (!normalized) {
    return {
      normalized: "",
      ok: false,
      error: "Bitte E-Mail eingeben.",
      suggestion: null,
    };
  }
  if (!isEmailFormatValid(normalized)) {
    return {
      normalized,
      ok: false,
      error: "Bitte eine gültige E-Mail-Adresse eingeben.",
      suggestion: null,
    };
  }
  return {
    normalized,
    ok: true,
    error: null,
    suggestion: suggestEmailAddress(normalized),
  };
}
