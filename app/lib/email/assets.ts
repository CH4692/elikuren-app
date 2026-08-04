import { absoluteUrl } from "@/lib/site-url";

export function emailLogoUrl(): string {
  return absoluteUrl("/email/logo.png");
}

export function emailSiteUrl(): string {
  return absoluteUrl("/");
}
