import { Link, Section, Text } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailFooterProps = {
  siteUrl: string;
};

export function EmailFooter({ siteUrl }: EmailFooterProps) {
  return (
    <Section
      style={{
        backgroundColor: EMAIL_COLORS.cream,
        padding: "20px 32px",
        textAlign: "center",
      }}
    >
      <Text
        style={{
          margin: "0 0 6px",
          color: EMAIL_COLORS.muted,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "13px",
          lineHeight: "20px",
        }}
      >
        Kammerchor Elikuren e.V.
      </Text>
      <Link
        href={siteUrl}
        style={{
          color: EMAIL_COLORS.forest,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "13px",
          lineHeight: "20px",
          textDecoration: "underline",
        }}
      >
        {siteUrl.replace(/^https?:\/\//, "")}
      </Link>
    </Section>
  );
}
