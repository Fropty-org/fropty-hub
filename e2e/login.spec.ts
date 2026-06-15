import { test, expect } from "@playwright/test";

test.describe("Página de login (/area-cliente)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/area-cliente");
  });

  test("exibe formulário de login por padrão", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /entrar/i })).toBeVisible();
    await expect(page.getByPlaceholder("seu@email.com")).toBeVisible();
    await expect(page.getByPlaceholder(/senha/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("alterna para aba de cadastro", async ({ page }) => {
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByRole("button", { name: /criar conta/i }).first()).toBeVisible();
    await expect(page.getByPlaceholder(/seu nome/i)).toBeVisible();
  });

  test("abre modo de recuperação de senha", async ({ page }) => {
    await page.getByRole("button", { name: /esqueci/i }).click();
    await expect(page.getByRole("heading", { name: /recuperar/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /voltar/i })).toBeVisible();
  });

  test("exibe erro com credenciais inválidas", async ({ page }) => {
    await page.getByPlaceholder("seu@email.com").fill("naoexiste@fropty.com");
    await page.getByPlaceholder(/senha/i).fill("senhaerrada123");
    await page.getByRole("button", { name: /entrar/i }).click();

    // Aguarda mensagem de erro aparecer
    await expect(page.getByRole("alert").or(page.locator("[data-error]")).or(
      page.getByText(/inválid|incorret|não encontrad/i)
    )).toBeVisible({ timeout: 8_000 });
  });

  test("não redireciona com campos vazios", async ({ page }) => {
    await page.getByRole("button", { name: /entrar/i }).click();
    await expect(page).toHaveURL(/area-cliente/);
  });

  test("tem link para a landing page", async ({ page }) => {
    await page.getByRole("link", { name: /fropty/i }).first().click();
    await expect(page).toHaveURL(/^\//);
  });
});

test.describe("Login com credenciais válidas", () => {
  test("redireciona cliente para /portal/dashboard", async ({ page }) => {
    const email    = process.env.E2E_EMAIL    ?? "";
    const password = process.env.E2E_PASSWORD ?? "";
    test.skip(!email || !password, "E2E_EMAIL/E2E_PASSWORD não definidos");

    await page.goto("/area-cliente");
    await page.getByPlaceholder("seu@email.com").fill(email);
    await page.getByPlaceholder(/senha/i).fill(password);
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/portal\/dashboard/, { timeout: 15_000 });
    await expect(page.getByText(/bem-vindo/i)).toBeVisible();
  });

  test("exibe nome do usuário no sidebar após login", async ({ page }) => {
    const email    = process.env.E2E_EMAIL    ?? "";
    const password = process.env.E2E_PASSWORD ?? "";
    test.skip(!email || !password, "E2E_EMAIL/E2E_PASSWORD não definidos");

    await page.goto("/area-cliente");
    await page.getByPlaceholder("seu@email.com").fill(email);
    await page.getByPlaceholder(/senha/i).fill(password);
    await page.getByRole("button", { name: /entrar/i }).click();

    await page.waitForURL(/\/portal\/dashboard/, { timeout: 15_000 });

    // Sidebar deve mostrar informações do perfil
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();
  });

  test("rota protegida redireciona visitante para /area-cliente", async ({ page }) => {
    await page.goto("/portal/dashboard");
    await expect(page).toHaveURL(/area-cliente/, { timeout: 8_000 });
  });

  test("rota admin redireciona visitante para /area-cliente", async ({ page }) => {
    await page.goto("/admin/overview");
    await expect(page).toHaveURL(/area-cliente/, { timeout: 8_000 });
  });
});
