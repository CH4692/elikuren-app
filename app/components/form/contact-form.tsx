"use client";

import { ContactFormContext } from "@/hooks/useForm";
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
  const handleSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    const newErrors: Record<string, string> = {};

    if (!data.firstName) newErrors.firstName = "Bitte Vornamen eingeben.";
    if (!data.lastName) newErrors.lastName = "Bitte Nachnamen eingeben.";
    if (!data.email) newErrors.email = "Bitte E-Mail eingeben.";
    if (!data.subject) newErrors.subject = "Bitte Betreff eingeben.";
    if (!data.message) newErrors.message = "Bitte Nachricht eingeben.";

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Bitte eine gültige E-Mail-Adresse eingeben.";
    }

    setErrors(newErrors);
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
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <ContactFormContext.Provider
        value={{ errors, isSending, successMessage }}
      >
        {children}
      </ContactFormContext.Provider>
    </form>
  );
}
