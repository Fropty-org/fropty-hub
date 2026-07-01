# Auditoria & Evolução — Fropty Hub (Documento-Mestre)

> **Versão unificada.** Merge de duas auditorias independentes, reconciliadas contra o
> **código real** (rotas, `globals.css` ~2.100 linhas, `middleware.ts`, `next.config.ts`,
> ambas sidebars, `portal-nav.ts`, migrations 0001→0035, páginas reais de dashboard/kanban/chat,
> `package.json`, constantes). Onde os dois documentos divergiam, a verificação no código decidiu.
> **Nada implementado** — este é o entregável para aprovação (Fase 11).
> Time simulado: Head of Product · Principal Designer · UX Research · UX Writer · Staff FE ·
> Sr. Full Stack · Enterprise SaaS · Customer Success · SaaS B2B · CRO · Design Systems.

---

## 0. Correções factuais aplicadas no merge

Antes de tudo, três afirmações de uma das auditorias foram **corrigidas** por não baterem com o código:

1. **Chat / Kanban / Calendário NÃO são mockups.** `kanban/page.tsx` lê `getClientProjects()` e
   renderiza `ProjectsKanban`; `chat/page.tsx` lê `tickets` + `ticket_messages` reais; Calendário
   segue o mesmo padrão. São **read-only com dados reais**. Os problemas reais são outros:
   Kanban **sem drag-and-drop persistente** (não há `@dnd-kit`/`react-beautiful-dnd` no
   `package.json`) e **Chat duplica o Suporte** sem hierarquia clara.
2. **Não há "dois sistemas de ícone" no Hub.** `ti ti-` (Tabler) só aparece em `app/demo/*`
   (69 ocorrências, todas no `/demo` de marketing). O Hub usa **exclusivamente Lucide**. E,
   confirmado na implementação: `public/tabler-icons.min.css` **não é carregado em lugar nenhum**
   do código (sem `<link>`/import/@import; só há uma regra de cache órfã no `next.config.ts`).
   Não há penalidade global de perf por Tabler — o "QW12" original é um não-problema.
   *(Efeito colateral a investigar fora do Sprint 1: os ícones `ti ti-` do `/demo` podem estar
   sem estilo, já que o CSS não é injetado.)*
3. **Fontes já estão otimizadas.** `DM_Sans` vem de `next/font/google` (self-hosted pelo Next) —
   não há "Google Fonts CDN bloqueante".

Correção adicional descoberta na implementação: **a tabela `notifications` EXISTE e é real** —
tem RLS (migration 0025), recebe INSERTs via trigger (0014) e o `NotificationBell.tsx` já tem
**subscription realtime completa** (channel, evento INSERT, marcar como lida). A afirmação
"notificações sem sistema real" estava **errada**; o gap verdadeiro é só *ampliar os triggers*
que geram notificações, não construir o sistema. Pontos que se confirmaram: só existem
**3 `loading.tsx`** no app todo, e há **zero specs de teste** (Playwright configurado, sem specs).

**Correção transversal nº 0 (P0):** o `CLAUDE.md` está **desatualizado e contradiz o código** —
diz que "projetos foram removidos" e que a área do cliente é só suporte/tokens/contrato. A migration
`0019` removeu projetos e a `0029` os **recriou**. Reescrever o `CLAUDE.md` desbloqueia todo o resto.

---

## FASE 1 — Mapeamento do sistema

### Arquitetura
- **Next.js 15 (App Router, Turbopack) + React 19 + Tailwind v4.** Deploy Vercel no `master` (sem PRs).
- **Supabase** (Postgres + Auth + Realtime + Storage) · **Stripe** (checkout + webhook idempotente)
  · **Resend** (email) · **cron** (`/api/cron/low-tokens`).
