import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PublicShell } from "@/components/navbar/public-shell";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
} from "@/lib/site-content/seo";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE_DEFAULT_TITLE,
  description: SITE_DEFAULT_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <PublicShell>{children}</PublicShell>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
