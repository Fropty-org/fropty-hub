import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/area-cliente/", "/obrigado", "/api/"],
      },
    ],
    sitemap: "https://fropty.com/sitemap.xml",
  };
}
