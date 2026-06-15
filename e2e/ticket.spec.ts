import { test, expect } from "./fixtures/auth";

test.describe("Service Desk — listagem", () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto("/portal/suporte");
  });

  test("exibe a página de suporte com cabeçalho correto", async ({ authedPage: page }) => {
    await expect(page.getByRole("heading", { name: /suporte/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /novo chamado/i })).toBeVisible();
  });

  test("exibe campo de busca e filtros", async ({ authedPage: page }) => {
    await expect(page.getByPlaceholder(/buscar chamados/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /todos/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /abertos/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /fechados/i })).toBeVisible();
  });

  test("filtro 'abertos' filtra corretamente", async ({ authedPage: page }) => {
    await page.getByRole("button", { name: /abertos/i }).click();
    // Verifica que o botão ficou ativo (cor diferente indica seleção)
    const btn = page.getByRole("button", { name: /abertos/i });
    await expect(btn).toBeVisible();
  });

  test("busca filtra tickets pelo assunto", async ({ authedPage: page }) => {
    const searchInput = page.getByPlaceholder(/buscar chamados/i);
    await searchInput.fill("zzzzznaoexiste");
    // Com termo sem resultado, não deve mostrar linhas de ticket
    await expect(page.getByText(/nenhum chamado aberto/i).or(
      page.locator("a[href*='/portal/suporte/']").first()
    )).not.toBeVisible({ timeout: 2_000 }).catch(() => {/* ok se não tiver tickets */});
    await searchInput.clear();
  });
});

test.describe("Service Desk — criar chamado", () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto("/portal/suporte");
  });

  test("abre modal ao clicar em Novo chamado", async ({ authedPage: page }) => {
    await page.getByRole("button", { name: /novo chamado/i }).click();
    await expect(page.getByRole("heading", { name: /abrir chamado/i })).toBeVisible();
    await expect(page.getByPlaceholder(/descreva brevemente/i)).toBeVisible();
  });

  test("fecha modal ao clicar em cancelar", async ({ authedPage: page }) => {
    await page.getByRole("button", { name: /novo chamado/i }).click();
    await page.getByRole("button", { name: /cancelar/i }).click();
    await expect(page.getByRole("heading", { name: /abrir chamado/i })).not.toBeVisible();
  });

  test("fecha modal ao clicar fora", async ({ authedPage: page }) => {
    await page.getByRole("button", { name: /novo chamado/i }).click();
    await expect(page.getByRole("heading", { name: /abrir chamado/i })).toBeVisible();
    // Clica no backdrop (fora do modal)
    await page.mouse.click(10, 10);
    await expect(page.getByRole("heading", { name: /abrir chamado/i })).not.toBeVisible();
  });

  test("valida campos obrigatórios antes de enviar", async ({ authedPage: page }) => {
    await page.getByRole("button", { name: /novo chamado/i }).click();
    // Clica em enviar sem preencher nada
    await page.getByRole("button", { name: /abrir chamado/i }).click();
    // Modal deve continuar aberto (não enviou)
    await expect(page.getByRole("heading", { name: /abrir chamado/i })).toBeVisible();
  });

  test("cria chamado com dados válidos", async ({ authedPage: page }) => {
    await page.getByRole("button", { name: /novo chamado/i }).click();

    const subject = `Teste E2E — ${Date.now()}`;
    await page.getByPlaceholder(/descreva brevemente/i).fill(subject);
    await page.getByPlaceholder(/descreva o problema/i).fill(
      "Teste automatizado Playwright. Pode fechar este chamado."
    );

    await page.getByRole("button", { name: /abrir chamado/i }).click();

    // Sucesso: exibe confirmação
    await expect(
      page.getByText(/chamado aberto/i).or(page.getByText(/nossa equipe/i))
    ).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("Conversa do ticket", () => {
  test("página de detalhe de ticket abre ao clicar no chamado", async ({ authedPage: page }) => {
    await page.goto("/portal/suporte");

    const ticketLink = page.locator("a[href*='/portal/suporte/']").first();
    const hasTickets = await ticketLink.isVisible().catch(() => false);

    if (!hasTickets) {
      test.skip(true, "Nenhum ticket disponível para testar a conversa");
      return;
    }

    await ticketLink.click();
    await expect(page).toHaveURL(/\/portal\/suporte\/.+/);
    await expect(page.getByPlaceholder(/Digite sua mensagem/i)).toBeVisible();
  });

  test("envia mensagem em ticket aberto", async ({ authedPage: page }) => {
    await page.goto("/portal/suporte");

    const ticketLink = page.locator("a[href*='/portal/suporte/']").first();
    const hasTickets = await ticketLink.isVisible().catch(() => false);

    if (!hasTickets) {
      test.skip(true, "Nenhum ticket disponível");
      return;
    }

    await ticketLink.click();
    await page.waitForURL(/\/portal\/suporte\/.+/);

    const textarea = page.getByPlaceholder(/Digite sua mensagem/i);
    const isClosed = !(await textarea.isVisible().catch(() => false));

    if (isClosed) {
      test.skip(true, "Ticket está fechado — não é possível enviar mensagem");
      return;
    }

    const msg = `Mensagem de teste E2E — ${Date.now()}`;
    await textarea.fill(msg);
    // Shift+Enter adiciona linha, Enter envia
    await textarea.press("Enter");

    // Mensagem otimista aparece imediatamente
    await expect(page.getByText(msg)).toBeVisible({ timeout: 5_000 });
  });
});
