import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Tamanho de página padrão das listas do portal (suporte, projetos, contratos). */
export const LIST_PAGE_SIZE = 20;

/** Itens da paginação: primeira/última página sempre visíveis, janela ao redor da atual. */
export function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const items: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) items.push("…");
    items.push(sorted[i]);
  }
  return items;
}

/** Normaliza o searchParam `page` para o intervalo [1, totalPages]. */
export function parsePage(raw: string | undefined, totalPages: number): number {
  const n = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, Math.max(1, totalPages));
}

interface Props {
  current:  number;
  total:    number;
  /** rota base dos links, ex.: "/portal/projetos" */
  basePath: string;
  /** query params extras preservados nos links (ex.: view=lista) */
  params?:  Record<string, string>;
  /** rótulo de acessibilidade da navegação */
  label?:   string;
}

function hrefFor(basePath: string, params: Record<string, string>, page: number): string {
  const sp = new URLSearchParams(params);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Paginação por links (server-safe) no padrão `hub-pagination` do DS.
 * Para listas client-side com estado, use os mesmos `hub-page-btn` com <button>.
 */
export function PaginationNav({ current, total, basePath, params = {}, label = "Paginação" }: Props) {
  if (total <= 1) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 20px", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
      <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
        Página {current} de {total}
      </span>
      <nav className="hub-pagination" aria-label={label}>
        <Link
          className="hub-page-btn"
          href={hrefFor(basePath, params, current - 1)}
          aria-disabled={current === 1 || undefined}
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} />
        </Link>
        {pageItems(current, total).map((it, idx) =>
          it === "…" ? (
            <span key={`sep-${idx}`} className="hub-page-sep">…</span>
          ) : (
            <Link
              key={it}
              className={`hub-page-btn${it === current ? " active" : ""}`}
              href={hrefFor(basePath, params, it)}
              aria-current={it === current ? "page" : undefined}
            >
              {it}
            </Link>
          ),
        )}
        <Link
          className="hub-page-btn"
          href={hrefFor(basePath, params, current + 1)}
          aria-disabled={current === total || undefined}
          aria-label="Próxima página"
        >
          <ChevronRight size={14} />
        </Link>
      </nav>
    </div>
  );
}
