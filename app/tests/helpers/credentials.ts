export function getE2EAdminCredentials() {
  const email =
    process.env.E2E_ADMIN_EMAIL?.trim().toLowerCase() ||
    process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() ||
    "e2e-admin@kammerchor-elikuren.test";
  const password =
    process.env.E2E_ADMIN_PASSWORD ||
    process.env.SEED_ADMIN_PASSWORD ||
    "E2E-Admin-Test-Password!";

  return { email, password };
}

export function getE2EMemberCredentials() {
  return {
    email:
      process.env.E2E_MEMBER_EMAIL?.trim().toLowerCase() ||
      "e2e-member@kammerchor-elikuren.test",
    password:
      process.env.E2E_MEMBER_PASSWORD || "E2E-Member-Test-Password!",
  };
}

export function getE2EAuditorCredentials() {
  return {
    email:
      process.env.E2E_AUDITOR_EMAIL?.trim().toLowerCase() ||
      "e2e-kassenpruefer@kammerchor-elikuren.test",
    password:
      process.env.E2E_AUDITOR_PASSWORD || "E2E-Auditor-Test-Password!",
  };
}

export const PENDING_APPROVAL_MESSAGE =
  /Falls dein Zugang bereits freigegeben wurde, erhältst du in Kürze einen Anmeldelink\. Andernfalls wirst du informiert, sobald ein Administrator deinen Zugang freigegeben hat\./;
