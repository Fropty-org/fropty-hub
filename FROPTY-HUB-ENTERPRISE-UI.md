# Fropty Hub Enterprise UI System

> Fases 2–5 da auditoria de design baseada no benchmark Preline.
> Fase 1 (DNA visual extraído) está em `DNA-VISUAL-PRELINE.md`.
> **Status: aguardando aprovação — nada foi implementado.**

---

# FASE 2 — Auditoria do design atual

## 2.1 Fundação (globals.css, ~2.100 linhas)

**O que está bom (já premium):**
- Sistema de tokens real e maduro: brand scale `--brand-100..950`, radius `--r-sm/md/lg/xl/full`,
  status colors com par `cor + cor-bg`, shadow scale, temas light/dark completos e espelhados.
- Identidade própria forte: light off-white quente (`#f5f4f0`) e dark warm-black (`#0d0d0d`) —
  mais sofisticado que o cinza puro do benchmark. **Manter.**
- ~80 classes `hub-*` cobrindo card, stat, btn, input, badge, table, empty, filter-chip,
  pagination, tooltip, alert, activity, skeleton. A anatomia do `hub-stat-card`
  (label 11px uppercase → valor 28px/800 tabular-nums → delta) já é exatamente o padrão Preline.
- `prefers-reduced-motion` respeitado; `:focus-visible` global definido; scrollbar temática.

**O que está fraco:**
- **Não existem tokens de motion** (`transition.fast/default/slow`, easing) — durações espalhadas
  hardcoded (0.12s, 0.15s, 0.18s, 0.2s, 0.22s, 0.25s…).
- **Não existem tokens de tipografia nem spacing** — tamanhos de fonte repetidos como literais.
- Não há utilitário de background decorativo além do dots pattern (`--dot-color`).
- Keyframes de demo (`demoStatus1..3`, `sentinelScan`…) misturados no mesmo arquivo do Hub.

## 2.2 O problema central: dois design systems competindo

**~1.150 ocorrências de `style={{}}` inline** dentro do Hub (581 em 26 arquivos do portal
cliente + 577 em 25 do admin, mais os componentes de suporte/projetos: `SuporteClient` 58,
`NewTicketForm` 48, `TicketConversation` 27, `ProjectsCalendar` 33, `ProjectsKanban` 31).
As classes `hub-*` existem, mas a maioria das telas reimplementa card, botão e input na mão.
Consequências: inconsistências de radius/padding/estado entre telas, hover via handlers JS,
e qualquer evolução do design system não se propaga.

## 2.3 Primitivos (`app/components/ui/`)

| Componente | Diagnóstico |
|---|---|
| `Button.tsx` | **Duplica e divergem de `.hub-btn`**: estilos inline, hover via `onMouseEnter` + `filter: brightness(1.1)` (anti-padrão — benchmark troca cor de fundo), sem focus ring por variante, sem estado active, radius próprio (8/10/12px). Variante `primary` usa `--cta-bg` (preto/branco) em vez de `--primary`. |
| `Card.tsx` | Radius **16px hardcoded** (fora da escala — `--r-lg` = 14px), hover com sombra `rgba(0,0,0,0.2)` hardcoded calibrada para dark (vaza no light), handlers JS de hover. |
| `Badge/StatusBadge` | Direção certa (soft badges), mas convive com dezenas de badges inline nas telas. |
| `Input.tsx` | 6 blocos de estilo inline; `.hub-input` já cobre o mesmo caso. |
| `Skeleton/Toast/HubEmptyState/Pagination` | Funcionais; precisam apenas alinhar tokens de motion e radius. |

## 2.4 Por área

