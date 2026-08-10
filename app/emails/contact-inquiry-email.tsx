// @ts-nocheck — react-email CSSProperties typings incompatible with current @types/react
import { Section, Text } from "react-email";

import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailText,
} from "./components";
import { EMAIL_COLORS, EMAIL_FONT_SANS } from "./tokens";

export type ContactInquiryEmailProps = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  logoUrl: string;
  siteUrl: string;
};

function MessageLines({ message }: { message: string }) {
  const lines = message.split("\n");
  return (
    <Section
      style={{
        backgroundColor: EMAIL_COLORS.cream,
        padding: "16px",
        borderRadius: "8px",
      }}
    >
      {lines.map((line, index) => (
        <Text
          key={`line-${index}`}
          style={{
            margin: 0,
            color: EMAIL_COLORS.text,
            fontFamily: EMAIL_FONT_SANS,
            fontSize: "15px",
            lineHeight: "22px",
            whiteSpace: "pre-wrap",
          }}
        >
          {line.length > 0 ? line : "\u00A0"}
        </Text>
      ))}
    </Section>
  );
}

export function ContactInquiryEmail({
  firstName,
  lastName,
  email,
  subject,
  message,
  logoUrl,
  siteUrl,
}: ContactInquiryEmailProps) {
  return (
    <EmailLayout
      preview={`Neue Kontaktanfrage von ${firstName} ${lastName}`}
      logoUrl={logoUrl}
      siteUrl={siteUrl}
      eyebrow="Kontaktanfrage"
    >
      <EmailHeading align="left">Neue Nachricht</EmailHeading>
      <EmailText>
        Du hast eine neue Nachricht über die Website erhalten.
      </EmailText>
      <EmailText style={{ marginBottom: "8px" }}>
        <strong>Name:</strong> {firstName} {lastName}
      </EmailText>
      <EmailText style={{ marginBottom: "8px" }}>
        <strong>E-Mail:</strong> {email}
      </EmailText>
      <EmailText style={{ marginBottom: "16px" }}>
        <strong>Betreff:</strong> {subject || "–"}
      </EmailText>
      <EmailText style={{ marginBottom: "8px" }}>
        <strong>Nachricht:</strong>
      </EmailText>
      <MessageLines message={message} />
      <Section style={{ marginTop: "16px" }}>
        <EmailButton href={`mailto:${email}`}>Direkt antworten</EmailButton>
      </Section>
    </EmailLayout>
  );
}

export function contactInquiryEmailText({
  firstName,
  lastName,
  email,
  subject,
  message,
}: Omit<ContactInquiryEmailProps, "logoUrl" | "siteUrl">): string {
  return [
    "Kammerchor Elikuren – Neue Kontaktanfrage",
    "",
    `Name: ${firstName} ${lastName}`,
    `E-Mail: ${email}`,
    `Betreff: ${subject || "–"}`,
    "",
    "Nachricht:",
    message,
  ].join("\n");
}

export default ContactInquiryEmail;
