import { test, expect } from "@playwright/test";

test.describe("Formulário de orçamento", () => {
  test("modal abre ao clicar em Pedir orçamento grátis", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Pedir orçamento grátis/ }).first().click();
    await expect(page.getByRole("heading", { name: /Peça seu orçamento/ })).toBeVisible();
  });

  test("modal fecha ao clicar no X", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Pedir orçamento grátis/ }).first().click();
    await page.getByRole("button", { name: "Fechar" }).click();
    await expect(page.getByRole("heading", { name: /Peça seu orçamento/ })).not.toBeVisible();
  });

  test("formulário valida campos obrigatórios", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Pedir orçamento grátis/ }).first().click();
    const submitBtn = page.getByRole("button", { name: /Enviar pedido/ });
    await submitBtn.click();
    // Native HTML validation prevents submit — form stays open
    await expect(page.getByRole("heading", { name: /Peça seu orçamento/ })).toBeVisible();
  });

  test("404 exibe página personalizada", async ({ page }) => {
    await page.goto("/pagina-que-nao-existe");
    await expect(page.getByText("Página não encontrada")).toBeVisible();
    await expect(page.getByRole("link", { name: /Voltar ao início/ })).toBeVisible();
  });
});
