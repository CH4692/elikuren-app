import { execSync } from "node:child_process";
import path from "node:path";

/**
 * Upsert an active credential user via tsx CLI (avoids loading Prisma inside Playwright's ESM runner).
 */
export function upsertCredentialUser(input: {
  email: string;
  password: string;
  role?: string;
  firstname?: string;
  lastname?: string;
  voice?: string;
}): { id: string; email: string } {
  // helpers/ → app/ (not tests/), so ./tests/seed-temp-user.ts resolves correctly
  const out = execSync("npx tsx ./tests/seed-temp-user.ts", {
    cwd: path.join(__dirname, "../.."),
    env: {
      ...process.env,
      E2E_TEMP_EMAIL: input.email,
      E2E_TEMP_PASSWORD: input.password,
      E2E_TEMP_ROLE: input.role ?? "mitglied",
      E2E_TEMP_FIRSTNAME: input.firstname ?? "E2E",
      E2E_TEMP_LASTNAME: input.lastname ?? "Temp",
      E2E_TEMP_VOICE: input.voice ?? "Alt",
    },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  const line = out
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .pop();
  if (!line) {
    throw new Error("seed-temp-user produced no output");
  }
  return JSON.parse(line) as { id: string; email: string };
}
