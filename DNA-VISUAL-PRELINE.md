# DNA VISUAL PRELINE — Padrões extraídos para aplicação no Fropty Hub

> Fase 1 da auditoria de design. Fontes: scraping Firecrawl (preline.co, admin-dashboard,
> analytics-dashboard, calendar-app, helpdesk — páginas de preview e demos `index-preview.html`),
> referência do Figma Preline UI já mapeada (buttons: 6 variantes × 3 tamanhos × 7 cores × 4 estados),
> e conhecimento estrutural do Preline UI (biblioteca open-source Tailwind).
>
> **Uso:** benchmark visual e estrutural. Nada aqui é para ser copiado literalmente —
> textos, assets e marca Preline ficam de fora. O que se extrai é o *sistema*.

---

## 1. Estrutura visual

| Aspecto | Padrão Preline |
|---|---|
| Layout base | Sidebar fixa (~260px) + topbar (~56–64px) + conteúdo fluido |
| Container | Conteúdo ocupa a largura toda menos a sidebar; `max-w-7xl` apenas em páginas de leitura; padding lateral `px-4 sm:px-6 lg:px-8` |
| Grid de KPIs | 2–4 colunas, `gap` 16–20px, cards de altura uniforme |
| Densidade | **Alta e organizada**: corpo `14px` (text-sm) em toda a UI; ícones 16px; alturas de linha compactas |
| Hierarquia | Título de página `text-lg/xl semibold` (não gigante) → labels de seção `text-xs uppercase` → dados em destaque |
| Composição dashboard | Linha 1: KPI cards · Linha 2: chart principal + lista lateral · Linha 3: tabela densa |
| List/detail (helpdesk) | Split de 3 colunas: lista de conversas (w-80~96) + thread central + painel de contexto |
| Calendário | Toolbar (mês + navegação + view switcher segmentado) + grid com células de borda 1px, eventos como pills coloridas |

## 2. Design System (tokens observados)

