import { Img, Section, Text } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS, EMAIL_FONT_SERIF } from "../tokens";

type EmailHeaderProps = {
  logoUrl: string;
  eyebrow?: string;
};

export function EmailHeader({ logoUrl, eyebrow }: EmailHeaderProps) {
  return (
    <Section
      style={{
        backgroundColor: EMAIL_COLORS.forest,
        padding: "36px 32px 28px",
        textAlign: "center",
      }}
    >
      <Img
        src={logoUrl}
        width="72"
        height="83"
        alt=""
        style={{
          display: "block",
          margin: "0 auto 14px",
          border: "0",
          outline: "none",
          textDecoration: "none",
        }}
      />
      <Text
        style={{
          margin: "0 0 10px",
          color: EMAIL_COLORS.gold,
          fontFamily: EMAIL_FONT_SERIF,
          fontSize: "22px",
          fontWeight: 400,
          lineHeight: "28px",
          letterSpacing: "0.2px",
        }}
      >
        Kammerchor Elikuren
      </Text>
      {eyebrow ? (
        <Text
          style={{
            margin: 0,
            color: "#D8C089",
            fontFamily: EMAIL_FONT_SANS,
            fontSize: "11px",
            letterSpacing: "2.4px",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
    </Section>
  );
}
