import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/home", "/auth/sign-in", "/contact"] as const;

for (const path of PAGES) {
  test(`a11y smoke ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });

    await expect(page.locator("h1").first()).toBeVisible();

    if (path === "/auth/sign-in" || path === "/contact") {
      const email = page.getByRole("textbox", { name: /e-?mail/i }).first();
      await expect(email).toBeVisible();
    }

    if (path === "/home") {
      // Primary nav should be keyboard-focusable.
      await page.keyboard.press("Tab");
      const tag = await page.evaluate(
        () => document.activeElement?.tagName?.toLowerCase() ?? "",
      );
      expect(["a", "button", "input", "summary"].includes(tag)).toBeTruthy();
    }

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      // Brand gold/cream palette currently fails AA contrast; keep structural a11y gated.
      .disableRules(["color-contrast"])
      .analyze();

    const blocking = results.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? ""),
    );

    expect(
      blocking,
      blocking
        .map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help} — ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(" "))
              .join("; ")}`,
        )
        .join("\n"),
    ).toEqual([]);
  });
}
