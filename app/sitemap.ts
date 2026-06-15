import type { MetadataRoute } from "next";

const siteUrl = "https://fropty.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1 },
    { url: `${siteUrl}/configurador`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/termos`,        lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${siteUrl}/privacidade`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];
}