- **3 route groups**: público (landing, blog, portfolio, demo, configurador), `(admin)`, `(cliente)`.
- **Roteamento por host** (`middleware.ts`): `hub.fropty.com` → login/portal; `demo.fropty.com` → `/demo`.
  Middleware **stateless** (só checa presença do cookie `sb-*-auth-token`); JWT validado nos layouts
  server-side. Decisão sólida.
- **Segurança de borda**: CSP, HSTS, X-Frame-Options, Permissions-Policy no `next.config.ts`.

### Módulos existentes (estado real)
| Módulo | Rotas cliente | Rotas admin | Estado real |
|---|---|---|---|
| Auth/MFA | `/area-cliente`, `/auth/*` | — | Completo (PKCE + token_hash, pwned check, MFA) |
| Dashboard | `/portal/dashboard` | `/admin/overview` | Funcional, denso — mas 100% inline style |
| Suporte (UFT) | `/portal/suporte/*` | (usa `/portal`) | **Mais maduro**: SLA, realtime, avaliação, reaberto |
| Projetos | `/portal/projetos/*` | `/admin/projetos/*` | Funcional (lista + updates + timeline) |
| Kanban | `/portal/kanban` | (usa `/portal`) | **Real read-only**, sem DnD persistente |
| Calendário | `/portal/calendario` | (usa `/portal`) | **Real read-only**, sem export iCal |
| Chat | `/portal/chat` | (usa `/portal`) | Lê tickets reais; **duplica Suporte** |
| Contratos | `/portal/contratos/*` | `/admin/contratos/*` | Funcional |
| Financeiro | `/portal/financeiro` | `/admin/financeiro` | Funcional (ledger tokens + Stripe) |
| Planos | `/portal/planos` | (usa `/portal`) | Básico (UpgradeButton → Stripe) |
| Roadmap | `/portal/roadmap` | `/admin/roadmap/*` | Funcional, **votação pública** (diferencial) |
| Feedback | `/portal/feedback/*` | `/admin/feedback/*` | Funcional |
| Base de Conhecimento | `/portal/base-conhecimento/*` | `/admin/base-conhecimento/*` | Funcional (rating, views, slug) |
| Onboarding | `/portal/onboarding` | — | Funcional, mas passivo |
| Customer Success | — | `/admin/customer-success/*` | Funcional (health score) |
| Analytics | — | `/admin/analytics` | Incipiente |
| Auditoria | — | `/admin/audit` | Funcional (audit_log) |
| Usuários | — | `/admin/usuarios/*` | Funcional (invite, bulk, roles) |
| Perfil | `/portal/perfil` | `/admin/perfil` | Básico |

**Nav real:** 13 itens no cliente, 16 no admin.

### Entidades e fluxos
`profiles` é o hub central (role, plan, token_balance, services[], contract_start,
onboarding_completed, health). `tickets`→`ticket_messages` (realtime). `projects`→`project_updates`.
`roadmap_items`→`roadmap_votes`. `contracts`, `feedbacks`, `knowledge_articles`, `health_scores`,
`token_transactions` (ledger, 1 token = R$150), `audit_log`.

- **Auth:** login → `/api/login` → Supabase Auth → `auth_role()` → redirect por role.
- **Dados:** RSC → Server Actions (`createClient` anon / `createServiceClient` admin) → Supabase (RLS) → render.
- **Suporte:** `NewTicketForm` → debita 1 token → conversa realtime → `resolvido` → cliente avalia →
  `fechado`/`reaberto` (mig. 0018) → NPS.
- **Financeiro:** Stripe checkout → webhook idempotente (`processed_webhook_events`) → credita tokens
  → ledger → `sendLowTokenAlert` (cron).
- **Permissões (3 camadas):** RLS no banco (`auth_role()`) + guards em server actions (`session.ts`) +
  `require-role` nos layouts.

### Design System (real)
- **Forte:** `globals.css` = DS maduro com tokens canônicos (brand scale, radius, shadow, status,
  aliases `--s/--t/--bd`) e **~80 classes `hub-*`** (cards, KPI, tabelas, badges, timeline, stepper,
  breadcrumb, pagination, dropdown, empty, skeleton, filtros).
