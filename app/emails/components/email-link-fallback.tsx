import { Link, Text } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailLinkFallbackProps = {
  href: string;
  label?: string;
};

export function EmailLinkFallback({
  href,
  label = "Falls der Button nicht funktioniert, öffne diesen Link:",
}: EmailLinkFallbackProps) {
  return (
    <>
      <Text
        style={{
          margin: "24px 0 8px",
          color: EMAIL_COLORS.muted,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "13px",
          lineHeight: "20px",
        }}
      >
        {label}
      </Text>
      <Link
        href={href}
        style={{
          color: EMAIL_COLORS.forest,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "13px",
          lineHeight: "20px",
          wordBreak: "break-all",
        }}
      >
        {href}
      </Link>
    </>
  );
}
