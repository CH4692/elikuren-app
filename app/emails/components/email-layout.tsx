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
          padding: "32px 12px",
          backgroundColor: EMAIL_COLORS.cream,
          fontFamily: EMAIL_FONT_SANS,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: EMAIL_COLORS.white,
            borderRadius: "12px",
            overflow: "hidden",
            border: `1px solid ${EMAIL_COLORS.border}`,
          }}
        >
          <EmailHeader logoUrl={logoUrl} eyebrow={eyebrow} />
          <Section style={{ padding: "32px" }}>{children}</Section>
          <EmailFooter siteUrl={siteUrl} />
        </Container>
      </Body>
    </Html>
  );
}
