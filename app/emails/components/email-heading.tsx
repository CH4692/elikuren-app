import { Heading } from "react-email";

import { EMAIL_COLORS, EMAIL_FONT_SERIF } from "../tokens";

type EmailHeadingProps = {
  children: React.ReactNode;
};

export function EmailHeading({ children }: EmailHeadingProps) {
  return (
    <Heading
      as="h1"
      style={{
        margin: "0 0 16px",
        color: EMAIL_COLORS.text,
        fontFamily: EMAIL_FONT_SERIF,
        fontSize: "24px",
        fontWeight: 400,
        lineHeight: "32px",
      }}
    >
      {children}
    </Heading>
  );
}