| Área | Bom | Fraco / MVP | Falta p/ enterprise |
|---|---|---|---|
| **Dashboard cliente** (`portal/dashboard/page.tsx`, 74 inline styles) | Estrutura de conteúdo certa (KPIs, health, atividade, ações rápidas) | 100% inline styles; `max-width: 1060` estreito para dashboard denso | Grid de KPI denso, tabelas/listas compactas, largura fluida |
| **Admin overview / analytics** (48 + 78 inline styles) | Métricas certas | Charts incipientes, sem padrão visual de chart | Paleta de chart tokenizada, grid tracejado sutil, tooltips temáticos |
| **Suporte / Chat** | Fluxo UFT bem resolvido, realtime | Bolhas e composer com estilos ad-hoc | Anatomia list/detail do helpdesk: lista com unread dot, thread com identificação clara, composer fixo |
| **Tabelas admin** (usuarios, projetos, contratos, financeiro) | `.hub-table` + toolbar + paginação server-side existem | Adoção parcial; densidades divergentes entre telas | Toolbar unificada (busca + filtros + export CSV), th uppercase consistente, hover de linha universal |
| **Kanban / Calendário** | Visualizações funcionam | Cores e paddings próprios de cada tela | Pills de evento com escala de cor semântica, célula com borda 1px, view switcher segmentado |
| **Login** (`area-cliente`) | Theme toggle com View Transition (acima do benchmark) | `ShineBorder` + `RainbowButton` + gradiente rainbow no logo = estética consumer/flashy, não enterprise | Card sobrio com borda sutil, background diagonal discreto, botão primário `--primary` |
| **Sidebars** (Client/Admin) | Collapse persistente, grupos, badge de plano | Tudo inline; gradiente rainbow hardcoded no wordmark; **mojibake em comentários** (`â”€â”€`) | Item ativo estilo benchmark (bg suave + texto forte), transições tokenizadas |
| **Empty states** | `HubEmptyState` existe | Uso irregular entre telas | Adoção universal, compacto |
| **Modais/Dropdowns** | `--shadow-dropdown/modal` definidos | Implementações locais divergentes | Entrada opacity+translate 200ms padronizada |
| **Responsividade** | Sidebar off-canvas, breakpoints no CSS | Tabelas sem tratamento mobile consistente | Scroll horizontal com indicação, KPIs 4→2→1 |

**Impacto visual × complexidade (resumo):** a fundação de tokens é boa (baixo esforço);
o custo está na **migração das ~1.150 declarações inline para as classes `hub-*`** —
mecânico, mas extenso e com risco de regressão visual se feito sem verificação tela a tela.

---

# FASE 3 — Direção visual: "Fropty Hub Enterprise UI System"

**Princípio:** manter a alma Fropty (roxo `#5B57E8`, âmbar `#EF9F27`, neutros quentes, DM Sans)
e adotar a *disciplina* do benchmark: borda antes de sombra, densidade 14px, estados completos,
motion de três durações, accent com parcimônia.

## 3.1 Dark mode (mantém a base atual, com 2 adições)

| Papel | Token | Valor |
|---|---|---|
| Fundo | `--bg` | `#0d0d0d` (mantido) |
| Superfície | `--surface` | `#181818` (mantido) |
| Card | `--card-bg` | `var(--surface)` (mantido) |
| Superfície elevada (dropdown/modal) | `--surface-elevated` **(novo)** | `#1e1e1e` |
| Borda | `--border` | `#262626` (mantido) |
| Borda forte | `--border-strong` **(novo alias)** | `#333333` (= `--border-2`) |
| Texto primário / secundário / muted | `--text` / `--text-muted` / `--text-faint` | `#f0f0f0` / `#999999` / `#585858` (mantidos) |
| Destaque | `--primary` | `#5B57E8`; hover `--brand-400` |
| Hover de superfície | `--surface-hover` **(novo)** | `rgba(255,255,255,0.04)` |
| Focus | `--ring` **(novo)** | `rgba(91,87,232,0.45)` (ring 3px) |
| Seleção | `::selection` | mantido (`rgba(91,87,232,0.20)`) |
| Status | `--c-success/warning/danger/info` | mantidos; uso soft (`*-bg` + cor) |

## 3.2 Light mode

Mesma estrutura; `--surface-elevated: #ffffff`, `--surface-hover: rgba(17,17,17,0.03)`,
`--ring: rgba(91,87,232,0.25)`. Preserva o off-white quente `#f5f4f0` — é o diferencial
Fropty sobre o stone-50 do benchmark.

## 3.3 Background diagonal reutilizável

Nova utility `.hub-bg-diagonal` (CSS puro, um pseudo-elemento, zero JS/imagem):

