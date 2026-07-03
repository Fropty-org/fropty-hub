import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Protótipo de landing separado (não faz parte do Hub); tem seu próprio
      // toolchain e não deve poluir o lint do app.
      "workspace/**",
      // Scripts de skills/ferramentas (Node .cjs, fora do app).
      ".agents/**",
      // Specs Playwright: usam a fixture `use` (não é hook React), o que dispara
      // react-hooks/rules-of-hooks falsamente. Testes E2E não seguem as regras de RSC.
      "e2e/**",
    ],
  },
  {
    // Disciplina de design system — apenas nas superfícies do Hub (portal,
    // admin e componentes do produto). Marketing/landing e /demo ficam de fora:
    // usam hex/estilo livres de propósito.
    files: [
      "app/(cliente)/**/*.{ts,tsx}",
      "app/(admin)/**/*.{ts,tsx}",
      "app/components/ui/**/*.{ts,tsx}",
      "app/components/suporte/**/*.{ts,tsx}",
      "app/components/cliente/**/*.{ts,tsx}",
      "app/components/admin/**/*.{ts,tsx}",
      "app/components/projetos/**/*.{ts,tsx}",
      "app/components/knowledge/**/*.{ts,tsx}",
      "app/lib/constants/**/*.{ts,tsx}",
    ],
    rules: {
      // `warn` (não `error`) por decisão consciente: ainda há ~730 style inline
      // e ~100 hex a migrar; um `error` quebraria o lint hoje. O aviso cria
      // pressão gradual e visível sem travar o build. Quando a migração para
      // tokens/classes `hub-*` terminar, o hex pode virar `error`.
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXAttribute[name.name='style']",
          message:
            "Evite style inline no Hub: prefira classes hub-* e os primitivos do design system (Card, Button, StatusBadge, PageHeader, Pagination…).",
        },
        {
          selector: "Literal[value=/#[0-9a-fA-F]{6}\\b/]",
          message:
            "Cor hex literal fura o theming/dark mode: use tokens CSS (var(--c-*), var(--brand-*)) ou classes hub-*.",
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{6}/]",
          message:
            "Cor hex literal fura o theming/dark mode: use tokens CSS ou color-mix() em vez de compor hex (ex.: `${cor}15`).",
        },
      ],
    },
  },
];

export default eslintConfig;
