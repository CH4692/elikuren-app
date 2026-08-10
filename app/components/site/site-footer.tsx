import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import type { IconType } from "react-icons";

import Logo from "@/components/logo";
import { SiteLink } from "@/components/site/site-link";
import { Separator } from "@/components/ui/separator";

export type SiteFooterSocialItem = {
  id: string;
  label: string;
  url: string;
};

export type SiteFooterProps = {
  tagline?: string;
  copyrightLine: string;
  imprintLabel: string;
  privacyLabel: string;
  socialItems: SiteFooterSocialItem[];
};

function socialIcon(label: string): IconType | null {
  const key = label.trim().toLowerCase();
  if (key.includes("youtube")) return FaYoutube;
  if (key.includes("facebook")) return FaFacebookF;
  if (key.includes("instagram")) return FaInstagram;
  return null;
}

export function SiteFooter({
  copyrightLine,
  imprintLabel,
  privacyLabel,
  socialItems,
}: SiteFooterProps) {
  return (
    <footer
      id="footer"
      className="flex w-screen flex-col items-center justify-center gap-8 px-8 py-8 lg:px-24"
    >
      <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:justify-between">
        <Logo />
        {socialItems.length > 0 ? (
          <div className="flex gap-4">
            {socialItems.map((item) => {
              const Icon = socialIcon(item.label);
              return (
                <SiteLink
                  key={item.id}
                  href={item.url}
                  aria-label={item.label}
                  className="inline-flex"
                >
                  {Icon ? (
                    <Icon className="h-6 w-6" aria-hidden />
                  ) : (
                    <span className="text-sm underline">{item.label}</span>
                  )}
                </SiteLink>
              );
            })}
          </div>
        ) : null}
      </div>
      <Separator />
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:justify-between">
        <p>{copyrightLine}</p>
        <div className="flex items-center justify-center gap-4">
          <SiteLink href="/impressum">{imprintLabel}</SiteLink>
          <SiteLink href="/datenschutz">{privacyLabel}</SiteLink>
        </div>
      </div>
    </footer>
  );
}
