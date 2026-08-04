import { Heading } from "react-email";

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
      style={{
        margin: "0 0 12px",
        color: EMAIL_COLORS.text,
        fontFamily: EMAIL_FONT_SERIF,
        fontSize: "26px",
        fontWeight: 400,
        lineHeight: "34px",
        textAlign: align,
      }}
    >
      {children}
    </Heading>
  );
}
