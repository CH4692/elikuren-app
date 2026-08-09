import { test, expect } from "@playwright/test";

import { loginAsAdmin } from "../helpers/auth";

test.describe("Concerts admin API multi-performance", () => {
  test("create/update with two performances; publish without termin fails", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    const suffix = Date.now();

    const created = await page.request.post("/api/admin/concerts", {
      data: {
        title: `E2E Multi ${suffix}`,
        websiteStatus: "DRAFT",
        description: "Shared program text once",
        programInfo: "Winterreise",
        performances: [
          {
            startsAt: "2026-09-27T17:00",
            location: "HMT Leipzig",
            address: "Grassistraße 8",
            label: "Leipzig",
          },
          {
            startsAt: "2026-10-11T17:00",
            location: "St. Bonifatius Wunstorf",
            label: "Wunstorf",
          },
        ],
      },
    });
    expect(created.status()).toBe(201);
    const concert = (await created.json()) as {
      id: string;
      performances: Array<{ starts_at: string; location: string | null }>;
      performance_count: number;
      starts_at: string | null;
      location: string | null;
    };
    expect(concert.performance_count).toBe(2);
    expect(concert.performances).toHaveLength(2);
    expect(concert.starts_at).toContain("2026-09-27");
    expect(concert.location).toMatch(/Leipzig/i);

    const publishNoTermin = await page.request.post("/api/admin/concerts", {
      data: {
        title: `E2E No Termin ${suffix}`,
        websiteStatus: "PUBLISHED",
        performances: [],
      },
    });
    expect(publishNoTermin.status()).toBe(400);
    const err = (await publishNoTermin.json()) as { detail?: string };
    expect(err.detail).toMatch(/mindestens ein Termin/i);

    const updated = await page.request.patch(
      `/api/admin/concerts/${concert.id}`,
      {
        data: {
          websiteStatus: "PUBLISHED",
          performances: [
            {
              startsAt: "2026-09-27T17:00",
              location: "HMT Leipzig",
              label: "Leipzig",
            },
            {
              startsAt: "2026-10-11T17:00",
              location: "St. Bonifatius Wunstorf",
              label: "Wunstorf",
            },
          ],
        },
      },
    );
    expect(updated.ok()).toBeTruthy();
    const published = (await updated.json()) as {
      website_status: string;
      performance_count: number;
    };
    expect(published.website_status).toBe("PUBLISHED");
    expect(published.performance_count).toBe(2);

    const del = await page.request.delete(`/api/admin/concerts/${concert.id}`);
    expect(del.ok()).toBeTruthy();
  });
});