- **Fraco:** só **7 primitivos React** (`Button, Input/Textarea, Badge, Card, Skeleton, Toast,
  HubEmptyState`) — descompasso enorme; as telas reimplementam tudo em `style={{}}` inline.

---

## FASE 2 — Auditoria de Produto

**Proposta de valor:** portal de cliente B2B white-label que centraliza suporte, projetos, contratos,
financeiro e comunicação. A proposta é **correta**; a execução ainda não a entrega por completo.

**Organização:** ambiciosa demais para o estágio — 13 itens flat no cliente, sem seções. Módulos
diferentes (comunicação/trabalho/contrato/informação) sem separação visual.

**Escalabilidade:** modelo de banco bom (35 migrations, RLS em tabelas críticas, índices de FK,
otimização de RLS na 0025). O gargalo está na **camada de produto**, não no banco.

**Percepção premium:** fraca por inconsistência de execução — tokens definidos mas usados
parcialmente, primitivos existentes ignorados, estados vazios genéricos, skeletons ausentes.

**Onboarding:** existe (`OnboardingChecklist`, `getOnboardingSteps`) mas é **passivo** — o banner
aparece, não guia. Sem ativação progressiva nem tooltips contextuais.

**Curva de aprendizado:** alta — 13 itens sem contexto, números sem benchmark, modelo de "tokens"
que exige entender o negócio da Fropty.

### Se apresentado a um investidor hoje
**Elogiaria:** arquitetura técnica sólida (Next 15, RLS, server actions, Stripe idempotente);
escopo correto (suporte+projetos+contratos+financeiro); Customer Success com health score;
roadmap público votável; 35 migrations = iteração disciplinada; MFA + pwned check + audit log =
segurança levada a sério; amplitude de "mini-ClickUp vertical".

**Criticaria (brutalmente honesto):**
1. **Falta de foco.** Qual é o job-to-be-done nº1? Service-desk (Zendesk), PM (Asana) ou billing
   (Stripe)? Não está claro. 14 features de profundidade média vs. o "faça 5 coisas perfeitas" do Linear.
2. **Design system existe mas quase não é usado** — telas em `style={{}}` inline, `StatusBadge`
   reinventado, cores hex fora de token, hover via JS. É o que faz "parecer MVP".
3. **Admin parasita as rotas do cliente** — no `AdminSidebar`, Suporte/Chat/Kanban/Calendário/Planos
   apontam para `/portal/*`. Sem telas admin próprias (sem filtro por cliente, sem bulk contextual).
4. **Dívida técnica visível:** `(supabase as any).from("health_scores")` (tipos não regenerados),
   CSS duplicado, 3 fontes de verdade de status, possível **mojibake** de encoding, zero testes.
5. **Notificações sem lastro** (sem tabela `notifications`), **analytics incipiente**, **sem métricas
   de uso** (impossível saber o que o cliente faz).

**Veredito:** *escopo de Series-A, acabamento de MVP.* O gap não é ter features — é **coerência,
hierarquia e polish sistêmico**. A percepção premium está a um "polish" de distância.

---

## FASE 3 — Auditoria UX

