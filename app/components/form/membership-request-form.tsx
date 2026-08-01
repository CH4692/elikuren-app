"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const fieldClass =
  "h-9 rounded-lg border-[#C8A24D]/35 bg-[#121216] text-sm text-[#F4F1EB] placeholder:text-[#F4F1EB]/40";

export function MembershipRequestForm() {
  const [isSending, setIsSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-[#C8A24D]/40 bg-[#1F1F23]/95 p-6 text-[#F4F1EB] shadow-xl backdrop-blur-sm sm:p-7">
        <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Anfrage eingegangen
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#F4F1EB]/75">
          Vielen Dank! Der Vorstand prüft deine Anfrage. Nach der Freigabe
          erhältst du einen Magic Link per E-Mail.
        </p>
        <Link
          href="/home"
          className="mt-5 inline-block text-sm text-[#C8A24D] underline-offset-4 hover:underline"
        >
          Zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col rounded-2xl border border-[#C8A24D]/40 bg-[#1F1F23]/95 p-5 text-[#F4F1EB] shadow-xl backdrop-blur-sm sm:p-6">
      <header className="shrink-0">
        <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          Mitglied werden
        </h1>
        <p className="mt-1.5 text-sm leading-snug text-[#F4F1EB]/75">
          Der Vorstand schaltet dich frei — danach reicht der Magic-Link-Login.
        </p>
      </header>

      <form
        className="mt-4 flex min-h-0 flex-1 flex-col gap-3"
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
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="firstname" className="text-xs text-[#F4F1EB]/85">
              Vorname
            </Label>
            <Input
              id="firstname"
              name="firstname"
              required
              autoComplete="given-name"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lastname" className="text-xs text-[#F4F1EB]/85">
              Nachname
            </Label>
            <Input
              id="lastname"
              name="lastname"
              required
              autoComplete="family-name"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-1">
            <Label htmlFor="email" className="text-xs text-[#F4F1EB]/85">
              E-Mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="voice" className="text-xs text-[#F4F1EB]/85">
              Stimmlage{" "}
              <span className="font-normal text-[#F4F1EB]/45">(optional)</span>
            </Label>
            <Input
              id="voice"
              name="voice"
              placeholder="Sopran, Alt, Tenor, Bass"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="message" className="text-xs text-[#F4F1EB]/85">
            Nachricht{" "}
            <span className="font-normal text-[#F4F1EB]/45">(optional)</span>
          </Label>
          <Textarea
            id="message"
            name="message"
            rows={2}
            placeholder="Kurz zu dir und deiner Chorerfahrung"
            className="min-h-[4.5rem] resize-none rounded-lg border-[#C8A24D]/35 bg-[#121216] text-sm text-[#F4F1EB] placeholder:text-[#F4F1EB]/40"
          />
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <div className="mt-1 flex flex-col gap-2">
          <Button
            type="submit"
            disabled={isSending}
            className="h-10 bg-[#C8A24D] text-[#1F1F23] hover:bg-[#d4b35e]"
          >
            {isSending ? "Wird gesendet…" : "Anfrage absenden"}
          </Button>
          <p className="text-center text-xs text-[#F4F1EB]/55">
            Bereits Mitglied?{" "}
            <Link
              href="/auth/sign-in"
              className="text-[#C8A24D] underline-offset-2 hover:underline"
            >
              Zum Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
