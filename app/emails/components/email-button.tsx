import { Button, Section } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailButtonProps = {
  href: string;
  children: React.ReactNode;
};

/**
 * Brand CTA: gold fill + forest text for contrast.
 * Compact padding — oversized min-height looks bulky in Apple Mail.
 */
export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Section style={{ textAlign: "center", margin: "28px 0 12px" }}>
      <Button
        href={href}
        style={{
          backgroundColor: EMAIL_COLORS.gold,
          background: EMAIL_COLORS.gold,
          color: EMAIL_COLORS.forest,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "15px",
          fontWeight: 700,
          lineHeight: "100%",
          letterSpacing: "0.3px",
          textDecoration: "none",
          textAlign: "center",
          display: "inline-block",
          padding: "14px 36px",
          borderRadius: "999px",
          border: `2px solid ${EMAIL_COLORS.gold}`,
          msoPaddingAlt: "14px 36px",
        } as React.CSSProperties}
      >
        {children}
      </Button>
    </Section>
  );
}
