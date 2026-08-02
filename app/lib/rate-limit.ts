type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfterMs: 0,
  };
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Relax IP buckets in CI / local E2E (many tests share 127.0.0.1). */
function e2eRelaxedIpLimits(): boolean {
  return (
    process.env.CI === "true" ||
    process.env.AUTH_ENABLE_PASSWORD_LOGIN === "1"
  );
}

/** Magic-link: 5 / 15 min per email, 20 / 15 min per IP */
export function allowMagicLinkRequest(email: string, ip: string): boolean {
  const windowMs = 15 * 60 * 1000;
  const emailOk = checkRateLimit(`magic:email:${email}`, 5, windowMs).allowed;
  const ipLimit = e2eRelaxedIpLimits() ? 1000 : 20;
  const ipOk = checkRateLimit(`magic:ip:${ip}`, ipLimit, windowMs).allowed;
  return emailOk && ipOk;
}

/** Membership request: 3 / hour per email, 10 / hour per IP */
export function allowMembershipRequest(email: string, ip: string): boolean {
  const windowMs = 60 * 60 * 1000;
  const emailOk = checkRateLimit(`membership:email:${email}`, 3, windowMs).allowed;
  const ipLimit = e2eRelaxedIpLimits() ? 1000 : 10;
  const ipOk = checkRateLimit(`membership:ip:${ip}`, ipLimit, windowMs).allowed;
  return emailOk && ipOk;
}
