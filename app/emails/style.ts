import type { CSSProperties } from "react";

/**
 * react-email augments React.CSSProperties in a way that currently breaks
 * excess-property checks for ordinary CSS keys (textAlign, margin, …).
 * Build styles through this helper so templates stay type-checked.
 */
export type EmailStyle = Record<string, string | number | undefined>;

export function emailStyle(style: EmailStyle): CSSProperties {
  return style as CSSProperties;
}
