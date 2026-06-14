import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fropty.com";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/configurador`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/termos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacidade`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
