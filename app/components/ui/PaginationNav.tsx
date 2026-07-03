import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Paginação server-side via `searchParams` (Link-based), para listas em Server
 * Components. Preserva os demais parâmetros da URL (ex.: filtro de status) e só
 * troca `page`. Complementa o <Pagination> (client, controlado) usado em listas
 * com filtro client-side.
 */
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

export function PaginationNav({
  page,
  totalPages,
  basePath,
  params = {},
  className,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") sp.set(k, v);
    }
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const pages = pageList(page, totalPages);

  return (
    <nav className={["hub-pagination", className ?? ""].filter(Boolean).join(" ")} aria-label="Paginação">
      {page <= 1
        ? <span className="hub-page-btn" aria-disabled="true"><ChevronLeft size={15} /></span>
        : <Link className="hub-page-btn" href={hrefFor(page - 1)} aria-label="Página anterior"><ChevronLeft size={15} /></Link>}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="hub-page-btn" aria-hidden="true" style={{ border: "none", pointerEvents: "none" }}>…</span>
        ) : (
          <Link key={p} className={`hub-page-btn${p === page ? " active" : ""}`} href={hrefFor(p)} aria-current={p === page ? "page" : undefined}>
            {p}
          </Link>
        ),
      )}

      {page >= totalPages
        ? <span className="hub-page-btn" aria-disabled="true"><ChevronRight size={15} /></span>
        : <Link className="hub-page-btn" href={hrefFor(page + 1)} aria-label="Próxima página"><ChevronRight size={15} /></Link>}
    </nav>
  );
}
