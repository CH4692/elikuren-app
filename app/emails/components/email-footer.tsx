// @ts-nocheck — react-email CSSProperties typings incompatible with current @types/react
import { Link, Section, Text } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailFooterProps = {
  siteUrl: string;
};

export function EmailFooter({ siteUrl }: EmailFooterProps) {
  const host = siteUrl.replace(/^https?:\/\//, "");
  return (
    <Section
      style={{
        backgroundColor: EMAIL_COLORS.card,
        padding: "16px 32px 20px",
        textAlign: "center",
        borderTop: `1px solid ${EMAIL_COLORS.border}`,
      }}
    >
      <Text
        style={{
          margin: "0 0 2px",
          color: EMAIL_COLORS.muted,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "11px",
          lineHeight: "16px",
        }}
      >
        Kammerchor Elikuren e.V.
      </Text>
      <Link
        href={siteUrl}
        style={{
          color: EMAIL_COLORS.muted,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "11px",
          lineHeight: "16px",
          textDecoration: "underline",
        }}
      >
        {host}
      </Link>
    </Section>
  );
}