### Cores — light mode
- **Fundo de página:** `#FAFAF9` (stone-50) ou branco — quase sem tom
- **Superfície/card:** `#FFFFFF`
- **Bordas:** `gray-200` (#E5E7EB) — o traço visual dominante; **borda substitui sombra**
- **Texto:** primário `gray-800`, secundário `gray-600` (#6A7282 detectado), muted `gray-500`
- **Accent:** azul `#155DFC` (blue-600 do Tailwind v4) — usado com parcimônia: CTA, links, item ativo, foco

### Cores — dark mode
- **Fundo:** `neutral-900` (#171717)
- **Superfície:** `neutral-800` (#262626)
- **Bordas:** `neutral-700` (#404040)
- **Texto:** primário `neutral-200`, secundário `neutral-400`, muted `neutral-500`
- Accent permanece o mesmo azul; cores de status viram `cor-500/10` de fundo + `cor-500` de texto

### Tons de cinza
Escala única e disciplinada (gray no light, neutral no dark). Nunca mais de 3 níveis de
cinza de fundo numa mesma tela. O contraste vem de texto forte sobre fundo quase neutro.

### Radius
- Botões, inputs, badges internos: `rounded-lg` (8px)
- Cards e painéis: `rounded-xl` (12px)
- Pills/badges/avatars: `rounded-full`

### Sombras
- Cards: `shadow-2xs` — praticamente imperceptível; a borda faz o trabalho
- Dropdowns/popovers: `shadow-md/lg`
- Modais: `shadow-xl`
- **Botões: sem sombra** (inclusive o primary)

### Estados
- **Hover:** fundo um passo na escala (`hover:bg-gray-50/100`, dark `hover:bg-neutral-700`); nunca brightness/filter
- **Focus:** ring azul (`focus:ring-2 ring-blue-500`) ou `focus:bg-*` em botões; sempre visível via teclado
- **Active:** tom acima do hover
- **Disabled:** `opacity-50 pointer-events-none` — padrão único em todo o sistema

## 3. Componentes

| Componente | Anatomia Preline |
|---|---|
| **Card** | branco + `border gray-200` + `rounded-xl` + `shadow-2xs`, padding 20–24px |
| **KPI card** | label `text-xs uppercase gray-500` → valor `text-2xl~3xl semibold tabular-nums` → delta com seta e cor semântica |
| **Sidebar** | fundo igual ao da página ou branco com `border-e`; item `py-2 px-2.5 text-sm rounded-lg gap-x-3`; ativo = `bg-gray-100` + texto forte (sem barra lateral); grupos com heading `text-xs uppercase` |
| **Navbar/topbar** | 56–64px, breadcrumb/busca à esquerda, ações + avatar à direita, `border-b` sutil |
| **Botões** (Figma: 6 variantes) | Solid, Outlined, Ghost, Soft, White, Link · 3 tamanhos (36/44/60px de altura) · `text-sm font-medium rounded-lg gap-x-2`; primary `bg-blue-600 hover:bg-blue-700`; secondary branco + borda + `shadow-2xs hover:bg-gray-50` |
| **Inputs/selects** | `py-2.5 px-4 rounded-lg border-gray-200 text-sm`, focus ring azul; dark `bg-neutral-900 border-neutral-700` |
| **Toggles** | switch `w-11 h-6 rounded-full`, thumb com `transition-transform`, checked azul |
| **Dropdowns** | painel `rounded-lg shadow-md border`, itens `py-2 px-3 text-sm rounded-lg hover:bg-gray-100`, entrada com `opacity+translate` |
| **Badges** | **estilo soft**: `bg-{cor}-100 text-{cor}-800` (light) / `bg-{cor}-500/10 text-{cor}-500` (dark), `rounded-full text-xs font-medium py-1 px-2.5`, às vezes com dot |
| **Avatars** | `rounded-full` com fallback de iniciais; stacks com `-space-x-2` e ring |
| **Charts** | ApexCharts: linhas finas, grid tracejado sutil, tooltip escuro, paleta azul + cinzas, sem 3D/gradientes berrantes |
| **Tooltips** | escuro invertido, `text-xs`, radius 8px |
| **Tabelas** | `th` `text-xs uppercase gray-500` com fundo levemente distinto; `divide-y`; hover `bg-gray-50`; célula `px-4~6 py-3`; toolbar com busca + filtros + export; paginação com contagem "1–10 de 240" |
| **Pricing cards** | borda sutil, plano destacado com borda azul/badge "Most popular", lista com check icons |
| **Notification panel** | dropdown largo com tabs, itens com avatar + timestamp + dot de não-lido |
| **Command/search** | input com ícone + kbd badge (⌘K), modal centrado com resultados agrupados |
| **Empty states** | ícone pequeno em container suave, título `sm font-semibold`, descrição `text-sm gray-500`, CTA opcional — compacto, nunca teatral |

## 4. Motion

| Padrão | Valor |
|---|---|
| Micro (hover/focus/cor) | `transition-colors` ~150ms |
| Padrão (dropdown, toggle) | 200ms `ease-in-out`, `opacity + translate-y` 4–8px |
| Estrutural (sidebar collapse, accordion) | 300ms `ease-in-out` |
| Tema | transição de `background/color` no body, ~200ms |
| Entrada de elementos | fade + subida curta; **nunca** bounce/spring exagerado |
| Feedback | spinner em botão loading; skeleton shimmer em listas |
| Princípio | Motion é invisível: confirma a ação, não chama atenção |

## 5. Backgrounds e profundidade

- Fundo de página **um passo abaixo** da superfície do card — é isso que cria profundidade, não sombra
- Separadores `border-t/divide-y` finos em vez de espaços grandes
- Padrões decorativos (grid pontilhado, **linhas diagonais tracejadas** em baixíssima opacidade) usados apenas em: heros de login/auth, headers de página vazios, banners promo — **nunca** atrás de tabelas e formulários
- Overlays de modal: `bg-gray-900/50` com blur opcional
- Glassmorphism apenas na topbar (bg semitransparente + blur) quando há scroll

## 6. Responsividade

- Sidebar → off-canvas com overlay abaixo de `lg` (1024px); botão hamburger na topbar
- Grids de KPI: 4 → 2 → 1 colunas
- Tabelas: scroll horizontal com sombra de corte, ou colapso em cards empilhados
- Split list/detail (helpdesk): vira navegação empilhada (lista → detalhe) no mobile
- Densidade preservada no mobile — paddings reduzem (`px-4`), tipografia não cresce

---

## Síntese — os 10 princípios do DNA Preline a transpor para o Fropty Hub

1. **Borda antes de sombra** — cards definidos por borda 1px sutil; sombras quase nulas.
2. **Uma escala de cinza disciplinada** — 3 níveis de fundo no máximo por tela.
3. **Densidade text-sm** — corpo 14px, ícones 16px, tudo compacto e alinhado em grade de 4px.
4. **Accent com parcimônia** — cor de marca só em CTA, ativo, foco e links.
5. **Badges soft** — fundo translúcido da cor + texto da cor; nunca fundo sólido saturado.
6. **Estados completos e uniformes** — hover/focus/active/disabled idênticos em todo componente.
7. **Focus ring visível** — acessibilidade de teclado como padrão estético, não como exceção.
8. **Motion 150/200/300ms ease-in-out** — três durações, um easing, zero espetáculo.
9. **Tabela como componente-estrela** — toolbar, th uppercase, hover de linha, paginação com contagem.
10. **Dark mode espelhado 1:1** — cada token light tem o equivalente dark; nada "esquecido".
