// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans dark:bg-black">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#C8A24D",
            colorBackground: "#1F1F23",
          },
        }}
      />
      ;
    </div>
  );
}
