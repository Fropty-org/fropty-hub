import { test, expect } from "@playwright/test";

test.describe("Configurador de planos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/configurador");
  });

  test("exibe preço base R$499", async ({ page }) => {
    await expect(page.getByText("R$ 499,00")).toBeVisible();
    await expect(page.getByText("App completo")).toBeVisible();
  });

  test("adicionar addon atualiza total", async ({ page }) => {
    await page.getByText("Login com Google").click();
    await expect(page.getByText("Total do app")).toBeVisible();
    // R$499 + R$79 = R$578
    await expect(page.getByText("R$ 578,00")).toBeVisible();
  });

  test("selecionar plano de manutenção aparece no resumo", async ({ page }) => {
    await page.getByText("Básico").first().click();
    await expect(page.getByText("Total mensal")).toBeVisible();
    await expect(page.getByText("Total geral (1º mês)")).toBeVisible();
  });

  test("botão de envio desabilitado sem nome e email", async ({ page }) => {
    const btn = page.getByRole("button", { name: /Solicitar orçamento/ });
    await expect(btn).toBeDisabled();
  });

  test("botão habilitado com nome e email preenchidos", async ({ page }) => {
    await page.getByPlaceholder("Seu nome").fill("Teste Silva");
    await page.getByPlaceholder("Seu e-mail").fill("teste@exemplo.com");
    const btn = page.getByRole("button", { name: /Solicitar orçamento/ });
    await expect(btn).toBeEnabled();
  });
});
