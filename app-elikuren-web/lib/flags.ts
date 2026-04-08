export const flags = {
  authDisbled: process.env.NEXT_PUBLIC_FLAG_AUTH_DISABLED === "true",
} as const;