```css
.hub-bg-diagonal { position: relative; }
.hub-bg-diagonal::before {
  content: "";
  position: absolute; inset: 0;
  background-image: repeating-linear-gradient(
    -45deg,
    var(--diagonal-line) 0 1px,
    transparent 1px 12px
  );
  /* tracejado: máscara quebra as linhas em traços */
  -webkit-mask-image: repeating-linear-gradient(45deg, #000 0 6px, transparent 6px 14px);
          mask-image: repeating-linear-gradient(45deg, #000 0 6px, transparent 6px 14px);
  pointer-events: none;
}
:root  { --diagonal-line: rgba(17,17,17,0.05); }
.dark  { --diagonal-line: rgba(255,255,255,0.045); }
```

**Onde aplicar:** hero do login, faixa do page-header do dashboard, banners (onboarding,
renovação), empty states grandes. **Onde nunca aplicar:** atrás de tabelas, formulários,
threads de conversa.

## 3.4 Componentes a redesenhar (visual, sem mudança funcional)

Sidebar · Header/topbar · Cards · Metric cards · Tabelas (toolbar/th/hover/paginação) ·
Botões (5 variantes: primary, secondary, ghost, soft, danger — mapeadas do benchmark) ·
Inputs/selects/toggles · Badges/tags (consolidar no estilo soft) · Tooltips · Dropdowns ·
Modais · Empty states · Charts (paleta tokenizada) · Pricing cards (planos) · Login ·
Search/⌘K · Filtros (chips) · Skeletons · Toasts.

## 3.5 Motion padronizado

- `--transition-fast: 150ms` — cor, opacidade, hover
- `--transition-default: 200ms` — dropdown, toggle, entrada de card
- `--transition-slow: 300ms` — sidebar collapse, accordion, tema
- `--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)` · `--ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1)`
- Entrada de cards/listas: `fadeUp` 200ms com stagger opcional via `animation-delay`
- Loading: skeleton shimmer (já existe `hubSkeleton`) + spinner em botão
- **Proibido:** hover via `filter: brightness()` e handlers JS de mouse para estilo

---

# FASE 4 — Design tokens (delta sobre o existente)

Mapa pedido → existente/novo. **Nenhum token atual é removido ou renomeado** (zero breaking):

| Pedido | Situação | Token |
|---|---|---|
| colors.background | ✅ existe | `--bg` |
| colors.surface | ✅ existe | `--surface` |
| colors.surfaceElevated | 🆕 | `--surface-elevated` |
| colors.border | ✅ existe | `--border` |
| colors.borderStrong | 🆕 alias | `--border-strong` → `--border-2` |
| colors.textPrimary/Secondary/Muted | ✅ existem | `--text` / `--text-muted` / `--text-faint` |
| colors.brand | ✅ existe | `--primary` (+ scale `--brand-*`) |
| colors.success/warning/danger/info | ✅ existem | `--c-*` + `--c-*-bg` |
| radius.sm/md/lg/xl | ✅ existem | `--r-sm/md/lg/xl` (6/10/14/20px) |
| radius.2xl | 🆕 | `--r-2xl: 24px` |
| shadow.sm/md/lg | ✅ existem | `--shadow-sm/md/lg` |
| shadow.glow | 🆕 alias | `--shadow-glow` → `--shadow-brand` |
| spacing | 🆕 doc | escala base-4 documentada (`--sp-1..12`: 4→48px) |
| typography | 🆕 | `--fs-xs: 11px · --fs-sm: 12.5px · --fs-base: 14px · --fs-md: 15px · --fs-lg: 18px · --fs-xl: 22px · --fs-2xl: 28px` |
| line-height / font-weight | 🆕 | `--lh-tight: 1.2 · --lh-base: 1.55` · `--fw-medium: 500 · --fw-semibold: 600 · --fw-bold: 700 · --fw-heavy: 800` |
| transition.fast/default/slow | 🆕 | `--transition-*` (150/200/300ms) |
| easing.standard/emphasized | 🆕 | `--ease-standard` / `--ease-emphasized` |
| — | 🆕 | `--surface-hover`, `--ring`, `--diagonal-line` |

Regra de ouro: **novas telas nunca usam hex nem valores mágicos** — só tokens + classes `hub-*`.

---

# FASE 5 — Plano de implementação

## Ordem (13 passos, cada um commitável e verificável isoladamente)

