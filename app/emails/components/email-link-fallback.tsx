import { Link, Text } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailLinkFallbackProps = {
  href: string;
  label?: string;
  linkLabel?: string;
};

export function EmailLinkFallback({
  href,
  label = "Falls der Button nicht funktioniert:",
  linkLabel = "Link im Browser öffnen",
}: EmailLinkFallbackProps) {
  return (
    <Text
      style={{
        margin: "12px 0 0",
        color: EMAIL_COLORS.muted,
        fontFamily: EMAIL_FONT_SANS,
        fontSize: "12px",
        lineHeight: "18px",
        textAlign: "center",
      }}
    >
      {label}{" "}
      <Link
        href={href}
        style={{
          color: EMAIL_COLORS.forest,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "12px",
          lineHeight: "18px",
          textDecoration: "underline",
          fontWeight: 600,
        }}
      >
        {linkLabel}
      </Link>
    </Text>
  );
}
