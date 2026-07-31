import Link from "next/link";

import { pendingApprovalMessage } from "@/lib/membership-requests";

const MESSAGES: Record<string, { title: string; body: string }> = {
  AccessDenied: {
    title: "Anfrage erfasst",
    body: pendingApprovalMessage(),
  },
  Configuration: {
    title: "Anmeldung fehlgeschlagen",
    body: "Die Anmeldung ist derzeit nicht konfiguriert.",
  },
  Verification: {
    title: "Anmeldung fehlgeschlagen",
    body: "Der Magic Link ist ungültig oder abgelaufen.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const mapped = params.error ? MESSAGES[params.error] : undefined;
  const title = mapped?.title ?? "Anmeldung fehlgeschlagen";
  const message =
    mapped?.body ??
    (params.error
      ? `Fehler: ${params.error}`
      : "Der Magic Link ist ungültig oder abgelaufen.");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pb-12 pt-28 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-[#C8A24D]/40 bg-[#1F1F23] p-8 text-[#F4F1EB] shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-[#F4F1EB]/75">{message}</p>
        <div className="mt-6 flex flex-col gap-2 text-sm">
          <Link
            href="/auth/sign-in"
            className="text-[#C8A24D] underline-offset-4 hover:underline"
          >
            Zurück zum Login
          </Link>
          <Link
            href="/auth/sign-up"
            className="text-[#C8A24D] underline-offset-4 hover:underline"
          >
            Mitgliedschaft beantragen
          </Link>
        </div>
      </div>
    </div>
  );
}
