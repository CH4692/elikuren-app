import { Text } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailTextProps = {
  children: React.ReactNode;
  muted?: boolean;
  style?: React.CSSProperties;
  align?: "left" | "center";
};

export function EmailText({
  children,
  muted = false,
  style,
  align = "left",
}: EmailTextProps) {
  return (
    <Text
      style={{
        margin: "0 0 16px",
        color: muted ? EMAIL_COLORS.muted : EMAIL_COLORS.text,
        fontFamily: EMAIL_FONT_SANS,
        fontSize: "16px",
        lineHeight: "26px",
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </Text>
  );
}
