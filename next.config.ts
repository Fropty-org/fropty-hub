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
      "img-src 'self' data: blob:",
      "connect-src 'self' https://*.supabase.co https://api.resend.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

// Valores públicos do Supabase — não são segredos (NEXT_PUBLIC_* são expostos ao browser).
// Servem de fallback quando o Vercel não tem as env vars configuradas.
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://rflnhzpepbnhanuxpqag.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbG5oenBlcGJuaGFudXhwcWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDE5MDcsImV4cCI6MjA5NzAxNzkwN30.L-ZgsCiDMAmBpThPKp4Z73TBiTrGRuV3i9gIw-WNbBE",
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
  },
  // Turbopack warning: definir root explícito
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
