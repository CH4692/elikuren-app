import { Link, Section, Text } from "react-email";

import { emailStyle } from "../style";
import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailFooterProps = {
  siteUrl: string;
};

export function EmailFooter({ siteUrl }: EmailFooterProps) {
  const host = siteUrl.replace(/^https?:\/\//, "");
  return (
    <Section
      style={emailStyle({
        backgroundColor: EMAIL_COLORS.card,
        padding: "16px 32px 20px",
        textAlign: "center",
        borderTop: `1px solid ${EMAIL_COLORS.border}`,
      })}
    >
      <Text
        style={emailStyle({
          margin: "0 0 2px",
          color: EMAIL_COLORS.muted,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "11px",
          lineHeight: "16px",
        })}
      >
        Kammerchor Elikuren e.V.
      </Text>
      <Link
        href={siteUrl}
        style={emailStyle({
          color: EMAIL_COLORS.muted,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "11px",
          lineHeight: "16px",
          textDecoration: "underline",
        })}
      >
        {host}
      </Link>
    </Section>
  );
}
