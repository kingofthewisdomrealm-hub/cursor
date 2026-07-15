import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  timeout: 45000,
  retries: 0,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    headless: true,
    // Never attempt to defeat bot detection
    userAgent:
      "StormOpportunityAgent/0.1 (+https://localhost; research; polite crawler)",
  },
});