| # | Problema | Impacto | Como resolver | Prioridade | Complexidade |
|---|----------|---------|---------------|------------|--------------|
| 1 | Sidebar sem hierarquia (13 itens flat no cliente) | Alto | Agrupar em seções (Meu Trabalho / Comunique-se / Minha Conta); o admin já agrupa, replicar | Alta | Baixa |
| 2 | Kanban/Chat/Calendário como se fossem "completos" | Alto | Sinalizar limites (Kanban "somente leitura"), dar hierarquia Chat×Suporte, ou evoluir cada um | Alta | Média |
| 3 | AI admin/cliente fundida (admin usa `/portal`) | Alto | Telas admin próprias p/ suporte/kanban/calendário | Alta | Alta |
| 4 | Dashboard não orienta ação | Alto | Activity feed + quick actions contextuais + "o que fazer agora" | Alta | Média |
| 5 | Carga cognitiva do modelo de tokens | Alto | Tooltip permanente no saldo + explicação inline no financeiro + banner no 1º suporte | Alta | Baixa |
| 6 | Múltiplas fontes de verdade de status | Médio | Unificar em `status.ts` + `<StatusBadge>` (hoje há mapa inline no dashboard e no chat) | Alta | Média |
| 7 | Sem feedback de erro padronizado p/ server actions | Médio | `useActionFeedback` + Toast global + ErrorBoundary | Alta | Média |
| 8 | Estados vazios genéricos | Médio | Empty states por contexto (com CTA) via `HubEmptyState` | Média | Baixa |
| 9 | Skeletons ausentes (só 3 `loading.tsx`) | Médio | `loading.tsx` em todas as rotas do portal | Média | Baixa |
| 10 | Fluxo de avaliação de ticket sem comunicação | Alto | Email automático ao virar `resolvido` + badge "aguardando sua avaliação" | Alta | Média |
| 11 | Poucos eventos geram notificação (infra já existe) | Alto | Ampliar triggers no banco (ticket respondido, projeto atualizado, contrato renovando…) — tabela `notifications` + realtime no bell já funcionam | Alta | Média |
| 12 | Command Palette de cobertura incerta | Médio | Indexar tickets/projetos/KB/contratos + hint ⌘K visível | Média | Média |
| 13 | Acessibilidade não verificada | Médio | axe-core; `aria-label` em ícones; contraste WCAG AA; hover/foco em CSS (não JS) | Média | Alta |
| 14 | Mobile não testado sistematicamente | Médio | Bottom nav / drawer; testar breakpoints por módulo (há `PullToRefresh`) | Alta | Alta |
| 15 | Possível mojibake de encoding | Alto (se confirmado) | Verificar UTF-8 (`VisÃ£o Geral`, `âŒ˜K`, `BÃ¡sico`) e corrigir | Alta | Baixa |

---

## FASE 4 — UI Design

- **Tipografia:** DM Sans (correto), mas **sem escala tokenizada** — mistura de classes Tailwind e
  `style={{ fontSize }}` inline; `h1` varia entre módulos.
- **Grid/Spacing:** inconsistente — `gap-4/6`, `space-y-3`, paddings de card variados; sem spacing tokens.
- **Cores:** tokens bons, mas `#185FA5`/`#EF9F27`/`#ef4444` hard-coded inline em várias telas → fura
  theming e dark mode.
- **Cards/Inputs/Botões:** primitivos (`Card`, `Input`, `Button` CVA) **subutilizados**; `UpgradeButton`
  recria botão do zero; formulários misturam `Input.tsx` e `<input className>`.
- **Sidebar:** funcional, sem seções; estado ativo por comparação de pathname (risco de falso-positivo
  em rotas aninhadas); centenas de linhas de inline style.
- **Ícones:** Hub usa Lucide (bom). Tabler confinado ao `/demo` — remover `tabler-icons.min.css` do
  carregamento global se o Hub não usa.
- **Badges/Dark mode/Skeleton/Motion:** badges de status reinventadas inline; valores inline não
  respondem ao dark mode; `Skeleton` pouco usado; **motion ausente no portal** (só na landing).

---

## FASE 5 — Design System (proposta de evolução)

### Duplicações e quebras (verificadas)
- **CSS literalmente duplicado** em `globals.css`: `.sr` e `.dot-bg` definidos 2×; `@keyframes fadeIn`
  e `spin` duplicados; blocos de scroll-reveal repetidos.
