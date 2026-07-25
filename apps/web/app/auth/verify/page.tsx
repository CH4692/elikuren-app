export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-[#C8A24D]/40 bg-[#1F1F23] p-8 text-[#F4F1EB] shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          E-Mail prüfen
        </h1>
        <p className="mt-3 text-sm text-[#F4F1EB]/75">
          Wir haben dir einen Magic Link geschickt. Öffne die E-Mail und folge
          dem Link, um dich anzumelden.
        </p>
      </div>
    </div>
  );
}
