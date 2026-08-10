import type { ReactNode } from "react";

import { PublicShellClient } from "@/components/navbar/public-shell-client";
import {
  filterPublicNavigation,
  filterPublicSocial,
  getPublicFooter,
  getPublicNavigation,
  getPublicSocial,
} from "@/lib/site-content";

export async function PublicShell({ children }: { children: ReactNode }) {
  // Parallel calls share one request-deduped + tagged global page load.
  const [nav, footer, social] = await Promise.all([
    getPublicNavigation(),
    getPublicFooter(),
    getPublicSocial(),
  ]);

  if (!footer) {
    console.error("[site-content] global/footer missing or invalid");
  }

  return (
    <PublicShellClient
      navItems={filterPublicNavigation(nav)}
      footer={
        footer
          ? {
              copyrightLine: footer.copyrightLine,
              imprintLabel: footer.imprintLabel,
              privacyLabel: footer.privacyLabel,
              tagline: footer.tagline,
              socialItems: filterPublicSocial(social).map((item) => ({
                id: item.id,
                label: item.label,
                url: item.url,
              })),
            }
          : null
      }
    >
      {children}
    </PublicShellClient>
  );
}
