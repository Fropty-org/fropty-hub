import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      `img-src 'self' data: blob: https://cdn.jsdelivr.net https://randomuser.me https://loremflickr.com https://loremflickr.com/cache ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}`,
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com",
      "frame-ancestors 'none'",
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
  },
  // Turbopack warning: definir root explícito
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