- **~80 classes `hub-*` sem contraparte React** (sem tipagem, fácil divergir).
- **Status/priority em 3+ lugares** (`status.ts`, `STATUS_CONFIG` no dashboard, `STATUS_DOT` no chat, `.hub-priority`).
- **Padrões repetidos** ~30–60×: `flex items-center gap-2 text-sm text-muted`, `rounded-xl border bg-surface p-4`, `h-4 w-4 text-muted`.

### Tokens ausentes
`--font-size-*`, `--spacing-*`, `--font-weight-*`, `--transition-*` (motion), `--z-index-*`.

### Componentes que deveriam existir (elevar o CSS a React tipado)
`PageHeader`, `SectionHeader`, `KpiCard/StatCard`, `DataTable` (toolbar+paginação+sort),
`StatusBadge`, `PriorityChip`, `Spinner`, `EmptyState` (evolução do `HubEmptyState`), `ConfirmDialog`,
`Tooltip`, `Avatar/AvatarGroup`, `Drawer`, `Tabs`, `Timeline`, `Breadcrumb`, `Stepper`, `Dropdown/Menu`,
`FilterChips`, `Callout`, `Modal`.
**Metas:** zero `style={{}}` inline em telas de produto; lint proibindo hex fora de tokens; DS único como fonte de verdade.

---

## FASE 6 — Performance

**Positivo:** RSC por padrão; Server Actions (menos API routes); `next/font` (sem FOUC); `Promise.all`
no dashboard com `count: exact, head: true`; RLS otimizada (0025); índices de FK (0024); webhook idempotente;
cache de fontes/imagens no `next.config`.

**A melhorar:**
- **Type drift:** `(supabase as any).from("health_scores")` → regenerar tipos e remover `any`/eslint-disable.
- **Sem cache client-side** (React Query/SWR ausente) — cada navegação refaz fetch de dados voláteis
  (saldo de tokens, status). Considerar `unstable_cache`/tags no server e SWR onde fizer sentido.
- **Sem paginação visível** em suporte/projetos/contratos — problema com clientes de 100+ itens.
- **N+1 potencial** nas listas admin (não auditadas linha a linha) — checar joins vs. `select('*')`.
- **`calculate_health_score()`** recalculado a cada render de CS — cachear/materializar para 100+ clientes.
- **Cron sem retry**: `/api/cron/low-tokens` pode marcar alerta como enviado mesmo se o Resend falhar.
- **`tabler-icons.min.css`** carregado globalmente embora o Hub não use — isolar para `/demo`.
- **Inline styles** recriam objetos de estilo a cada render (sidebars, dashboard) — migrar p/ CSS.
- **Bundle:** validar tree-shaking do Lucide, `next-mdx-remote` (KB) em dynamic import, Stripe SDK
  não vazando para o client; conferir se `AppDemos` está em `dynamic()`.

---

## FASE 7 — Auditoria por módulo
Legenda: ✅ excelente · 🟡 bom · 🔻 fraco · ➕ faltando · 🏢 enterprise.

- **Dashboard** — ✅ centraliza KPIs, health, onboarding, ações rápidas. 🔻 100% inline style;
  `StatusBadge` reinventado; números sem benchmark. ➕ activity feed, gráfico de tokens no tempo,
  health visível ao cliente, próximos eventos de contrato. 🏢 widgets reordenáveis + insights de IA.
- **Usuários (admin)** — ✅ invite seguro, bulk, roles, MFA detection. 🔻 busca/filtro/paginação não claros.
  ➕ filtro por plano/status/tokens, last login, histórico por usuário, impersonação. 🏢 "clientes em risco"
  destacados; export CSV já existe (`CSVExportButton`).
- **Projetos** — ✅ tabela + updates + timeline + status/priority. 🔻 sem upload/comentários. ➕ progresso,
  estimado×realizado, notificação de mudança. 🏢 Gantt, dependências, milestones, entregáveis.
