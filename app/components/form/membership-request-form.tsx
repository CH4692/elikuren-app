"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function MembershipRequestForm() {
  const [isSending, setIsSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-[#C8A24D]/40 bg-[#1F1F23] p-8 text-[#F4F1EB] shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">
          Anfrage eingegangen
        </h1>
        <p className="mt-3 text-sm text-[#F4F1EB]/75">
          Vielen Dank! Der Vorstand prüft deine Anfrage. Nach der Freigabe
          erhältst du einen Magic Link per E-Mail.
        </p>
        <Link
          href="/home"
          className="mt-6 inline-block text-sm text-[#C8A24D] underline-offset-4 hover:underline"
        >
          Zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#C8A24D]/40 bg-[#1F1F23] p-8 text-[#F4F1EB] shadow-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Mitglied werden</h1>
      <p className="mt-2 text-sm text-[#F4F1EB]/75">
        Mitgliedsanfragen werden vom Vorstand freigeschaltet. Ein Magic Link
        wird erst nach Bestätigung versendet.
      </p>
      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setIsSending(true);
          const form = new FormData(event.currentTarget);
          try {
            const res = await fetch("/api/membership-requests", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                firstname: String(form.get("firstname") ?? ""),
                lastname: String(form.get("lastname") ?? ""),
                email: String(form.get("email") ?? ""),
                voice: String(form.get("voice") ?? ""),
                message: String(form.get("message") ?? ""),
              }),
            });
            const data = (await res.json()) as { detail?: string };
            if (!res.ok) {
              setError(data.detail ?? "Anfrage fehlgeschlagen");
              return;
            }
            setDone(true);
            toast.success("Anfrage gesendet");
          } catch {
            setError("Netzwerkfehler – bitte später erneut versuchen.");
          } finally {
            setIsSending(false);
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstname" className="text-[#F4F1EB]">
              Vorname
            </Label>
            <Input id="firstname" name="firstname" required className="bg-[#121216] text-[#F4F1EB]" />
          </div>
          <div>
            <Label htmlFor="lastname" className="text-[#F4F1EB]">
              Nachname
            </Label>
            <Input id="lastname" name="lastname" required className="bg-[#121216] text-[#F4F1EB]" />
          </div>
        </div>
        <div>
          <Label htmlFor="email" className="text-[#F4F1EB]">
            E-Mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="bg-[#121216] text-[#F4F1EB]"
          />
        </div>
        <div>
          <Label htmlFor="voice" className="text-[#F4F1EB]">
            Stimmlage (optional)
          </Label>
          <Input
            id="voice"
            name="voice"
            placeholder="z. B. Sopran, Alt, Tenor, Bass"
            className="bg-[#121216] text-[#F4F1EB]"
          />
        </div>
        <div>
          <Label htmlFor="message" className="text-[#F4F1EB]">
            Nachricht (optional)
          </Label>
          <Textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Kurz zu dir und deiner Chorerfahrung"
            className="bg-[#121216] text-[#F4F1EB]"
          />
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button
          type="submit"
          disabled={isSending}
          className="bg-[#C8A24D] text-[#1F1F23] hover:bg-[#d4b35e]"
        >
          {isSending ? "Wird gesendet…" : "Anfrage absenden"}
        </Button>
        <p className="text-xs text-[#F4F1EB]/60">
          Bereits Mitglied?{" "}
          <Link href="/auth/sign-in" className="text-[#C8A24D] underline-offset-2 hover:underline">
            Zum Login
          </Link>
        </p>
      </form>
    </div>
  );
}
