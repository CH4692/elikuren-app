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
        {/* Keep brand colors in Apple Mail / iOS dark mode */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <style>{`
          :root { color-scheme: light only; }
          u + div .body { background-color: ${EMAIL_COLORS.forest} !important; }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="body"
        style={{
          margin: 0,
          padding: "40px 16px",
          backgroundColor: EMAIL_COLORS.forest,
          fontFamily: EMAIL_FONT_SANS,
          colorScheme: "light only",
        } as React.CSSProperties}
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
          <Section
            style={{
              padding: "36px 40px 40px",
              backgroundColor: EMAIL_COLORS.white,
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
