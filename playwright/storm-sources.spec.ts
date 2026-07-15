/**
 * Playwright browser automation for public storm data pages.
 *
 * Policy: only visit publicly accessible pages. Do NOT bypass CAPTCHAs,
 * logins, paywalls, or other access restrictions. If a page blocks
 * automation, log the error and skip.
 *
 * Run: npx playwright test
 */
import { test, expect } from "@playwright/test";

const PUBLIC_PAGES = [
  {
    name: "NWS Florida",
    url: "https://www.weather.gov/",
  },
  {
    name: "NHC",
    url: "https://www.nhc.noaa.gov/",
  },
];

test.describe("Public storm sources (ethical checks only)", () => {
  for (const page of PUBLIC_PAGES) {
    test(`can reach ${page.name}`, async ({ page: browserPage }) => {
      const response = await browserPage.goto(page.url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Soft check — network policy may block egress in some environments
      if (!response) {
        test.info().annotations.push({
          type: "note",
          description: `No response for ${page.url} — skipped`,
        });
        return;
      }

      const status = response.status();
      expect(status).toBeLessThan(500);

      // Detect login / captcha walls without attempting to bypass
      const body = (await browserPage.content()).toLowerCase();
      const blocked =
        body.includes("captcha") ||
        body.includes("cf-challenge") ||
        body.includes("please log in");

      if (blocked) {
        test.info().annotations.push({
          type: "note",
          description: `${page.name} appears protected — do not bypass`,
        });
      }

      await browserPage.screenshot({
        path: `test-results/${page.name.replace(/\s+/g, "-").toLowerCase()}.png`,
        fullPage: false,
      });
    });
  }
});
