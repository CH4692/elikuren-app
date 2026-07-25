import { test, expect } from "@playwright/test";

const ensembles = [
  { path: "/ensembles/elikuren", title: "Kammerchor Elikuren" },
  { path: "/ensembles/eight-to-the-bar", title: "Eight to the Bar" },
  { path: "/ensembles/musical-team", title: "musical team" },
] as const;

for (const ensemble of ensembles) {
  test(`${ensemble.path} renders and links to contact`, async ({ page }) => {
    await page.goto(ensemble.path);
    await expect(
      page.getByRole("heading", { level: 1, name: ensemble.title }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Kontakt aufnehmen/i }).first(),
    ).toBeVisible();
  });
}
