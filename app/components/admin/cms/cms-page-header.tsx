import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function CmsPageHeader({
  breadcrumb,
  title,
  description,
  status,
  actions,
  className,
}: {
  breadcrumb?: Array<{ label: string; href?: string }>;
  title: string;
  description?: string;
  status?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 space-y-3 sm:mb-8", className)}>
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav aria-label="Brotkrumen" className="text-sm text-[#8a8478]">
          <ol className="flex flex-wrap items-center gap-1.5">
            {breadcrumb.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden>/</span> : null}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-[#5c574e] underline-offset-2 hover:text-[#1f1f23] hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[#1f1f23]">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[#1f1f23] sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-[#5c574e]">{description}</p>
          ) : null}
          {status ? (
            <div className="pt-1 text-sm text-[#5c574e]">{status}</div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
