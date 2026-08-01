import { MembershipRequestForm } from "@/components/form/membership-request-form";

/** Single-viewport membership request — no page scroll on typical devices. */
export default function SignUpPage() {
  return (
    <div className="relative flex h-dvh max-h-dvh overflow-hidden bg-background font-sans dark:bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(200,162,77,0.14),_transparent_55%)]"
      />
      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 pt-20 pb-4 sm:pt-24 sm:pb-6">
        <MembershipRequestForm />
      </div>
    </div>
  );
}
