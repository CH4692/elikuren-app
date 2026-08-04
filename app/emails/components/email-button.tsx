import { Button, Section } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailButtonProps = {
  href: string;
  children: React.ReactNode;
};

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Section style={{ textAlign: "center", margin: "28px 0 8px" }}>
      <Button
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: EMAIL_COLORS.gold,
          color: EMAIL_COLORS.text,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "16px",
          fontWeight: 700,
          lineHeight: "20px",
          textDecoration: "none",
          textAlign: "center",
          padding: "16px 32px",
          borderRadius: "8px",
          minHeight: "48px",
          border: `1px solid ${EMAIL_COLORS.gold}`,
        }}
      >
        {children}
      </Button>
    </Section>
  );
}
