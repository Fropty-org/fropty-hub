import { defineConfig, devices } from "@playwright/test";
import path from "path";
import fs from "fs";

// Carrega credenciais E2E de .env.test.local (fora do git) sem depender de dotenv.
try {
  for (const line of fs.readFileSync(path.join(__dirname, ".env.test.local"), "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* arquivo é opcional */ }

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Ambientes com Chromium pré-instalado (ex.: Claude Code remoto) podem
    // apontar PW_CHROMIUM_PATH em vez de baixar browsers do Playwright.
    ...(process.env.PW_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npx next dev --turbopack",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  outputDir: path.join(__dirname, "playwright-results"),
});
