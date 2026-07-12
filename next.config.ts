import type { NextConfig } from "next";

// 'unsafe-eval' só é necessário no dev (HMR do Turbopack). Em produção ele é
// removido — o runtime do Next não precisa de eval e mantê-lo enfraquece a CSP.
// Nota: 'unsafe-inline' em script-src permanece por ora porque o layout usa dois
// <script> inline (theme-init anti-flash + JSON-LD) e o Next injeta seus próprios
// scripts inline de bootstrap. Eliminá-lo exige migrar a CSP para nonce por
// request (via middleware, com strict-dynamic), o que torna todas as rotas
// dinâmicas (SEO/perf da landing) — mudança maior a ser feita em modo
// Report-Only primeiro (ver SECURITY.md §5). style-src mantém 'unsafe-inline'
// porque o app usa estilos inline extensivamente (o próprio exemplo do
// SECURITY.md mantém).
const isDev = process.env.NODE_ENV !== "production";

const scriptSrc = [
  "script-src 'self' 'unsafe-inline'",
  isDev ? "'unsafe-eval'" : "",
].filter(Boolean).join(" ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      `img-src 'self' data: blob: https://cdn.jsdelivr.net https://randomuser.me https://loremflickr.com https://loremflickr.com/cache https://lh3.googleusercontent.com https://avatars.githubusercontent.com ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}`,
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios. Configure as env vars no painel da Vercel."
  );
}

const nextConfig: NextConfig = {
  env: {},
  experimental: {
    viewTransition: true,
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/demo",
        has: [{ type: "host", value: "demo.fropty.com" }],
      },
    ];
  },
  async headers() {
    return [
      // Security headers em todas as rotas
      { source: "/(.*)", headers: securityHeaders },
      // Cache agressivo para fontes e ícones (imutáveis após hash)
      {
        source: "/fonts/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/tabler-icons.min.css",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      // Cache para imagens e GIF
      {
        source: "/:file(.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico))",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  // Turbopack warning: definir root explícito
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
