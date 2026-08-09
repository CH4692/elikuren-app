"use client";

import { useState, useTransition } from "react";

import {
  requestMagicLinkAction,
  requestPasswordSignInAction,
} from "@/lib/auth-email-actions";
import { checkEmailAddress } from "@/lib/email-address";
import { Button } from "@/components/ui/button";
import { EmailTypoHint } from "@/components/form/email-typo-hint";

type AuthEmailFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  callbackUrl?: string;
  /** Mirrored from server env so the client bundle stays free of secrets. */
  passwordLoginEnabled?: boolean;
};

export function AuthEmailForm({
  title,
  subtitle,
  submitLabel,
  callbackUrl = "/dashboard",
  passwordLoginEnabled = false,
}: AuthEmailFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refreshEmailHints(value: string) {
    const checked = checkEmailAddress(value);
    setSuggestion(checked.ok ? checked.suggestion : null);
    if (!value.trim()) {
      setError(null);
      return;
    }
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    setError(null);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#C8A24D]/40 bg-[#1F1F23]/95 p-6 text-[#F4F1EB] shadow-xl backdrop-blur-sm sm:p-7">
      <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h1>
      <p className="mt-1.5 text-sm leading-snug text-[#F4F1EB]/75">{subtitle}</p>

      <form
        className="mt-5 flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const checked = checkEmailAddress(email);
          if (!checked.ok) {
            setError(checked.error);
            setSuggestion(null);
            return;
          }
          setError(null);
          setSuggestion(checked.suggestion);
          const formData = new FormData(event.currentTarget);
          formData.set("email", checked.normalized);
          formData.set("callbackUrl", callbackUrl);
          startTransition(async () => {
            const result = await requestMagicLinkAction(formData);
            if (!result.ok) {
              setError(result.error);
              setSuggestion(result.suggestion ?? null);
            }
          });
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
            value={email}
            onChange={(event) => {
              const value = event.target.value;
              setEmail(value);
              refreshEmailHints(value);
            }}
            onBlur={() => refreshEmailHints(email)}
            className="h-9 rounded-lg border border-[#C8A24D]/50 bg-[#121216] px-3 py-2 text-sm text-[#F4F1EB] outline-none ring-[#C8A24D] focus:ring-2"
          />
        </label>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <EmailTypoHint
          suggestion={suggestion}
          onApply={(next) => {
            setEmail(next);
            refreshEmailHints(next);
          }}
        />
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#C8A24D] text-[#1F1F23] hover:bg-[#d4b35e]"
        >
          {pending ? "Wird gesendet…" : submitLabel}
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

      {passwordLoginEnabled ? (
        <>
          <div className="my-6 border-t border-[#C8A24D]/30" />
          <p className="text-sm text-[#F4F1EB]/75">Dev/E2E: Passwort-Login</p>
          <form
            className="mt-3 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const checked = checkEmailAddress(
                String(formData.get("email") ?? ""),
              );
              if (!checked.ok) {
                setError(checked.error);
                return;
              }
              formData.set("email", checked.normalized);
              formData.set("callbackUrl", callbackUrl);
              startTransition(async () => {
                const result = await requestPasswordSignInAction(formData);
                if (!result.ok) {
                  setError(result.error);
                }
              });
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
              disabled={pending}
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
