import { Link, Text } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailLinkFallbackProps = {
  href: string;
  label?: string;
  linkLabel?: string;
};

/**
 * HTML fallback uses a short readable link label.
 * The full URL belongs in the plaintext part (and as href), not as visible clutter.
 */
export function EmailLinkFallback({
  href,
  label = "Falls der Button nicht funktioniert:",
  linkLabel = "Link im Browser öffnen",
}: EmailLinkFallbackProps) {
  return (
    <Text
      style={{
        margin: "20px 0 0",
        color: EMAIL_COLORS.muted,
        fontFamily: EMAIL_FONT_SANS,
        fontSize: "13px",
        lineHeight: "20px",
        textAlign: "center",
      }}
    >
      {label}{" "}
      <Link
        href={href}
        style={{
          color: EMAIL_COLORS.forest,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "13px",
          lineHeight: "20px",
          textDecoration: "underline",
          fontWeight: 600,
        }}
      >
        {linkLabel}
      </Link>
    </Text>
  );
}
