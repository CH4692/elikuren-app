import Link from "next/link";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-[#C8A24D]/40 bg-[#1F1F23] p-8 text-[#F4F1EB] shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          Anmeldung fehlgeschlagen
        </h1>
        <p className="mt-3 text-sm text-[#F4F1EB]/75">
          {params.error
            ? `Fehler: ${params.error}`
            : "Der Magic Link ist ungültig oder abgelaufen."}
        </p>
        <Link
          href="/auth/sign-in"
          className="mt-6 inline-block text-sm text-[#C8A24D] underline-offset-4 hover:underline"
        >
          Erneut versuchen
        </Link>
      </div>
    </div>
  );
}
