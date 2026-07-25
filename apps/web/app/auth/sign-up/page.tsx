import { AuthEmailForm } from "@/components/form/auth-email-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans dark:bg-black">
      <AuthEmailForm
        title="Mitglied werden"
        subtitle="Mit deiner E-Mail startest du die Registrierung per Magic Link."
        submitLabel="Registrierungs-Link senden"
        callbackUrl="/dashboard"
      />
    </div>
  );
}
