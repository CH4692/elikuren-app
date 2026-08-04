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
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <style>{`
          :root { color-scheme: light only; }
          u + div .body { background-color: ${EMAIL_COLORS.cream} !important; }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="body"
        style={{
          margin: 0,
          padding: "28px 14px",
          backgroundColor: EMAIL_COLORS.cream,
          fontFamily: EMAIL_FONT_SANS,
          colorScheme: "light only",
        } as React.CSSProperties}
      >
        <Container
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            backgroundColor: EMAIL_COLORS.card,
            borderRadius: "10px",
            overflow: "hidden",
            border: `1px solid ${EMAIL_COLORS.border}`,
          }}
        >
          <EmailHeader logoUrl={logoUrl} eyebrow={eyebrow} />
          <Section
            style={{
              padding: "28px 32px 24px",
              backgroundColor: EMAIL_COLORS.card,
            }}
          >
            {children}
          </Section>
          <EmailFooter siteUrl={siteUrl} />
        </Container>
      </Body>
    </Html>
  );
}