- **Contratos** — ✅ tabela + status + `file_url`. 🔻 sem assinatura/versionamento. ➕ download,
  lembrete de renovação, PDF inline. 🏢 e-sign (DocuSign), histórico de versões, renewal workflow.
- **Financeiro** — ✅ ledger de tokens, Stripe idempotente, `TokenChart`. 🔻 tokens confusos; sem NF.
  ➕ download de fatura, projeção de consumo, alertas configuráveis. 🏢 dashboard financeiro + forecast.
- **Service Desk (UFT)** — ✅ fluxo mais maduro (SLA mig. 0026, realtime, avaliação, `UFT0000`, reaberto).
  🔻 sem tela admin dedicada; sem templates/anexos/categorização. ➕ email automático por mudança de status,
  SLA countdown, escalation. 🏢 SLA dashboard, "chamados similares" da KB, CSAT automático.
- **Chat** — 🟡 lê tickets reais. 🔻 **duplica o Suporte** sem hierarquia. ➕ typing/read receipts/anexos,
  persistência própria. 🏢 IA copiloto. *(Decidir: fundir ao Suporte ou diferenciar claramente.)*
- **Kanban** — 🟡 board real read-only. 🔻 sem DnD persistente. ➕ WIP limits, swimlanes, filtros,
  assignee/due/story points. 🏢 automações por coluna (via `@dnd-kit`).
- **Calendário** — 🟡 real read-only. ➕ export iCal, eventos de contrato/milestone/renovação. 🏢 Google Calendar,
  views mês/semana/dia.
- **Roadmap** — ✅ votação (`toggle_roadmap_vote`), seed, visibilidade. ➕ status visual (planned/in-progress/done),
  ETA, "notify me". 🏢 changelog público, subscribe, comentários.
- **Feedback** — ✅ form + resposta admin + impacto/status. 🔻 sem agregação/votação. ➕ "agregar similares",
  converter em item de roadmap em 1 clique. 🏢 NPS periódico, análise de sentimento por IA.
- **Knowledge Base** — ✅ slug, views, rating, categorias, publish. 🔻 sem full-text/hierarquia/relacionados.
  ➕ busca vetorial (pgvector), "não ajudou? abra chamado". 🏢 copiloto de suporte, sugestão automática, KB analytics.
- **Analytics (admin)** — 🔻 incipiente, sem gráficos. ➕ uso por módulo, tempo de resolução, tendências de tokens,
  churn. 🏢 dashboards (Recharts), cohort/retention/MRR.
- **Auditoria (admin)** — ✅ `audit_log` + `AuditClient`. 🔻 sem filtros/export/alertas. ➕ filtro por
  usuário/ação/período (o `CSVExportButton` já existe). 🏢 stream em tempo real, anomaly detection, export SOC2/ISO.
- **Customer Success (admin)** — ✅ `health_scores` ponderado, `get_risk_level`, `HealthScoreBadge`, notas.
  🔻 sem automação/playbooks. ➕ alerta ao entrar em "critical", template de email por risk level.
  🏢 playbooks automatizados, CS workload, churn predictor por IA.

---

## FASE 8 — Funcionalidades "caramba…" (visão de PM)

Priorizadas por impacto × esforço (as marcadas ★ têm dados já existentes → alto ROI):
1. ★ **Copiloto de Suporte com IA** — ao abrir chamado, IA sugere artigos da KB (pgvector + Claude API)
   antes de submeter. Reduz volume de tickets 20–40%.
