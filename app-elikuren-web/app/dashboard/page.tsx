"use client";

import { useAuth } from "@clerk/nextjs";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();

  const test = async () => {
    console.log({ isLoaded, isSignedIn, userId, sessionId });

    if (!isLoaded) return;
    if (!isSignedIn) return;

    const token = await getToken();
    console.log("TOKEN:", token);
    const res = await fetch("http://localhost:8000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(await res.json());
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen w-full justify-center items-center">
      <button onClick={test}>Token holen</button>
    </div>
  );
}
