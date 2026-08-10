import { expect, test } from "@playwright/test";

import { loginAsAdmin, loginAsMember } from "../helpers/auth";

test.describe("Website CMS admin API", () => {
  test("SITE_MANAGE required for list and page endpoints", async ({
    page,
  }) => {
    await loginAsMember(page);

    const list = await page.request.get("/api/admin/site");
    expect(list.status()).toBe(403);

    const home = await page.request.get("/api/admin/site/pages/home");
    expect(home.status()).toBe(403);
  });

  test("rejects invalid pageKey and global SEO writes", async ({ page }) => {
    await loginAsAdmin(page);

    const missing = await page.request.get(
      "/api/admin/site/pages/not_a_real_page",
    );
    expect(missing.status()).toBe(404);

    const globalGet = await page.request.get("/api/admin/site/pages/global");
    expect(globalGet.ok()).toBeTruthy();
    const globalPage = (await globalGet.json()) as {
      sections: Array<{ key: string; data: unknown; is_visible: boolean }>;
    };
    const footer = globalPage.sections.find((s) => s.key === "footer");
    expect(footer).toBeTruthy();

    const seoOnGlobal = await page.request.put("/api/admin/site/pages/global", {
      data: {
        metaTitle: "should fail",
        sections: [
          {
            key: "footer",
            data: footer!.data,
            isVisible: true,
          },
        ],
      },
    });
    expect(seoOnGlobal.status()).toBe(400);
    const seoErr = (await seoOnGlobal.json()) as { detail?: string };
    expect(seoErr.detail).toMatch(/SEO/i);
  });

  test("rejects editing global section through unknown public keys", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const res = await page.request.put("/api/admin/site/pages/home", {
      data: {
        sections: [
          {
            key: "organization",
            data: { choirName: "Nope" },
            isVisible: true,
          },
        ],
      },
    });
    expect(res.status()).toBe(400);
  });

  test("enforces fixed visibility and returns updated state", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    const current = await page.request.get("/api/admin/site/pages/global");
    expect(current.ok()).toBeTruthy();
    const body = (await current.json()) as {
      sections: Array<{
        key: string;
        data: Record<string, unknown>;
        is_visible: boolean;
      }>;
      last_updated: string;
    };
    const org = body.sections.find((s) => s.key === "organization");
    expect(org).toBeTruthy();

    const hideFixed = await page.request.put("/api/admin/site/pages/global", {
      data: {
        sections: [
          {
            key: "organization",
            data: org!.data,
            isVisible: false,
          },
        ],
      },
    });
    expect(hideFixed.status()).toBe(400);

    const originalName = String(org!.data.choirName ?? "");
    const marker = `E2E Org ${Date.now()}`;
    const saved = await page.request.put("/api/admin/site/pages/global", {
      data: {
        sections: [
          {
            key: "organization",
            data: { ...org!.data, choirName: marker },
            isVisible: true,
          },
        ],
      },
    });
    expect(saved.ok()).toBeTruthy();
    const savedBody = (await saved.json()) as {
      sections: Array<{ key: string; data: { choirName?: string } }>;
      last_updated: string;
    };
    const savedOrg = savedBody.sections.find((s) => s.key === "organization");
    expect(savedOrg?.data.choirName).toBe(marker);
    expect(savedBody.last_updated).toBeTruthy();

    const restore = await page.request.put("/api/admin/site/pages/global", {
      data: {
        sections: [
          {
            key: "organization",
            data: { ...org!.data, choirName: originalName },
            isVisible: true,
          },
        ],
      },
    });
    expect(restore.ok()).toBeTruthy();
  });
});
