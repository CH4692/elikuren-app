import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "../helpers/auth";

test.describe.configure({ mode: "serial" });

test.describe("Public CMS migration + cache invalidation", () => {
  test("warm /home cache, edit CMS text, see update without restart", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    // Warm public cache before mutation (logged-in session is fine).
    await page.goto("/home");
    await expect(page.locator("#landing")).toBeVisible({ timeout: 15000 });

    await page.goto("/admin/site/pages/home");
    const tagline = page.locator("#tagline");
    await expect(tagline).toBeVisible({ timeout: 15000 });
    const original = await tagline.inputValue();
    const marker = `E2E Public ${Date.now()}`;

    await tagline.fill(marker);
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });

    const api = await page.request.get("/api/admin/site/pages/home");
    expect(api.ok()).toBeTruthy();
    const body = (await api.json()) as {
      sections: Array<{ key: string; data: { tagline?: string } }>;
    };
    const landing = body.sections.find((s) => s.key === "landing");
    expect(landing?.data.tagline).toBe(marker);

    await page.goto("/home");
    await expect(page.locator("#landing")).toContainText(marker, {
      timeout: 15000,
    });

    await page.goto("/admin/site/pages/home");
    await page.locator("#tagline").fill(original);
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });

    await page.goto("/home");
    await expect(page.locator("#landing")).toContainText(original, {
      timeout: 15000,
    });
  });

  test("hiding toggleable home support omits the section after cache warm", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/home");
    await expect(page.getByTestId("home-support")).toHaveCount(1);

    await page.goto("/admin/site/pages/home");
    await expect(page.getByRole("heading", { name: "Startseite" })).toBeVisible({
      timeout: 15000,
    });

    const supportSwitch = page.locator("#visible-support");
    await expect(supportSwitch).toBeVisible();
    if (!(await supportSwitch.isChecked())) {
      await supportSwitch.check();
    }

    await supportSwitch.uncheck();
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });

    const hiddenApi = await page.request.get("/api/admin/site/pages/home");
    const hiddenBody = (await hiddenApi.json()) as {
      sections: Array<{ key: string; is_visible: boolean }>;
    };
    expect(
      hiddenBody.sections.find((s) => s.key === "support")?.is_visible,
    ).toBe(false);

    await page.goto("/home");
    await expect(page.getByTestId("home-support")).toHaveCount(0);

    await page.goto("/admin/site/pages/home");
    await page.locator("#visible-support").check();
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });

    const shownApi = await page.request.get("/api/admin/site/pages/home");
    const shownBody = (await shownApi.json()) as {
      sections: Array<{ key: string; is_visible: boolean }>;
    };
    expect(
      shownBody.sections.find((s) => s.key === "support")?.is_visible,
    ).toBe(true);

    await page.goto("/home");
    await expect(page.getByTestId("home-support")).toHaveCount(1);
    await expect(page.getByTestId("home-support")).toBeAttached();
  });

  test("global footer edit updates warm public + legal consumers", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/about");
    await expect(page.locator("#footer").first()).toBeVisible({
      timeout: 15000,
    });
    await page.goto("/impressum");
    await expect(page.locator("#footer").first()).toBeVisible();

    await page.goto("/admin/site/global/footer");
    const copyright = page.locator("#copyrightLine");
    await expect(copyright).toBeVisible({ timeout: 15000 });
    const original = await copyright.inputValue();
    const marker = `E2E Footer ${Date.now()}`;

    await copyright.fill(marker);
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });

    await page.goto("/about");
    await expect(page.locator("#footer").first()).toContainText(marker);
    await page.goto("/impressum");
    await expect(page.locator("#footer").first()).toContainText(marker);

    await page.goto("/admin/site/global/footer");
    await page.locator("#copyrightLine").fill(original);
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });
  });

  test("organization email appears on impressum after warm cache", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/impressum");
    await expect(page.getByRole("heading", { name: /Impressum/i })).toBeVisible({
      timeout: 15000,
    });

    await page.goto("/admin/site/global/organization");
    const email = page.locator("#email");
    await expect(email).toBeVisible({ timeout: 15000 });
    const original = await email.inputValue();
    const markerLocal = `e2e-org-${Date.now()}`;
    const marker = `${markerLocal}@kammerchor-elikuren.test`;

    await email.fill(marker);
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });

    await page.goto("/impressum");
    await expect(page.getByText(marker)).toBeVisible({ timeout: 15000 });

    await page.goto("/admin/site/global/organization");
    await page.locator("#email").fill(original);
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });
  });

  test("page metadata title updates after save", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/about");
    await expect(page).toHaveTitle(/./);

    await page.goto("/admin/site/pages/about");
    const metaTitle = page.locator("#metaTitle");
    await expect(metaTitle).toBeVisible({ timeout: 15000 });
    const original = await metaTitle.inputValue();
    const marker = `E2E Meta ${Date.now()}`;

    await metaTitle.fill(marker);
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });

    await page.goto("/about");
    await expect(page).toHaveTitle(
      new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );

    await page.goto("/admin/site/pages/about");
    await page.locator("#metaTitle").fill(original);
    await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
    await expect(page.getByText("Alle Änderungen gespeichert")).toBeVisible({
      timeout: 15000,
    });
  });
});
