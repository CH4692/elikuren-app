"use client";
import { useContactForm } from "@/hooks/useForm";
import { Send } from "lucide-react";
import AlertFail from "./alert-fail";
import { EmailTypoHint } from "./email-typo-hint";
import { Spinner } from "../ui/spinner";

export default function FormContent() {
  const {
    errors,
    isSending,
    email,
    setEmail,
    emailSuggestion,
  } = useContactForm();
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
            Vorname
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            className={`w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary ${errors.firstName ? "border-destructive" : "border-border"}`}
            placeholder="Vorname"
          />
          {errors.firstName && <AlertFail description={errors.firstName} />}
        </div>

        <div>
          <label htmlFor="lastName" className="mb-2 block text-sm font-medium">
            Nachname
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            className={`w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary ${errors.lastName ? "border-destructive" : "border-border"}`}
            placeholder="Nachname"
          />
          {errors.lastName && <AlertFail description={errors.lastName} />}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setEmail(email)}
          className={`w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary ${errors.email ? "border-destructive" : "border-border"}`}
          placeholder="deine@email.de"
        />
        {errors.email && <AlertFail description={errors.email} />}
        <EmailTypoHint
          suggestion={emailSuggestion}
          onApply={setEmail}
          className="mt-2 text-xs text-primary"
        />
      </div>

      <div>
        <label htmlFor="subject" className="mb-2 block text-sm font-medium">
          Betreff
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          className={`w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary ${errors.subject ? "border-destructive" : "border-border"}`}
          placeholder="Worum geht es?"
        />
        {errors.subject && <AlertFail description={errors.subject} />}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">
          Nachricht
        </label>
        <textarea
          id="message"
          name="message"
          rows={7}
          className={`w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary ${errors.message ? "border-destructive" : "border-border"}`}
          placeholder="Schreibe uns deine Nachricht..."
        />
        {errors.message && <AlertFail description={errors.message} />}
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        {isSending && <Spinner />}
        {isSending ? "Wird gesendet..." : "Nachricht senden"}
        {!isSending && <Send className="h-4 w-4" />}
      </button>
    </>
  );
}
