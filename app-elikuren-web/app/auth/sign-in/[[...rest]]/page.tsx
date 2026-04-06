// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative top-0 flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#C8A24D",
            colorText: "#F4F1EB",
            colorInputForeground: "#F4F1EB",
            colorBackground: "#1F1F23",
            borderRadius: "0.75rem",
          },
        }}
      />
      ;
    </div>
  );
}
