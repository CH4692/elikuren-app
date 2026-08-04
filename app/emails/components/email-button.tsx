import { Button, Section } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailButtonProps = {
  href: string;
  children: React.ReactNode;
};

/** Compact gold CTA with forest text — clear, not oversized. */
export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Section style={{ textAlign: "center", margin: "20px 0 8px" }}>
      <Button
        href={href}
        style={{
          backgroundColor: EMAIL_COLORS.gold,
          background: EMAIL_COLORS.gold,
          color: EMAIL_COLORS.forest,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "14px",
          fontWeight: 700,
          lineHeight: "100%",
          letterSpacing: "0.2px",
          textDecoration: "none",
          textAlign: "center",
          display: "inline-block",
          padding: "12px 28px",
          borderRadius: "6px",
          border: `1px solid ${EMAIL_COLORS.gold}`,
        } as React.CSSProperties}
      >
        {children}
      </Button>
    </Section>
  );
}
