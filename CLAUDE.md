# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

fropty.com — landing page, configurador e portal de clientes da **Fropty (Intelligent Software Ecosystem)**. Todo o conteúdo é em português brasileiro (pt-BR).

### Modelo de produto

- A **Fropty** vende módulos/serviços do ecossistema: FroptyCash, FroptyInvest, FroptyBoost, FroptySentinel (security), FroptyAI, FroptyAds, FroptyCRM, FroptyApps.
- **FroptyApps** é uma perna à parte: um **catálogo** de micro-SaaS, apps mobile e dashboards. É onde a pessoa olha o que existe e escolhe o que se aplica; a Fropty então copia e customiza (logo, cores, identidade do cliente). **Não** é uma ferramenta para o cliente montar o próprio app.
- A **área de cliente** (`/area-cliente` → `/portal/*`) é para quem **já contratou** um serviço. Serve para: abrir/consultar chamados de suporte, ver saldo de tokens, e consultar o contrato financeiro (serviços contratados, início do contrato, próxima renovação, histórico de tokens).
- **Não existe** mais, no portal, o fluxo de "configurar seu app", "aguardar prévia" ou acompanhar "projetos". A lista de serviços disponíveis fica em `app/lib/constants/services.ts` (`SERVICES`), gravada em `profiles.services` (text[]).

## Commands

```bash
npm run dev      # dev server com Turbopack (localhost:3000)
npm run build    # build de produção (Turbopack)
npm run lint     # eslint
```

Não há testes configurados (`@playwright/test` está em devDependencies, mas sem config nem specs). Deploy é feito na Vercel, direto do branch **master** — nunca criar PRs, sempre commitar e pushar direto.

## Architecture

Next.js 15 (App Router) + React 19 + Tailwind CSS 4. Supabase para auth e banco de dados.

### Rotas públicas

- `app/page.tsx` — landing page (client component). Contém `plans` e FAQs inline.
- `app/configurador/page.tsx` — configurador de planos; envolve `PlanConfigurator` e envia pedido a `/api/quote`.
- `app/api/quote/route.ts` — envia orçamento por email via Resend. Requer `RESEND_API_KEY` e `CONTACT_EMAIL`.
- `app/area-cliente/page.tsx` — login/reset de senha (modes: `"login" | "reset"`). Sem cadastro público — clientes são convidados via admin.
- `app/auth/callback/route.ts` — handler de auth: suporta `token_hash` (recovery, invite) e PKCE `code`. Redireciona para `next` param ou `/area-cliente/dashboard`.

### Portal do cliente (`/area-cliente/*` → route group `(cliente)`)

- `dashboard` — visão geral: serviços contratados, tokens, chamados abertos
- `suporte` — abrir e acompanhar chamados (consomem 1 token na abertura). Chamados são **UFT** (User Fropty Ticket), exibidos como `UFT0000`.
  - Conversa com histórico identificando **Cliente** vs **Equipe Fropty** (`TicketConversation.tsx`, realtime).
  - Fluxo de resolução: analista marca **Resolvido** (= "Aguardando validação") → cliente avalia em `/portal/suporte/[ticketId]/avaliar`: aprova → **Fechado** (notificado); reprova → **Reaberto** (volta para a fila, status intermediário — não vai direto para "em andamento"). Depois o analista move `reaberto → em_andamento`. Status em `app/lib/constants/status.ts` (migration 0018 adiciona `reaberto`).
- `financeiro` — saldo de tokens, plano, contrato (serviços + início + renovação) e extrato
- `nova-senha` — definir senha após invite/reset
- Sidebar: `ClientSidebar.tsx` (marca "Fropty", logo `/logo-icon.png`) com toggle de tema (dark/light). **Sem** item "Projetos".

### Painel admin (`/admin/*` → route group `(admin)`)

- `overview` — métricas gerais
- `usuarios` — lista de usuários + formulário de convite (`InviteForm.tsx`)
- `financeiro`, `analytics`, `audit`
- Sidebar: `AdminSidebar.tsx`. **Sem** item "Projetos" (contexto de projetos removido).

### Componentes públicos (`app/components/`)

- `PlanConfigurator.tsx` — define `BASE_PRICE` (R$499), `ADDONS` e `MAINTENANCE`. 1 token = R$150 avulso.
- `QuoteForm.tsx` — formulário de orçamento da landing.
- `AppDemos.tsx` — mockups de apps em `PhoneFrame`.

## Auth & Roles

- Roles: `"cliente"` | `"admin"` (sem `dev`).
- Clientes **nunca se cadastram sozinhos** — admin convida via `/admin/usuarios` usando `adminInviteClient`.
- Convite usa `supabase.auth.admin.inviteUserByEmail()` com `data: { name, role, token_balance, plan, services, contract_start }`.
- **Importante:** o trigger detecta convite pela presença de chaves em `raw_user_meta_data` (`role`/`token_balance`/`plan`), **não** por `invited_at` — no INSERT do GoTrue o `invited_at` ainda é NULL (ver migration 0017).
- O trigger `fn_on_auth_user_created` cria o perfil com esses dados ao aceitar o convite.
- Auth flow de email (invite/reset): `token_hash` + `verifyOtp` — **não** PKCE, para evitar problemas de cookie em SSR.
- `createClient()` — cliente SSR com anon key (cookies do usuário).
- `createServiceClient()` — service role, bypassa RLS. Usar apenas em server actions admin.

## Database (Supabase)

Projeto ID: `rflnhzpepbnhanuxpqag`

Tabelas principais:
- `profiles` — `id, name, email, role, plan, token_balance, services (text[]), contract_start (date), is_active, avatar_url, theme, ...`
- `tickets` / `ticket_messages` — chamados de suporte (UFT) e conversa
- `token_transactions` — `id, client_id, amount, type (credit|debit), description, ...`
- `audit_log` — registro de ações admin

`is_active = false` + `ban_duration: "87600h"` = acesso revogado. Restaurar: `ban_duration: "none"` + `is_active = true`.

## Server Actions (`app/actions/admin.ts`)

- `adminInviteClient` — convida novo cliente com tokens/plano iniciais
- `adminSetTokenBalance` — define saldo de tokens direto
- `adminCreditTokens` — credita tokens via transação (registra em `token_transactions`)
- `adminUpdateUserPlan` — atualiza plano do usuário
- `adminUpdateUserRole` — muda role (cliente ↔ admin)
- `adminRevokeAccess` / `adminRestoreAccess` — bane/desbane usuário

## Conventions

- **Preços em três lugares** — `plans` em `app/page.tsx`, `ADDONS`/`MAINTENANCE` em `PlanConfigurator.tsx`, e textos de economia de tokens. Manter consistentes.
- Estilo visual: tema escuro `#080e1c`, azul da marca `#185FA5`, laranja de destaque `#EF9F27`. CSS variables: `--bg`, `--surface`, `--surface-2`, `--card-bg`, `--card-border`, `--border`, `--text`, `--text-muted`, `--text-faint`. Mistura de Tailwind classes com `style={{}}` inline — siga o padrão do arquivo editado.
- Ícones via Tabler Icons webfont (CDN no `layout.tsx`), usados como `<i className="ti ti-..." />`.
- Tipos do banco em `app/lib/supabase/types.ts` — atualizar manualmente quando adicionar colunas via migration.
- Mensagens de commit em português, descrevendo a mudança do ponto de vista do produto.
- **Nunca criar PRs** — commitar e pushar direto no master.
