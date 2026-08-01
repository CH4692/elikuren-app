import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";

import { normalizeEmail } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import type { Role } from "@/lib/generated/prisma/client";
import { canRequestMagicLink } from "@/lib/membership-requests";

const resendApiKey =
  process.env.RESEND_API_KEY?.trim() ||
  process.env.AUTH_RESEND_KEY?.trim() ||
  "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    Resend({
      apiKey: resendApiKey || undefined,
      from: process.env.EMAIL_FROM ?? "noreply@kammerchor-elikuren.de",
      // CI / .env.test use re_test_* — skip real Resend calls so Playwright can assert gates.
      async sendVerificationRequest(params) {
        const apiKey = resendApiKey;
        if (!apiKey) {
          throw new Error(
            "RESEND_API_KEY (or AUTH_RESEND_KEY) is not configured",
          );
        }
        if (apiKey.startsWith("re_test")) {
          console.info(
            `[auth:e2e] magic-link skipped (test key) for ${params.identifier}`,
          );
          return;
        }
        const { identifier, url, provider } = params;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: "Anmeldelink – Kammerchor Elikuren",
            html: `<p><a href="${url}">${url}</a></p>`,
          }),
        });
        if (!res.ok) {
          throw new Error(`Resend error: ${await res.text()}`);
        }
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(String(credentials?.email ?? ""));
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          firstname: user.firstname,
          lastname: user.lastname,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, email, account }) {
      if (account?.provider === "resend" && email?.verificationRequest) {
        if (!user.email) return false;
        const allowed = await canRequestMagicLink(user.email);
        if (!allowed) {
          return false;
        }
        return true;
      }

      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isActive: true, sessionVersion: true },
        });
        if (!dbUser?.isActive) return false;
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "mitglied";
        token.firstname = (user as { firstname?: string | null }).firstname ?? null;
        token.lastname = (user as { lastname?: string | null }).lastname ?? null;
        token.sessionVersion =
          (user as { sessionVersion?: number }).sessionVersion ?? 0;
        return token;
      }

      if (!token.id) return token;

      const dbUser = await prisma.user.findUnique({
        where: { id: String(token.id) },
        select: {
          role: true,
          firstname: true,
          lastname: true,
          email: true,
          name: true,
          isActive: true,
          sessionVersion: true,
        },
      });

      if (!dbUser?.isActive) {
        return { ...token, id: undefined, role: undefined, sessionVersion: -1 };
      }

      const tokenVersion =
        typeof token.sessionVersion === "number" ? token.sessionVersion : 0;
      if (dbUser.sessionVersion !== tokenVersion) {
        return { ...token, id: undefined, role: undefined, sessionVersion: -1 };
      }

      token.role = dbUser.role;
      token.firstname = dbUser.firstname;
      token.lastname = dbUser.lastname;
      token.email = dbUser.email;
      token.name = dbUser.name;
      token.sessionVersion = dbUser.sessionVersion;

      // silence unused
      void trigger;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = (token.role as Role) ?? "mitglied";
        session.user.firstname = (token.firstname as string | null) ?? null;
        session.user.lastname = (token.lastname as string | null) ?? null;
        session.user.sessionVersion =
          typeof token.sessionVersion === "number" ? token.sessionVersion : 0;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;
      await prisma.user.update({
        where: { id: user.id },
        data: { lastSignedIn: new Date() },
      });
    },
  },
  trustHost: true,
});
