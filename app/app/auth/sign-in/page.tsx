import { AuthEmailForm } from "@/components/form/auth-email-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 pb-12 pt-28 font-sans dark:bg-black">
      <AuthEmailForm
        title="Mitglieder Login"
        subtitle="Freigeschaltete Mitglieder erhalten einen Magic Link per E-Mail. Eine Mitgliedschaft beantragst du unter „Mitglied werden“."
        submitLabel="Login-Link senden"
        callbackUrl={params.callbackUrl ?? "/dashboard"}
      />
    </div>
  );
}