| # | Passo | Arquivos principais | Risco |
|---|---|---|---|
| 1 | **Tokens globais** (Fase 4, só adições) | `app/globals.css` | Baixo — nada muda visualmente |
| 2 | **`.hub-bg-diagonal`** + aplicação no login e page-headers | `globals.css`, `area-cliente/page.tsx` | Baixo |
| 3 | **Refactor dos primitivos** para consumir classes `hub-*` (Button→`.hub-btn*`, Card→`.hub-card`, Input→`.hub-input`), remover handlers JS de hover, adicionar focus-visible e active | `app/components/ui/Button.tsx`, `Card.tsx`, `Input.tsx`, `Badge.tsx` | **Médio** — usados em muitas telas; API (props) não muda |
| 4 | **Sidebars + layout base**: item ativo estilo benchmark, transições tokenizadas, remover gradiente rainbow do wordmark, corrigir mojibake | `ClientSidebar.tsx`, `AdminSidebar.tsx`, layouts dos route groups | Médio |
| 5 | **Cards e métricas**: dashboard cliente + admin overview migram de inline para `hub-card`/`hub-stat-card`; largura fluida | `portal/dashboard/page.tsx`, `admin/overview/page.tsx` | Médio |
| 6 | **Tabelas**: adoção universal de `.hub-table` + toolbar + paginação nas telas admin | `admin/usuarios`, `projetos`, `contratos`, `financeiro`, `base-conhecimento` | Médio |
| 7 | **Inputs, selects e botões** nas telas de formulário | `suporte/novo`, `feedback/novo`, `admin/*/novo`, `InviteForm` | Médio |
| 8 | **Badges e status**: consolidar tudo em `Badge`/`StatusBadge` soft | telas com badges inline | Baixo |
| 9 | **Empty states**: `HubEmptyState` universal | todas as listas | Baixo |
| 10 | **Login**: card sobrio, remover Shine/Rainbow, diagonal bg | `area-cliente/page.tsx`, remoção de `ShineBorder`/`RainbowButton` do fluxo (componentes ficam p/ landing) | Baixo |
| 11 | **Dashboards principais**: suporte (list/detail), chat, kanban, calendário, analytics | componentes `suporte/*`, `projetos/*`, `analytics` | **Alto volume** — fatiar por tela |
| 12 | **Responsividade**: KPIs 4→2→1, tabelas com scroll indicado, split mobile do suporte | CSS + telas tocadas | Médio |
| 13 | **Motion e microinterações**: varrer durações hardcoded → tokens; entrada fadeUp em cards | `globals.css` + componentes | Baixo |

## Componentes novos / removidos
- **Novos:** nenhum componente React novo obrigatório (talvez `Toggle.tsx` e `Modal.tsx` primitivos, decidir no passo 7/11).
- **Removidos do Hub (não do repo):** uso de `ShineBorder`/`RainbowButton` no login; gradiente rainbow do wordmark da sidebar.
- **Refatorados:** `Button`, `Card`, `Input`, `Badge`, `ClientSidebar`, `AdminSidebar`, `HubEmptyState`, `Toast`, `Skeleton`, `Pagination`.

## Riscos e mitigação
1. **Regressão visual em massa** (1.150 estilos inline) → migrar tela a tela, screenshot antes/depois em dark+light via preview.
2. **Primitivos com API implícita** (`style` prop sobrescrevendo) → manter merge de `style`/`className` para não quebrar chamadas existentes.
3. **Encoding** → todo arquivo salvo em UTF-8; atenção a strings pt-BR (mojibake já existe em `ClientSidebar`).
4. **Nada de mudança funcional**: rotas, permissões, Supabase, auth, server actions e regras de negócio intocados. Diffs são JSX de apresentação + CSS.
5. **Deploy direto no master** → cada passo termina com `npm run build` + `npm run lint` verdes antes de commit; commits pequenos por passo.

## Validação
- **Visual:** dev server (preview) → screenshot de cada tela alterada em dark e light.
- **Responsividade:** viewport 375 (mobile), 768 (tablet), 1280 (desktop) nas telas-chave.
- **Acessibilidade:** foco por teclado visível em botões/inputs/links; contraste AA nos badges soft.
- **Funcional:** build + lint por passo; fluxos críticos (login, abrir chamado, convite admin) re-testados manualmente ao final dos passos 3, 4 e 7.

---

**Próximo passo: aprovação explícita do usuário para iniciar a Fase 6 (implementação), começando pelo passo 1 (tokens).**
