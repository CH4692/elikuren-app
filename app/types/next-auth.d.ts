import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      firstname?: string | null;
      lastname?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    firstname?: string | null;
    lastname?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    firstname?: string | null;
    lastname?: string | null;
  }
}
