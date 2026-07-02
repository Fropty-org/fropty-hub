"use client";

import {
  useEffect, useRef, useState, useCallback, useTransition, Fragment,
} from "react";
import { useRouter } from "next/navigation";
import {
  Search, LayoutDashboard, MessageCircle, FolderKanban,
  CreditCard, Map, MessageSquarePlus, BookOpen, UserCircle, ArrowRight,
  Hash, Loader2, FileSignature, X, Zap, Users, BarChart3, ScrollText,
} from "lucide-react";
import {
  searchPortal, type SearchResult, type SearchResultType, type SearchResults,
} from "@/app/actions/search";

// ── Icon per result type ────────────────────────────────────────────────────

function ResultIcon({ type, href }: { type: SearchResultType; href: string }) {
  const s = 14;
  const style = { flexShrink: 0 as const };

  if (type === "action")   return <Zap            size={s} style={style} />;
  if (type === "ticket")   return <MessageCircle  size={s} style={style} />;
  if (type === "project")  return <FolderKanban   size={s} style={style} />;
  if (type === "contract") return <FileSignature  size={s} style={style} />;
  if (type === "kb")       return <BookOpen       size={s} style={style} />;
  if (type === "roadmap")  return <Map            size={s} style={style} />;
  if (type === "feedback") return <MessageSquarePlus size={s} style={style} />;

  // nav — pick by href
  if (href.includes("dashboard") || href.includes("overview")) return <LayoutDashboard size={s} style={style} />;
  if (href.includes("usuarios"))        return <Users             size={s} style={style} />;
  if (href.includes("customer-success")) return <Users            size={s} style={style} />;
  if (href.includes("analytics"))       return <BarChart3         size={s} style={style} />;
  if (href.includes("audit"))           return <ScrollText        size={s} style={style} />;
  if (href.includes("suporte"))         return <MessageCircle     size={s} style={style} />;
  if (href.includes("projetos"))        return <FolderKanban      size={s} style={style} />;
  if (href.includes("contratos"))       return <FileSignature     size={s} style={style} />;
  if (href.includes("financeiro") || href.includes("planos")) return <CreditCard size={s} style={style} />;
  if (href.includes("roadmap"))         return <Map               size={s} style={style} />;
  if (href.includes("feedback"))        return <MessageSquarePlus size={s} style={style} />;
  if (href.includes("base-conhecimento")) return <BookOpen        size={s} style={style} />;
  if (href.includes("perfil"))          return <UserCircle        size={s} style={style} />;
  return <Hash size={s} style={style} />;
}

const GROUP_LABELS: Record<string, string> = {
  action:   "Ações",
  nav:      "Navegar",
  ticket:   "Chamados",
  project:  "Projetos",
  contract: "Contratos",
  kb:       "Base de Conhecimento",
  roadmap:  "Roadmap",
  feedback: "Feedback",
};

interface FlatResult extends SearchResult {
  groupKey: string;
}

// ── Main component ──────────────────────────────────────────────────────────

