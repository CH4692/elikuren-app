import { AuthEmailForm } from "@/components/form/auth-email-form";

/** Single-viewport login — matches membership page layout. */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="relative flex h-dvh max-h-dvh overflow-hidden bg-background font-sans dark:bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(200,162,77,0.14),_transparent_55%)]"
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 pt-20 pb-4 sm:pt-24 sm:pb-6">
        <AuthEmailForm
          title="Mitglieder Login"
          subtitle="Freigeschaltete Mitglieder erhalten einen Magic Link per E-Mail."
          submitLabel="Login-Link senden"
          callbackUrl={params.callbackUrl ?? "/dashboard"}
          passwordLoginEnabled={process.env.AUTH_ENABLE_PASSWORD_LOGIN === "1"}
        />
      </div>
    </div>
  );
}
