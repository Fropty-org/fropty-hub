"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Paginação do design system — usa as classes `.hub-pagination`/`.hub-page-btn`
 * (globals.css). Controlada: recebe `page` e `totalPages` e emite `onChange`.
 * Para listas client-side (ex.: SuporteClient) a paginação fatia o array já
 * filtrado; para listas server-side use um wrapper com `<Link>` + searchParams.
 *
 * Gera reticências quando há muitas páginas: 1 … 4 5 [6] 7 8 … 20.
 */
interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = pageList(page, totalPages);

  return (
    <nav className={["hub-pagination", className ?? ""].filter(Boolean).join(" ")} aria-label="Paginação">
      <button
        type="button"
        className="hub-page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="hub-page-btn" aria-hidden="true" style={{ border: "none", cursor: "default", pointerEvents: "none" }}>
            …
          </span>
        ) : (
          <button
            type="button"
            key={p}
            className={`hub-page-btn${p === page ? " active" : ""}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className="hub-page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Próxima página"
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
