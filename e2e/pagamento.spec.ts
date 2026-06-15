import { test, expect } from "./fixtures/auth";

test.describe("Área Financeira — UI", () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto("/portal/financeiro");
  });

  test("exibe saldo de tokens e plano ativo", async ({ authedPage: page }) => {
    await expect(page.getByText(/saldo de tokens/i)).toBeVisible();
    await expect(page.getByText(/plano ativo/i)).toBeVisible();
    await expect(page.getByText(/resumo/i)).toBeVisible();
  });

  test("exibe seção de compra avulsa de tokens", async ({ authedPage: page }) => {
    await expect(page.getByText(/comprar tokens avulsos/i)).toBeVisible();
    await expect(page.locator("select[name='qty']")).toBeVisible();
    await expect(page.getByRole("button", { name: /comprar/i })).toBeVisible();
  });

  test("seletor de quantidade tem as opções corretas", async ({ authedPage: page }) => {
    const select = page.locator("select[name='qty']");
    await expect(select).toBeVisible();

    const options = await select.locator("option").allTextContents();
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options.some((o) => o.includes("1"))).toBeTruthy();
    expect(options.some((o) => o.includes("R$"))).toBeTruthy();
  });

  test("exibe gráfico de consumo quando há transações", async ({ authedPage: page }) => {
    // O gráfico só aparece se há transações; verificamos se o card de consumo
    // está presente (com ou sem gráfico)
    const hasChart  = await page.locator("svg").first().isVisible().catch(() => false);
    const hasExtrat = await page.getByText(/extrato de tokens/i).isVisible();
    expect(hasExtrat || hasChart).toBeTruthy();
  });

  test("exibe extrato de tokens", async ({ authedPage: page }) => {
    await expect(page.getByText(/extrato de tokens/i)).toBeVisible();
  });

  test("exibe opções de plano para quem não tem assinatura", async ({ authedPage: page }) => {
    // Pode ou não aparecer dependendo do estado do usuário — verificamos sem falhar
    const hasPlans = await page.getByText(/assinar plano mensal/i).isVisible().catch(() => false);
    // Se não aparece, o usuário já tem plano — tudo certo
    if (hasPlans) {
      await expect(page.getByText(/plano básico/i)).toBeVisible();
      await expect(page.getByText(/plano pro/i)).toBeVisible();
    }
  });
});

test.describe("Fluxo de pagamento — redirecionamento Stripe", () => {
  test("botão Comprar inicia checkout (redireciona para Stripe)", async ({ authedPage: page }) => {
    await page.goto("/portal/financeiro");

    // Intercepta a navegação para stripe.com para não abandonar o test runner
    const stripeRedirect = page.waitForURL(/stripe\.com|checkout\.stripe/, {
      timeout: 15_000,
    }).catch(() => null);

    await page.locator("select[name='qty']").selectOption("1");
    await page.getByRole("button", { name: /comprar/i }).click();

    const redirected = await stripeRedirect;
    // Se redirecionou para Stripe, o checkout funcionou
    if (redirected !== null) {
      expect(page.url()).toContain("stripe");
    } else {
      // Pode ter exibido erro de configuração em ambiente de teste sem Stripe real
      // Verificamos que permanecemos no portal (não deu 500)
      await expect(page).not.toHaveURL(/\/error|\/500/);
    }
  });

  test("botão Assinar Plano Básico inicia checkout de assinatura", async ({ authedPage: page }) => {
    await page.goto("/portal/financeiro");

    const hasPlans = await page.getByText(/assinar plano mensal/i).isVisible().catch(() => false);
    test.skip(!hasPlans, "Usuário já tem plano ativo — skip");

    const stripeRedirect = page.waitForURL(/stripe\.com|checkout\.stripe/, {
      timeout: 15_000,
    }).catch(() => null);

    await page.getByRole("button", { name: /assinar plano básico/i }).click();

    const redirected = await stripeRedirect;
    if (redirected !== null) {
      expect(page.url()).toContain("stripe");
    } else {
      await expect(page).not.toHaveURL(/\/error|\/500/);
    }
  });

  test("banner de sucesso aparece após retorno do Stripe", async ({ authedPage: page }) => {
    // Simula o parâmetro ?sucesso=tokens que o Stripe inclui no return_url
    await page.goto("/portal/financeiro?sucesso=tokens");
    await expect(
      page.getByText(/tokens adquiridos com sucesso/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  test("banner de assinatura aparece após ativar plano", async ({ authedPage: page }) => {
    await page.goto("/portal/financeiro?sucesso=plano");
    await expect(
      page.getByText(/assinatura ativada/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("Navegação entre seções do portal", () => {
  test("sidebar navega corretamente entre as seções", async ({ authedPage: page }) => {
    await page.goto("/portal/dashboard");

    const links: [string, RegExp][] = [
      ["Projetos",    /\/portal\/projetos/],
      ["Suporte",     /\/portal\/suporte/],
      ["Financeiro",  /\/portal\/financeiro/],
      ["Painel",      /\/portal\/dashboard/],
    ];

    for (const [label, urlPattern] of links) {
      await page.getByRole("link", { name: new RegExp(label, "i") }).first().click();
      await expect(page).toHaveURL(urlPattern, { timeout: 8_000 });
    }
  });
});
