import { Text } from "react-email";

import { emailStyle, type EmailStyle } from "../style";
import { EMAIL_COLORS, EMAIL_FONT_SANS } from "../tokens";

type EmailTextProps = {
  children: React.ReactNode;
  muted?: boolean;
  style?: EmailStyle;
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
      style={emailStyle({
        margin: "0 0 12px",
        color: muted ? EMAIL_COLORS.muted : EMAIL_COLORS.text,
        fontFamily: EMAIL_FONT_SANS,
        fontSize: "15px",
        lineHeight: "22px",
        textAlign: align,
        ...style,
      })}
    >
      {children}
    </Text>
  );
}
