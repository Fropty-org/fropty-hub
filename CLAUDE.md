# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

fropty.com — landing page, configurador, **Fropty Hub** (portal de cliente + painel admin) da **Fropty (Intelligent Software Ecosystem)**. Todo o conteúdo é em português brasileiro (pt-BR).

### Modelo de produto

- A **Fropty** vende módulos/serviços do ecossistema: FroptyCash, FroptyInvest, FroptyBoost, FroptySentinel (security), FroptyAI, FroptyAds, FroptyCRM, FroptyApps.
- **FroptyApps** é uma perna à parte: um **catálogo** de micro-SaaS, apps mobile e dashboards. É onde a pessoa olha o que existe e escolhe o que se aplica; a Fropty então copia e customiza (logo, cores, identidade do cliente). **Não** é uma ferramenta para o cliente montar o próprio app.
- A **área de cliente** (`/area-cliente` → `/portal/*`) é para quem **já contratou**. A lista de serviços disponíveis fica em `app/lib/constants/services.ts` (`SERVICES`), gravada em `profiles.services` (text[]).

> **Estado real do Hub (2026-07):** o portal evoluiu para muito além de suporte+tokens+contrato.
> A migration `0019_drop_projects.sql` removeu projetos, mas a `0029_projects.sql` **os recriou**.
> Hoje o Hub tem 13 itens de menu no cliente e 16 no admin (ver seções abaixo). Auditoria
> estratégica completa em `AUDITORIA-FROPTY-HUB.md`.

## Commands

```bash
npm run dev      # dev server com Turbopack (localhost:3000)
npm run build    # build de produção (Turbopack)
npm run lint     # eslint
npm run test:e2e # playwright (config existe; ver nota sobre specs)
```

Playwright está configurado (`playwright.config.ts`, dir `e2e/`), mas a cobertura de specs é
mínima/inexistente. Deploy é feito na Vercel, direto do branch **master** — nunca criar PRs,
sempre commitar e pushar direto.

## Architecture

Next.js 15 (App Router, Turbopack) + React 19 + Tailwind CSS 4. Supabase (auth + Postgres +
Realtime + Storage). Stripe (checkout + webhook). Resend (email). Cron (Vercel).

### Roteamento por host (`middleware.ts`)
- Middleware **stateless**: só checa presença do cookie `sb-*-auth-token`; a validação real do
  JWT acontece nos layouts server-side (Node runtime).
- `hub.fropty.com` (via `NEXT_PUBLIC_HUB_HOST`/`NEXT_PUBLIC_HUB_URL`) → raiz vira login/portal;
  a área autenticada (`/area-cliente`, `/portal`, `/admin`) é redirecionada 308 para o host do hub.
- `demo.fropty.com` → rewrite de `/` para `/demo`.

### Rotas públicas
- `app/page.tsx` — landing (client component); componentes em `app/components/landing/*`.
- `app/configurador/page.tsx` — configurador de planos → `/api/quote` (Resend).
- `app/area-cliente/page.tsx` — login/reset (sem cadastro público; clientes são convidados).
- `app/auth/callback/route.ts` — auth handler (`token_hash` para recovery/invite + PKCE `code`).
- `app/blog/*`, `app/portfolio/*`, `app/demo/*`, `app/sobre`, `app/contato`, etc.

### Portal do cliente (`/area-cliente/*` → route group `(cliente)` → `/portal/*`)
Navegação (fonte única: `app/lib/constants/portal-nav.ts`, lida por `ClientSidebar` e o layout):
`dashboard, chat, suporte, projetos, kanban, calendario, contratos, financeiro, planos, roadmap,
feedback, base-conhecimento, perfil` (+ `onboarding`).
- **dashboard** — visão geral: KPIs (projetos, tokens, chamados, serviços), health score, onboarding, ações rápidas.
- **suporte** — chamados **UFT** (`UFT0000`), consomem 1 token na abertura. Conversa realtime
  (`TicketConversation.tsx`) identificando **Cliente** vs **Equipe Fropty**. Fluxo de resolução:
  analista marca **Resolvido** (= "Aguardando validação") → cliente avalia em
  `/portal/suporte/[ticketId]/avaliar` → aprova (**Fechado**) ou reprova (**Reaberto** →
  volta para a fila; analista move `reaberto → em_andamento`). Status em
  `app/lib/constants/status.ts` (migration 0018 adiciona `reaberto`). SLA em `sla.ts` + timestamps (0026).
