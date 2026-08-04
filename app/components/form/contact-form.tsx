"use client";

import { ContactFormContext } from "@/hooks/useForm";
import { checkEmailAddress } from "@/lib/email-address";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactForm({
  children,
}: {
  children: React.ReactNode;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);

  function updateEmail(value: string) {
    setEmail(value);
    const checked = checkEmailAddress(value);
    setEmailSuggestion(checked.ok ? checked.suggestion : null);
    setErrors((prev) => {
      const next = { ...prev };
      if (!value.trim()) {
        delete next.email;
        return next;
      }
      if (!checked.ok) {
        next.email =
          checked.error ?? "Bitte eine gültige E-Mail-Adresse eingeben.";
        return next;
      }
      delete next.email;
      return next;
    });
  }

  const handleSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const emailCheck = checkEmailAddress(email);

    const data = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: emailCheck.normalized,
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    const newErrors: Record<string, string> = {};

    if (!data.firstName) newErrors.firstName = "Bitte Vornamen eingeben.";
    if (!data.lastName) newErrors.lastName = "Bitte Nachnamen eingeben.";
    if (!email.trim()) newErrors.email = "Bitte E-Mail eingeben.";
    else if (!emailCheck.ok) {
      newErrors.email =
        emailCheck.error ?? "Bitte eine gültige E-Mail-Adresse eingeben.";
    }
    if (!data.subject) newErrors.subject = "Bitte Betreff eingeben.";
    if (!data.message) newErrors.message = "Bitte Nachricht eingeben.";

    setErrors(newErrors);
    setEmailSuggestion(emailCheck.ok ? emailCheck.suggestion : null);
    setSuccessMessage("");

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSending(true);

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setSuccessMessage("");
        return;
      }

      form.reset();
      setEmail("");
      setEmailSuggestion(null);
      setErrors({});
      setSuccessMessage("Deine Nachricht wurde erfolgreich gesendet.");
      toast.success("Erfolgreich gesendet", {
        position: "top-center",
      });
    } finally {
      setIsSending(false);
    }
  };
  return (
    <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
      <ContactFormContext.Provider
        value={{
          errors,
          isSending,
          successMessage,
          email,
          setEmail: updateEmail,
          emailSuggestion,
        }}
      >
        {children}
      </ContactFormContext.Provider>
    </form>
  );
}