2. ★ **Health Score visível ao cliente** — versão simplificada ("Sua conta está saudável ✓"). Transparência.
3. ★ **Activity Feed global** no dashboard (tickets+projetos+contrato+tokens), estilo Linear/GitHub.
4. **Notificações in-app + push** — tabela `notifications` + triggers + realtime no bell + Web Push.
5. ★ **Command Palette completo (⌘K)** — busca todas as entidades + ações ("abrir chamado", "ir para X").
6. **Onboarding contextual** — tooltips just-in-time por comportamento (não tour estático).
7. ★ **Token Forecast** — "seus tokens duram X dias" + CTA de recarga (Stripe). Proativo.
8. **Webhook API** para integrações do cliente (ticket aberto, projeto atualizado…). Diferencial BR.
9. **Templates de projeto** (App, Landing, E-commerce) com fases/milestones pré-preenchidos.
10. **Smart Filters / Views salvas** (estilo Linear Custom Views).
11. **Timeline de projeto com dependências** (Gantt simplificado) — elimina emails de "qual o status?".
12. **Relatório mensal automático** por email (cron) — resumo do mês.
13. **Changelog vivo** no portal (item de roadmap "done" → changelog).
14. **SLA countdown visível** por ticket, com barra e badge de vencimento.
15. **Modo readonly para stakeholders** — link JWT limitado a um projeto, sem criar conta.

---

## FASE 9 — Valor percebido

**Faz parecer barato/MVP:** cores hard-coded inline; inline styles onipresentes; hover via JS; limites
de Kanban/Chat/Calendário não sinalizados; dashboard sem contexto/benchmark; **motion ausente no portal**;
empty states genéricos; sidebar flat sem hierarquia; `(as any)`; CSS duplicado; `CLAUDE.md` divergente;
possível mojibake; zero testes; notificações sem lastro; analytics incipiente.

**Faz parecer premium/enterprise:** Health Score; SLA com targets por prioridade; MFA + pwned check;
audit log; Stripe idempotente; roadmap votável; numeração `UFT0000`; Customer Success proativo;
KB com ratings/analytics; ticket evaluation flow.

**Transmite confiança:** RLS por design; auth callback robusto (PKCE + token_hash); idempotência de
webhook; `is_active` como revogação imediata; audit log.

**Conclusão:** não falta substância — falta **acabamento sistêmico e hierarquia**.

---

## FASE 10 — Roadmap

### Quick Wins (< 1 semana cada) — risco baixo, impacto de percepção alto
| # | Objetivo | Impacto | Complexidade | Arquivos |
|---|----------|---------|--------------|----------|
| QW0 | Reescrever `CLAUDE.md` p/ refletir o real | Desbloqueia tudo | Baixa | `CLAUDE.md` |
| QW1 | Verificar/corrigir mojibake de encoding | Percepção | Baixa | sidebars, constants |
| QW2 | Remover CSS duplicado (`.sr`, `.dot-bg`, keyframes) | Limpeza | Baixa | `globals.css` |
| QW3 | Regenerar tipos Supabase, remover `(as any)` | Dívida | Baixa | `types.ts`, `dashboard/page.tsx` |
| QW4 | Unificar status em `<StatusBadge>` único | Consistência | Média | `status.ts`, dashboard, chat, listas |
| QW5 | Agrupar sidebar do cliente em seções | Clareza | Baixa | `portal-nav.ts`, `ClientSidebar.tsx` |
| QW6 | Sinalizar limites de Kanban (read-only) e hierarquia Chat×Suporte | Confiança | Média | nav + páginas |
| QW7 | `loading.tsx` em todas as rotas do portal | Percepção | Baixa | 10+ rotas |
| QW8 | Empty states contextuais (com CTA) | Orientação | Baixa | `HubEmptyState` + chamadas |
| QW9 | Tooltip de explicação de tokens no saldo | Reduz confusão/suporte | Baixa | `financeiro`, `dashboard` |
| QW10 | Email automático ao mudar ticket p/ `resolvido` | Fecha loop de avaliação | Baixa | `suporte.ts`, `send.ts` |
| QW11 | Fixar cores hard-coded em tokens CSS | Consistência/dark mode | Média | múltiplos |
| ~~QW12~~ | ~~Isolar Tabler~~ — **N/A**: Tabler não é carregado globalmente (não-problema confirmado) | — | — | — |

