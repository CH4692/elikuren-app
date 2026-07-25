import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

type AuthEmailFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  callbackUrl?: string;
};

export function AuthEmailForm({
  title,
  subtitle,
  submitLabel,
  callbackUrl = "/dashboard",
}: AuthEmailFormProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-[#C8A24D]/40 bg-[#1F1F23] p-8 text-[#F4F1EB] shadow-xl">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-[#F4F1EB]/75">{subtitle}</p>
      <form
        className="mt-8 flex flex-col gap-4"
        action={async (formData) => {
          "use server";
          const email = String(formData.get("email") ?? "").trim();
          if (!email) return;
          await signIn("resend", {
            email,
            redirectTo: callbackUrl,
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
            className="rounded-lg border border-[#C8A24D]/50 bg-[#121216] px-3 py-2 text-[#F4F1EB] outline-none ring-[#C8A24D] focus:ring-2"
          />
        </label>
        <Button
          type="submit"
          className="bg-[#C8A24D] text-[#1F1F23] hover:bg-[#d4b35e]"
        >
          {submitLabel}
        </Button>
      </form>
    </div>
  );
}
