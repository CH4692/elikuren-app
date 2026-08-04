import { Button } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailButtonProps = {
  href: string;
  children: React.ReactNode;
};

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: EMAIL_COLORS.gold,
        color: EMAIL_COLORS.text,
        fontFamily: EMAIL_FONT_SANS,
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: "20px",
        textDecoration: "none",
        textAlign: "center",
        padding: "14px 28px",
        borderRadius: "999px",
        minHeight: "44px",
      }}
    >
      {children}
    </Button>
  );
}
