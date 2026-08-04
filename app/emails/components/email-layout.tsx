import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
} from "react-email";

import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";
import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailLayoutProps = {
  preview: string;
  logoUrl: string;
  siteUrl: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function EmailLayout({
  preview,
  logoUrl,
  siteUrl,
  eyebrow,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang="de">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: "40px 16px",
          backgroundColor: EMAIL_COLORS.forest,
          fontFamily: EMAIL_FONT_SANS,
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: EMAIL_COLORS.white,
            borderRadius: "8px",
            overflow: "hidden",
            border: `1px solid ${EMAIL_COLORS.gold}`,
          }}
        >
          <EmailHeader logoUrl={logoUrl} eyebrow={eyebrow} />
          <Section style={{ padding: "36px 40px 40px" }}>{children}</Section>
          <EmailFooter siteUrl={siteUrl} />
        </Container>
      </Body>
    </Html>
  );
}
