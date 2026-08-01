import { AuthError } from "next-auth";
import { headers } from "next/headers";

import { signIn } from "@/auth";
import { writeAccessAudit } from "@/lib/access-audit";
import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/permissions";
import { postLoginPath } from "@/lib/post-login-path";
import { canRequestMagicLink } from "@/lib/membership-requests";
import {
  allowMagicLinkRequest,
  clientIpFromHeaders,
} from "@/lib/rate-limit";
import { Button } from "@/components/ui/button";

async function resolvePostLoginRedirect(email: string, fallback: string) {
  // Explicit deep-links (e.g. /profile) stay as requested.
  if (fallback && fallback !== "/dashboard") return fallback;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return postLoginPath(user?.role, fallback);
}

type AuthEmailFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  callbackUrl?: string;
};

/** Password login is for local/E2E only — not shown on Vercel Preview/Production. */
function passwordLoginEnabled() {
  return process.env.AUTH_ENABLE_PASSWORD_LOGIN === "1";
}

export function AuthEmailForm({
  title,
  subtitle,
  submitLabel,
  callbackUrl = "/dashboard",
}: AuthEmailFormProps) {
  const showPassword = passwordLoginEnabled();

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#C8A24D]/40 bg-[#1F1F23]/95 p-6 text-[#F4F1EB] shadow-xl backdrop-blur-sm sm:p-7">
      <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h1>
      <p className="mt-1.5 text-sm leading-snug text-[#F4F1EB]/75">{subtitle}</p>

      <form
        className="mt-5 flex flex-col gap-3"
        action={async (formData) => {
          "use server";
          const email = normalizeEmail(String(formData.get("email") ?? ""));
          if (!email) return;

          const hdrs = await headers();
          const ip = clientIpFromHeaders(hdrs);
          const rateOk = allowMagicLinkRequest(email, ip);
          const allowed = rateOk && (await canRequestMagicLink(email));

          if (!allowed) {
            await writeAccessAudit({
              action: "magic_link_denied",
              targetEmail: email,
              metadata: { reason: rateOk ? "not_approved" : "rate_limited" },
            });
            const { redirect } = await import("next/navigation");
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
              const { redirect } = await import("next/navigation");
              redirect(`/auth/error?error=${error.type}`);
            }
            throw error;
          }
        }}
      >
        <label className="flex flex-col gap-2 text-sm">
          <span>E-Mail</span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@example.com"
            className="h-9 rounded-lg border border-[#C8A24D]/50 bg-[#121216] px-3 py-2 text-sm text-[#F4F1EB] outline-none ring-[#C8A24D] focus:ring-2"
          />
        </label>
        <Button
          type="submit"
          className="bg-[#C8A24D] text-[#1F1F23] hover:bg-[#d4b35e]"
        >
          {submitLabel}
        </Button>
        <p className="text-xs text-[#F4F1EB]/60">
          Noch kein Zugang?{" "}
          <a
            href="/auth/sign-up"
            className="text-[#C8A24D] underline-offset-2 hover:underline"
          >
            Mitgliedschaft beantragen
          </a>
        </p>
      </form>

      {showPassword ? (
        <>
          <div className="my-6 border-t border-[#C8A24D]/30" />
          <p className="text-sm text-[#F4F1EB]/75">
            Dev/E2E: Passwort-Login
          </p>
          <form
            className="mt-3 flex flex-col gap-4"
            action={async (formData) => {
              "use server";
              if (!passwordLoginEnabled()) return;

              const email = String(formData.get("email") ?? "")
                .trim()
                .toLowerCase();
              const password = String(formData.get("password") ?? "");
              if (!email || !password) return;

              try {
                const redirectTo = await resolvePostLoginRedirect(
                  email,
                  callbackUrl,
                );
                await signIn("credentials", {
                  email,
                  password,
                  redirectTo,
                });
              } catch (error) {
                if (error instanceof AuthError) {
                  const { redirect } = await import("next/navigation");
                  redirect(`/auth/error?error=${error.type}`);
                }
                throw error;
              }
            }}
          >
            <label className="flex flex-col gap-2 text-sm">
              <span>E-Mail</span>
              <input
                required
                type="email"
                name="email"
                autoComplete="username"
                placeholder="name@example.com"
                className="h-9 rounded-lg border border-[#C8A24D]/50 bg-[#121216] px-3 py-2 text-sm text-[#F4F1EB] outline-none ring-[#C8A24D] focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span>Passwort</span>
              <input
                required
                type="password"
                name="password"
                autoComplete="current-password"
                className="h-9 rounded-lg border border-[#C8A24D]/50 bg-[#121216] px-3 py-2 text-sm text-[#F4F1EB] outline-none ring-[#C8A24D] focus:ring-2"
              />
            </label>
            <Button
              type="submit"
              variant="outline"
              className="border-[#C8A24D] text-[#F4F1EB]"
            >
              Anmelden
            </Button>
          </form>
        </>
      ) : null}
    </div>
  );
}
