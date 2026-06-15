import { test as base, type Page } from "@playwright/test";

/**
 * Faz login via UI e retorna a página autenticada.
 * Usado pelos testes que precisam de sessão de cliente.
 */
async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/area-cliente");
  await page.getByPlaceholder("seu@email.com").fill(email);
  await page.getByPlaceholder(/senha/i).fill(password);
  await page.getByRole("button", { name: /entrar/i }).click();

  // Aguarda redirecionamento para o portal
  await page.waitForURL(/\/portal\/dashboard/, { timeout: 15_000 });
}

export const test = base.extend<{
  authedPage: Page;
}>({
  authedPage: async ({ page }, use) => {
    const email    = process.env.E2E_EMAIL    ?? "";
    const password = process.env.E2E_PASSWORD ?? "";

    if (!email || !password) {
      throw new Error("Defina E2E_EMAIL e E2E_PASSWORD no .env.test.local");
    }

    await loginAs(page, email, password);
    await use(page);
  },
});

export { expect } from "@playwright/test";