export function CommandPalette() {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [active, setActive] = useState(0);
  const [isPending, startTransition] = useTransition();

  const inputRef    = useRef<HTMLInputElement>(null);
  const listRef     = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const router      = useRouter();

  // ── Open / close ───────────────────────────────────────────────────────

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults(null);
    setActive(0);
  }, []);

  // ── Keyboard shortcut ──────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod   = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open ? closePalette() : openPalette();
      }
      if (e.key === "Escape" && open) closePalette();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openPalette, closePalette]);

  // ── Search ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await searchPortal(query);
        setResults(res);
        setActive(0);
      });
    }, query.length === 0 ? 0 : 180);
    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  // ── Flatten results for keyboard nav ──────────────────────────────────

  const flat: FlatResult[] = results
    ? [
        ...results.actions.map(r   => ({ ...r, groupKey: "action" })),
        ...results.nav.map(r       => ({ ...r, groupKey: "nav" })),
        ...results.tickets.map(r   => ({ ...r, groupKey: "ticket" })),
        ...results.projects.map(r  => ({ ...r, groupKey: "project" })),
        ...results.contracts.map(r => ({ ...r, groupKey: "contract" })),
        ...results.kb.map(r        => ({ ...r, groupKey: "kb" })),
        ...results.roadmap.map(r   => ({ ...r, groupKey: "roadmap" })),
        ...results.feedbacks.map(r => ({ ...r, groupKey: "feedback" })),
      ]
    : [];

  // ── Keyboard navigation ────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(a => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[active];
      if (item) { router.push(item.href); closePalette(); }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  // ── Render groups ──────────────────────────────────────────────────────

  const groupEntries: Array<{ key: string; items: SearchResult[] }> = results
    ? [
        { key: "action",   items: results.actions },
        { key: "nav",      items: results.nav },
        { key: "ticket",   items: results.tickets },
        { key: "project",  items: results.projects },
        { key: "contract", items: results.contracts },
        { key: "kb",       items: results.kb },
        { key: "roadmap",  items: results.roadmap },
        { key: "feedback", items: results.feedbacks },
      ].filter(g => g.items.length > 0)
    : [];

  let globalIdx = 0;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closePalette}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          animation: "cpFadeIn 0.12s ease-out both",
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca rápida"
        style={{
          position: "fixed", top: "18vh", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999, width: "min(580px, 94vw)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-lg)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.32)",
          overflow: "hidden",
          animation: "cpSlideIn 0.15s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Search input row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          {isPending
            ? <Loader2 size={16} style={{ color: "var(--primary)", flexShrink: 0, animation: "spin 0.7s linear infinite" }} />
            : <Search  size={16} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por UFT0000, chamados, projetos, artigos, ações..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontSize: "15px", color: "var(--text)", fontFamily: "inherit",
            }}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--text-faint)", display: "flex" }}
            >
              <X size={14} />
            </button>
          )}
          <kbd style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 4, padding: "2px 6px", fontSize: "11px",
            color: "var(--text-faint)", whiteSpace: "nowrap", fontFamily: "inherit",
          }}>
            Esc
          </kbd>
        </div>

        {/* Results */}
        {groupEntries.length > 0 && (
          <div
            ref={listRef}
            style={{ maxHeight: 360, overflowY: "auto", padding: "8px 0" }}
          >
            {groupEntries.map(({ key, items }) => (
              <Fragment key={key}>
                <p style={{
                  margin: 0, padding: "6px 16px 3px",
                  fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "var(--text-faint)",
                }}>
                  {GROUP_LABELS[key] ?? key}
                </p>
                {items.map(item => {
                  const idx = globalIdx++;
                  const isActive = idx === active;
                  return (
                    <button
                      key={item.id}
                      data-idx={idx}
                      onClick={() => { router.push(item.href); closePalette(); }}
                      onMouseEnter={() => setActive(idx)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "8px 16px",
                        background: isActive ? "var(--primary)" : "transparent",
                        border: "none", cursor: "pointer", textAlign: "left",
                        color: isActive ? "#fff" : "var(--text)",
                        transition: "background 0.08s",
                      }}
                    >
                      <span style={{ opacity: isActive ? 1 : 0.55 }}>
                        <ResultIcon type={item.type} href={item.href} />
                      </span>
                      <span style={{ flex: 1, fontSize: "13.5px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span style={{
                          fontSize: "11px", opacity: 0.6,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          maxWidth: 120,
                        }}>
                          {item.subtitle}
                        </span>
                      )}
                      <ArrowRight size={12} style={{ opacity: isActive ? 0.8 : 0.3, flexShrink: 0 }} />
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        )}

        {/* Empty: query but no results */}
        {results && query.length >= 2 && groupEntries.length === 0 && !isPending && (
          <div style={{ padding: "28px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
              Nenhum resultado para <strong style={{ color: "var(--text)" }}>&ldquo;{query}&rdquo;</strong>
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "8px 16px", borderTop: "1px solid var(--border)",
          background: "var(--surface-2)",
        }}>
          {[
            { keys: ["↑", "↓"], label: "navegar" },
            { keys: ["↵"],      label: "abrir" },
            { keys: ["Esc"],    label: "fechar" },
          ].map(({ keys, label }) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "var(--text-faint)" }}>
              {keys.map(k => (
                <kbd key={k} style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 3, padding: "1px 5px", fontSize: "10px", fontFamily: "inherit",
                }}>
                  {k}
                </kbd>
              ))}
              {label}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cpFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cpSlideIn { from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.97) } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1) } }
      `}</style>
    </>
  );
}
