import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Render CMS-validated href as Next Link (internal) or safe external anchor. */
export function SiteLink({
  href,
  children,
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const external = /^https:\/\//i.test(href);
  if (external) {
    return (
      <a
        href={href}
        className={cn(className)}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(className)} {...rest}>
      {children}
    </Link>
  );
}