### 30 dias — Infra de experiência + fundação de DS
| # | Item | Impacto | Complexidade | Prioridade |
|---|------|---------|--------------|------------|
| 30D1 | Ampliar triggers de notificação (infra realtime já existe) | Alto | Média | P1 |
| 30D2 | Activity Feed no dashboard | Alto | Média | P1 |
| 30D3 | Componentizar DS: `PageHeader`/`DataTable`/`StatusBadge`/`EmptyState`/`Spinner` + **remover inline styles** das telas de maior tráfego | Alto | Média | P0 |
| 30D4 | Command Palette completo (todas as entidades + ações) | Alto | Média | P1 |
| 30D5 | SLA countdown visível nos tickets | Alto | Baixa | P1 |
| 30D6 | Paginação em suporte/projetos/contratos | Alto | Média | P1 |
| 30D7 | Quick actions contextuais no dashboard | Alto | Média | P1 |
| 30D8 | Feedback de erro padronizado (`useActionFeedback` + Toast global) | Médio | Média | P1 |

*Risco:* realtime exige limitar subscriptions por sessão (conexões Supabase).

### 90 dias — Separar admin de cliente + diferenciais
| # | Item | Impacto | Complexidade | Prioridade |
|---|------|---------|--------------|------------|
| 90D1 | Telas admin próprias (suporte/kanban/calendário) — fim do parasitismo de `/portal` | Alto | Alta | P1 |
| 90D2 | Copiloto de suporte com sugestão de KB (pgvector) | Crítico | Alta | P0 |
| 90D3 | Kanban real com `@dnd-kit` (persistência) | Alto | Alta | P1 |
| 90D4 | Token Forecast com projeção | Alto | Média | P1 |
| 90D5 | Relatório mensal automático (cron) | Alto | Média | P1 |
| 90D6 | Webhook API para integrações | Alto | Alta | P1 |
| 90D7 | Analytics com gráficos reais (Recharts) | Alto | Alta | P1 |
| 90D8 | Motion tokens + a11y (hover/foco em CSS, aria, axe-core) | Médio | Média | P1 |

*Risco:* Copiloto exige API key de LLM + embeddings na KB (custo variável).

### 180 dias — Experiência avançada
Calendário real (iCal) · Chat definido (fundir ou diferenciar) · Templates de projeto ·
Onboarding contextual · Smart filters salvos · NPS automático · Health score ao cliente ·
Changelog público integrado ao roadmap · Gantt de projetos.

### 1 ano — Plataforma
White-label total (branding do cliente) · API pública REST documentada · integrações nativas
(Slack/Zapier/Monday) · mobile (PWA avançado/RN) · churn prediction por IA · multi-tenant ·
DS publicado como pacote npm · compliance export (SOC2/ISO27001) · **cobertura de testes** (Playwright/axe).

---

## FASE 11 — Implementação & próximos passos

**Nada implementado.** Proposta de execução em sprints temáticos, do fundacional ao visível:

- **Sprint 1 — Fundação (Quick Wins):** só correções de impacto imediato e risco baixo (QW0–QW12).
  Nenhuma feature nova; eliminar o que deprecia a percepção de qualidade.
- **Sprint 2 — Infra de experiência + DS:** notificações reais, activity feed, componentização do DS
  (remoção de inline styles), command palette, loading states, feedback de erro.
- **Sprint 3 — Separação admin/cliente + módulos prioritários:** telas admin próprias, Kanban real,
  analytics com gráficos, SLA countdown, token forecast, paginação.
- **Sprint 4 — IA e automação:** copiloto de suporte, relatório mensal, webhook API, health playbooks.

**Recomendação:** começar pelo **Sprint 1 (Quick Wins)** — maior ganho de percepção por menor risco.
Ao aprovar, detalho o plano técnico do Sprint 1 (arquivos, componentes, migrations se houver, riscos)
e executo item a item.
