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
}: {
  setOpen?: (open: boolean) => void;
}) {
  return (
    <Link href="/home" onNavigate={() => setOpen?.(false)}>
      <div className="flex items-center gap-3">
        <Image src="/Logo.svg" alt="Logo" width={70} height={70} priority />
        <div className="flex flex-col">
          <div className={`text-2xl font-bold ${roboto} text-primary`}>
            Kammerchor
          </div>
          <div className={`text-2xl font-bold ${roboto} text-primary`}>
            Elikuren
          </div>
        </div>
      </div>
    </Link>
  );
}
