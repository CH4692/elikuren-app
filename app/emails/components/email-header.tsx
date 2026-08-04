import { Img, Section, Text } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailHeaderProps = {
  logoUrl: string;
  eyebrow?: string;
};

export function EmailHeader({ logoUrl, eyebrow }: EmailHeaderProps) {
  return (
    <Section
      style={{
        backgroundColor: EMAIL_COLORS.forest,
        padding: "28px 32px",
        textAlign: "center",
      }}
    >
      <Img
        src={logoUrl}
        width="96"
        height="110"
        alt="Kammerchor Elikuren"
        style={{
          display: "block",
          margin: "0 auto 12px",
          border: "0",
          outline: "none",
        }}
      />
      {eyebrow ? (
        <Text
          style={{
            margin: 0,
            color: EMAIL_COLORS.gold,
            fontFamily: EMAIL_FONT_SANS,
            fontSize: "12px",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
    </Section>
  );
}
