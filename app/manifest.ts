import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fropty Apps",
    short_name: "Fropty",
    description: "Portal do cliente Fropty Apps — acompanhe seus projetos, chamados e tokens.",
    start_url: "/portal/dashboard",
    display: "standalone",
    background_color: "#040316",
    theme_color: "#040316",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    lang: "pt-BR",
    icons: [
      {
        src: "/logo-icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Meu Painel",
        url: "/portal/dashboard",
        description: "Ver resumo da conta",
      },
      {
        name: "Suporte",
        url: "/portal/suporte",
        description: "Abrir ou acompanhar chamados",
      },
    ],
  };
}
