import { test, expect } from "@playwright/test";

/**
 * Specs alinhados à tela real de /area-cliente:
 * - inputs identificados por name (email/password) — placeholders mudam
 * - não existe cadastro público (clientes são convidados pelo admin)
 * - modo de recuperação de senha abre via botão "Esqueceu?"
 */

test.describe("Página de login (/area-cliente)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/area-cliente");
  });

  test("exibe formulário de login por padrão", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /entrar na sua conta/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /^entrar$/i })).toBeVisible();
  });

  test("abre modo de recuperação de senha", async ({ page }) => {
    await page.getByRole("button", { name: /esqueceu/i }).click();
    await expect(page.getByRole("heading", { name: /recuperar senha/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /voltar/i })).toBeVisible();
    // No modo de recuperação o campo de senha some
    await expect(page.locator('input[name="password"]')).toHaveCount(0);
  });

  test("exibe erro com credenciais inválidas", async ({ page }) => {
    await page.locator('input[name="email"]').fill("naoexiste@fropty.com");
    await page.locator('input[name="password"]').fill("senhaerrada123");
    await page.getByRole("button", { name: /^entrar$/i }).click();

    await expect(page.getByText(/e-mail ou senha incorretos/i)).toBeVisible({ timeout: 10_000 });
  });

  test("não envia com campos vazios (validação nativa)", async ({ page }) => {
    await page.getByRole("button", { name: /^entrar$/i }).click();
    await expect(page).toHaveURL(/area-cliente/);
    await expect(page.getByRole("heading", { name: /entrar na sua conta/i })).toBeVisible();
  });
});

test.describe("Rotas protegidas (sem sessão)", () => {
  test("rota do portal redireciona visitante para /area-cliente", async ({ page }) => {
    await page.goto("/portal/dashboard");
    await expect(page).toHaveURL(/area-cliente/, { timeout: 8_000 });
  });

  test("rota admin redireciona visitante para /area-cliente", async ({ page }) => {
    await page.goto("/admin/overview");
    await expect(page).toHaveURL(/area-cliente/, { timeout: 8_000 });
  });
});

test.describe("Login com credenciais válidas", () => {
  const email    = process.env.E2E_EMAIL    ?? "";
  const password = process.env.E2E_PASSWORD ?? "";

  test("redireciona cliente para /portal/dashboard", async ({ page }) => {
    test.skip(!email || !password, "E2E_EMAIL/E2E_PASSWORD não definidos");

    await page.goto("/area-cliente");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole("button", { name: /^entrar$/i }).click();

    await expect(page).toHaveURL(/\/portal\/dashboard/, { timeout: 15_000 });
    // Sidebar do portal visível com o perfil carregado
    await expect(page.locator("aside").first()).toBeVisible();
  });
});
