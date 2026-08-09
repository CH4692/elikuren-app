import { Column, Img, Row, Section, Text } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailHeaderProps = {
  logoUrl: string;
  eyebrow?: string;
};

/** Compact forest header — logo + light label, no oversized brand block. */
export function EmailHeader({ logoUrl, eyebrow }: EmailHeaderProps) {
  return (
    <Section
      style={{
        backgroundColor: EMAIL_COLORS.forest,
        padding: "18px 24px 16px",
        borderBottom: `2px solid ${EMAIL_COLORS.gold}`,
      }}
    >
      <Row>
        <Column align="center">
          <Img
            src={logoUrl}
            width="44"
            height="51"
            alt="Kammerchor Elikuren"
            style={{
              display: "block",
              margin: "0 auto",
              border: "0",
              outline: "none",
              textDecoration: "none",
            }}
          />
        </Column>
      </Row>
      <Text
        style={{
          margin: "8px 0 0",
          color: EMAIL_COLORS.cream,
          fontFamily: EMAIL_FONT_SANS,
          fontSize: "13px",
          fontWeight: 600,
          lineHeight: "18px",
          letterSpacing: "0.2px",
          textAlign: "center",
        }}
      >
        Kammerchor Elikuren
      </Text>
      {eyebrow ? (
        <Text
          style={{
            margin: "4px 0 0",
            color: EMAIL_COLORS.gold,
            fontFamily: EMAIL_FONT_SANS,
            fontSize: "10px",
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
    </Section>
  );
}
