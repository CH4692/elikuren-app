import {
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailLinkFallback,
  EmailText,
} from "./components";

export type MembershipApprovedEmailProps = {
  signInUrl: string;
  logoUrl: string;
  siteUrl: string;
};

export function MembershipApprovedEmail({
  signInUrl,
  logoUrl,
  siteUrl,
}: MembershipApprovedEmailProps) {
  return (
    <EmailLayout
      preview="Dein Zugang zum Mitgliederbereich wurde freigeschaltet"
      logoUrl={logoUrl}
      siteUrl={siteUrl}
      eyebrow="Mitgliederbereich"
    >
      <EmailHeading>Zugang freigeschaltet</EmailHeading>
      <EmailText align="center">
        Dein Zugang zum Mitgliederbereich des Kammerchors Elikuren wurde
        freigeschaltet. Melde dich an und fordere dort deinen Anmeldelink an.
      </EmailText>
      <EmailButton href={signInUrl}>Jetzt anmelden</EmailButton>
      <EmailLinkFallback href={signInUrl} />
    </EmailLayout>
  );
}

export function membershipApprovedEmailText({
  signInUrl,
}: {
  signInUrl: string;
}): string {
  return [
    "Kammerchor Elikuren – Zugang freigeschaltet",
    "",
    "Dein Zugang zum Mitgliederbereich wurde freigeschaltet.",
    "Melde dich hier an und fordere deinen Anmeldelink an:",
    signInUrl,
  ].join("\n");
}

MembershipApprovedEmail.PreviewProps = {
  signInUrl: "https://kammerchor-elikuren.de/auth/sign-in",
  logoUrl: "cid:elikuren-logo",
  siteUrl: "https://kammerchor-elikuren.de",
} satisfies MembershipApprovedEmailProps;

export default MembershipApprovedEmail;