- **chat** — canal de conversa lendo `tickets`/`ticket_messages` reais. **Sobrepõe-se ao Suporte**
  (débito técnico conhecido — ver auditoria; decidir fundir ou diferenciar).
- **projetos** — lista + updates + timeline (`projects`, `project_updates`).
- **kanban** / **calendario** — **visualizações read-only** dos mesmos `projects` (sem drag-and-drop
  persistente / sem export iCal ainda).
- **contratos** — serviços + início + renovação + `file_url` (`contracts`).
- **financeiro** — saldo de tokens, plano, extrato (`token_transactions`), Stripe.
- **planos** — upgrade via Stripe (`UpgradeButton.tsx`).
- **roadmap** — itens públicos com **votação** (`roadmap_items`, `roadmap_votes`).
- **feedback** — envio + resposta admin (`feedbacks`).
- **base-conhecimento** — artigos com slug, views, rating (`knowledge_articles`).
- Sidebar: `ClientSidebar.tsx` (toggle de tema, busca ⌘K, badge de plano/tokens).

### Painel admin (`/admin/*` → route group `(admin)`)
Navegação (`AdminSidebar.tsx`, agrupada em Principal / Operações / Produto / Sistema):
`overview, usuarios (+novo), customer-success, projetos, contratos, financeiro, suporte, chat,
kanban, calendario, planos, roadmap, feedback, base-conhecimento, analytics, audit, perfil`.
- **overview** — métricas gerais.
- **usuarios** — lista + convite (`InviteForm.tsx`) + bulk (`BulkUsuariosClient.tsx`) + roles.
- **customer-success** — health scores (`health_scores`, `HealthScoreBadge`, risk levels), notas de CS.
- **projetos, contratos, financeiro, roadmap, feedback, base-conhecimento** — CRUD/gestão admin.
- **analytics** — métricas (incipiente: MRR, tempo de resolução, SLA).
- **audit** — `admin_audit_log` (`AuditClient.tsx`).
- **Nota:** vários itens do admin (`suporte`, `chat`, `kanban`, `calendario`, `planos`) hoje
  apontam para as rotas `/portal/*` do cliente — não têm telas admin próprias (débito conhecido).

### Componentes
- **UI primitivos** (`app/components/ui/`): `Button, Input/Textarea, Badge, Card, Skeleton, Toast,
  HubEmptyState` (via `index.ts`). Subutilizados — muitas telas usam `style={{}}` inline. Ao criar
  telas novas, **prefira os primitivos e as classes `hub-*` do design system** a inline styles.
- **Design system** em `app/globals.css` (~2.100 linhas): tokens canônicos + ~80 classes `hub-*`
  (cards, KPI, tabelas, badges, timeline, stepper, breadcrumb, pagination, dropdown, empty, filtros).
- **Landing** (`app/components/landing/*`), **suporte** (`app/components/suporte/*`),
  **projetos** (`app/components/projetos/*`), **demos** (`app/components/demos/*` e `app/demo/*`).
- `CommandPalette.tsx` (⌘K, busca global via `app/actions/search.ts`), `NotificationBell.tsx`
  (**realtime real**: subscription na tabela `notifications`, marcar como lida).

## Auth & Roles

- Roles: `"cliente"` | `"admin"` (sem `dev`).
- Clientes **nunca se cadastram sozinhos** — admin convida via `/admin/usuarios` (`adminInviteClient`).
- Convite usa `supabase.auth.admin.inviteUserByEmail()` com `data: { name, role, token_balance, plan, services, contract_start }`.
- **Importante:** o trigger detecta convite pela presença de chaves em `raw_user_meta_data`
  (`role`/`token_balance`/`plan`), **não** por `invited_at` (NULL no INSERT do GoTrue; ver 0017).
