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
      <EmailText align="center">
        Du hast einen Anmeldelink für den Mitgliederbereich angefordert. Mit dem
        Button unten meldest du dich sicher an.
      </EmailText>
      <EmailButton href={loginUrl}>Jetzt anmelden</EmailButton>
      <EmailLinkFallback href={loginUrl} />
      <EmailText
        muted
        align="center"
        style={{ marginTop: "28px", marginBottom: 0, fontSize: "13px", lineHeight: "20px" }}
      >
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
    "Du hast einen Anmeldelink für den Mitgliederbereich angefordert.",
    "Zum Anmelden öffne diesen Link:",
    loginUrl,
    "",
    "Wenn du diesen Link nicht angefordert hast, kannst du diese E-Mail ignorieren.",
  ].join("\n");
}

MagicLinkEmail.PreviewProps = {
  loginUrl: "https://example.com/api/auth/callback/resend?token=example",
  logoUrl: "cid:elikuren-logo",
  siteUrl: "https://kammerchor-elikuren.de",
} satisfies MagicLinkEmailProps;

export default MagicLinkEmail;
