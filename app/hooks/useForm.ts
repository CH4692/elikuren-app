import { createContext, useContext } from "react";

export const ContactFormContext = createContext<ContactFormContextType | null>(
  null,
);

type ContactFormContextType = {
  errors: Record<string, string>;
  isSending: boolean;
  successMessage: string;
};

export function useContactForm() {
  const context = useContext(ContactFormContext);
  if (!context) {
    throw new Error(
      "useContactForm muss innerhalb von ContactForm verwendet werden",
    );
  }
  return context;
}
