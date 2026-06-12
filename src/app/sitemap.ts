import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://priyadarshani-ten.vercel.app",
      lastModified: new Date("2026-06-12"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
