import { AuthEmailForm } from "@/components/form/auth-email-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 font-sans dark:bg-black">
      <AuthEmailForm
        title="Mitglieder Login"
        subtitle="Mit Passwort anmelden oder Magic Link für freigeschaltete Mitglieder anfordern."
        submitLabel="Login-Link senden"
        callbackUrl={params.callbackUrl ?? "/profile"}
      />
    </div>
  );
}
