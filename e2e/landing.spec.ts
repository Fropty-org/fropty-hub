import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("exibe headline principal", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("app sob medida");
  });

  test("navbar tem links de navegação", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Planos" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Exemplos" })).toBeVisible();
    await expect(page.getByRole("link", { name: "FAQ" })).toBeVisible();
  });

  test("seção de planos é visível", async ({ page }) => {
    await page.getByRole("link", { name: "Planos" }).click();
    await expect(page.getByText("Prévia gratuita")).toBeVisible();
    await expect(page.getByText("App completo")).toBeVisible();
  });

  test("FAQ accordion abre e fecha", async ({ page }) => {
    await page.goto("/#faq");
    const firstQ = page.locator("button").filter({ hasText: "A prévia é gratuita mesmo?" });
    await firstQ.click();
    await expect(page.getByText("Sim. Você conta sua ideia")).toBeVisible();
    await firstQ.click();
    await expect(page.getByText("Sim. Você conta sua ideia")).not.toBeVisible();
  });

  test("footer está presente com links legais", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Termos de Uso" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacidade" })).toBeVisible();
  });

  test("tema toggle existe", async ({ page }) => {
    await expect(page.getByTitle("Claro")).toBeVisible();
    await expect(page.getByTitle("Escuro")).toBeVisible();
  });
});
