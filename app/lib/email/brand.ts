/** Shared brand constants for transactional email (inline / React Email). */
export const EMAIL_BRAND = {
  gold: "#C8A24D",
  forest: "#1E3A2F",
  cream: "#F4F1EB",
  text: "#1F1F23",
  muted: "#6B6560",
  white: "#FFFFFF",
  maxWidth: 600,
  fontFamily:
    'Georgia, "Times New Roman", Times, serif',
  sansFontFamily:
    'Arial, Helvetica, sans-serif',
} as const;

export const EMAIL_FROM_DISPLAY_NAME = "Kammerchor Elikuren";

/** Inbox for public contact form (env with legacy-compatible fallback). */
export function getContactEmailTo(): string {
  const configured = process.env.CONTACT_EMAIL_TO?.trim();
  if (configured) return configured;
  return "kammerchor.elikuren@t-online.de";
}

export function getEmailFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() || "noreply@kammerchor-elikuren.de"
  );
}

export function getEmailFromHeader(): string {
  const address = getEmailFromAddress();
  if (address.includes("<")) return address;
  return `${EMAIL_FROM_DISPLAY_NAME} <${address}>`;
}
