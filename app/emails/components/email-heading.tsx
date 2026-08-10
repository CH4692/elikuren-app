import { Heading } from "react-email";

import { emailStyle } from "../style";
import { EMAIL_COLORS, EMAIL_FONT_SERIF } from "../tokens";

type EmailHeadingProps = {
  children: React.ReactNode;
  align?: "left" | "center";
};

export function EmailHeading({
  children,
  align = "center",
}: EmailHeadingProps) {
  return (
    <Heading
      as="h1"
      style={emailStyle({
        margin: "0 0 8px",
        color: EMAIL_COLORS.forest,
        fontFamily: EMAIL_FONT_SERIF,
        fontSize: "22px",
        fontWeight: 400,
        lineHeight: "28px",
        textAlign: align,
      })}
    >
      {children}
    </Heading>
  );
}