- Auth flow de email (invite/reset): `token_hash` + `verifyOtp` — **não** PKCE, para evitar
  problemas de cookie em SSR.
- MFA disponível (`app/auth/mfa/page.tsx`); pwned password check (`app/lib/auth/pwned.ts`).
- `createClient()` — SSR anon key, tipado com `<Database>` (cookies do usuário).
- `createServiceClient()` — service role, bypassa RLS. Usar apenas em server actions admin.

## Database (Supabase)

Projeto ID: `rflnhzpepbnhanuxpqag`

Tabelas principais:
- `profiles` — `id, name, email, role, plan, token_balance, services (text[]), contract_start (date),
  plan_renewal, onboarding_completed, is_active, avatar_url, theme, ...`
- `tickets` / `ticket_messages` — chamados (UFT) + conversa (SLA: `first_response_at`, `resolved_at`)
- `projects` / `project_updates` — projetos e atualizações
- `contracts` — contratos (serviços, datas, `file_url`)
- `roadmap_items` / `roadmap_votes` — roadmap público votável
- `feedbacks` — feedback do cliente + resposta admin
- `knowledge_articles` — base de conhecimento (slug, views, rating)
- `health_scores` — customer success (scores ponderados + risk_level; `calculate_health_score`, `get_risk_level`)
- `token_transactions` — razão de tokens (`amount`, `type` credit|debit, ...). 1 token = R$150 avulso.
- `notifications` — notificações in-app (realtime; policies em 0025; INSERT via triggers, ex. 0014)
- `admin_audit_log` — ações admin · `processed_webhook_events` — idempotência Stripe · `low_token_alerts` · `leads`

Migrations em `supabase/migrations/` (0001→0035). `is_active = false` + `ban_duration: "87600h"` =
acesso revogado; restaurar com `ban_duration: "none"` + `is_active = true`.

**Tipos do banco** em `app/lib/supabase/types.ts` — **atualizar manualmente** ao adicionar colunas
via migration. Já cobrem `health_scores`, `notifications`, `tickets` SLA cols, etc. — **não** use
`(supabase as any)` para tabelas/colunas que já existem no tipo.

## Server Actions (`app/actions/*.ts`)

`admin.ts` (invite, tokens, plano, role, revoke/restore), `suporte.ts`, `projects.ts`, `contracts.ts`,
`roadmap.ts`, `feedback.ts`, `knowledge.ts`, `customer-success.ts`, `financeiro.ts`, `onboarding.ts`,
`profile.ts`, `search.ts`, `audit.ts`, `auth.ts`, `submitQuote.ts`.

## APIs & Cron
- `app/api/quote/route.ts` — orçamento por email (Resend; `RESEND_API_KEY`, `CONTACT_EMAIL`).
- `app/api/login/route.ts` — login (evita perda de Set-Cookie em SSR).
- `app/api/stripe/webhook/route.ts` — webhook Stripe com idempotência (`processed_webhook_events`).
- `app/api/cron/low-tokens/route.ts` — alerta de saldo baixo (Resend).

## Conventions

- **Preços em três lugares** — `plans`/`PlanConfigurator.tsx`/textos de tokens. Manter consistentes.
- **Estilo visual**: tema escuro/claro via classe `.dark`. Tokens em `globals.css`
  (`--bg`, `--surface*`, `--text*`, `--border*`, `--primary`, `--c-success/warning/danger/info`,
  brand scale `--brand-*`, radius `--r-*`, shadows). **Prefira tokens e classes `hub-*`; evite
  cores hex inline** (fura dark mode/theming). Ao editar um arquivo, siga o padrão dele.
- **Ícones**: no **Hub** use **Lucide React** (`lucide-react`). O webfont **Tabler** (`ti ti-`,
  `public/tabler-icons.min.css`) é usado **apenas** em `app/demo/*` (marketing) — não introduzir no Hub.
- **Encoding**: arquivos em UTF-8. Evitar mojibake (ex. `Ã£`/`âŒ˜`) ao editar strings pt-BR.
- Mensagens de commit em português, descrevendo a mudança do ponto de vista do produto.
- **Nunca criar PRs** — commitar e pushar direto no master.
