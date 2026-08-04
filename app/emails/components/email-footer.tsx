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
        backgroundColor: EMAIL_COLORS.cream,
        padding: "24px 32px",
        textAlign: "center",
        borderTop: `1px solid ${EMAIL_COLORS.border}`,
      }}
    >
      <Text
        style={{
          margin: "0 0 4px",
          color: EMAIL_COLORS.forest,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "12px",
          lineHeight: "18px",
          fontWeight: 600,
        }}
      >
        Kammerchor Elikuren e.V.
      </Text>
      <Link
        href={siteUrl}
        style={{
          color: EMAIL_COLORS.gold,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "12px",
          lineHeight: "18px",
          textDecoration: "underline",
        }}
      >
        {host}
      </Link>
    </Section>
  );
}
