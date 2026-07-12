import sanitizeHtml from "sanitize-html";

// Allowlist para HTML autorado (base de conhecimento). Conteúdo hoje é criado
// só por admins, mas renderizar HTML sem sanitizar é stored XSS esperando
// acontecer — e os cookies de sessão do @supabase/ssr são legíveis por JS
// (não são httpOnly, ver SECURITY.md §3), então um <script> injetado aqui
// rouba a sessão de quem abrir o artigo. Sanitizar na renderização protege
// inclusive as linhas já gravadas.
const ARTICLE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "blockquote", "pre", "code",
    "ul", "ol", "li",
    "strong", "b", "em", "i", "u", "s", "mark", "small", "sub", "sup",
    "a", "img",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    "span", "div",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["class"],
  },
  // Só http(s) e mailto; bloqueia javascript:, data: (exceto imagens), etc.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowProtocolRelative: false,
  // Todo link externo abre seguro (sem window.opener) e sem vazar referrer.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
  },
};

/** Sanitiza HTML de artigo da base de conhecimento antes de renderizar. */
export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty ?? "", ARTICLE_OPTIONS);
}
