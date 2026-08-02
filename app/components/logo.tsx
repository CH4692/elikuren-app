"use client";
import { Roboto } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export default function Logo({
  setOpen,
  compact = false,
}: {
  setOpen?: (open: boolean) => void;
  /** Smaller mark + type for the mobile top bar. */
  compact?: boolean;
}) {
  const size = compact ? 40 : 70;
  return (
    <Link href="/home" onNavigate={() => setOpen?.(false)} prefetch>
      <div className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
        <Image
          src="/Logo.svg"
          alt="Logo"
          width={size}
          height={size}
          priority
          className={compact ? "size-10" : "size-[70px]"}
        />
        <div className="flex flex-col">
          <div
            className={`font-bold ${roboto.className} text-primary ${
              compact ? "text-base leading-tight" : "text-2xl"
            }`}
          >
            Kammerchor
          </div>
          <div
            className={`font-bold ${roboto.className} text-primary ${
              compact ? "text-base leading-tight" : "text-2xl"
            }`}
          >
            Elikuren
          </div>
        </div>
      </div>
    </Link>
  );
}
