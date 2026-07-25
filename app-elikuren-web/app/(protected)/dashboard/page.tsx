"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

import { ApiError, getCurrentUser, type UserResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    setError(null);
    setUser(null);

    if (!isLoaded) return;
    if (!isSignedIn) {
      setError("Nicht angemeldet");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setError("Kein Clerk-Token verfügbar");
        return;
      }
      const data = await getCurrentUser(token);
      setUser(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`${err.message} (${err.status})`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unbekannter Fehler");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 px-4">
      <Button onClick={loadProfile} disabled={loading || !isLoaded}>
        {loading ? "Lädt…" : "Profil von API laden"}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {user ? (
        <pre className="max-w-xl overflow-auto rounded bg-black/5 p-4 text-left text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
