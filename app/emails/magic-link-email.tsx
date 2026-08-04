import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailLinkFallback,
  EmailText,
} from "./components";

export type MagicLinkEmailProps = {
  loginUrl: string;
  logoUrl: string;
  siteUrl: string;
};

export function MagicLinkEmail({
  loginUrl,
  logoUrl,
  siteUrl,
}: MagicLinkEmailProps) {
  return (
    <EmailLayout
      preview="Dein Anmeldelink für den Mitgliederbereich"
      logoUrl={logoUrl}
      siteUrl={siteUrl}
      eyebrow="Anmeldung"
    >
      <EmailHeading>Willkommen zurück</EmailHeading>
      <EmailText>
        Mit diesem Link meldest du dich sicher im Mitgliederbereich des
        Kammerchors Elikuren an.
      </EmailText>
      <EmailButton href={loginUrl}>Jetzt anmelden</EmailButton>
      <EmailLinkFallback href={loginUrl} />
      <EmailText muted style={{ marginTop: "24px", marginBottom: 0 }}>
        Wenn du diesen Link nicht angefordert hast, kannst du diese E-Mail
        ignorieren.
      </EmailText>
    </EmailLayout>
  );
}

export function magicLinkEmailText({ loginUrl }: { loginUrl: string }): string {
  return [
    "Kammerchor Elikuren – Anmeldung",
    "",
    "Mit diesem Link meldest du dich im Mitgliederbereich an:",
    loginUrl,
    "",
    "Wenn du diesen Link nicht angefordert hast, kannst du diese E-Mail ignorieren.",
  ].join("\n");
}

export default MagicLinkEmail;
