"use client";

import Link from "next/link";

export default function MenuLink({
  href,
  children,
  className,
}: {
  href: string;
  children: any;
  className: string;
}) {
  return (
    <Link
      className={`${className} flex hover:text-primary cursor-pointer`}
      href={href}
    >
      {children}
    </Link>
  );
}
