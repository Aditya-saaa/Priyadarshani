import type { MetadataRoute } from "next";
import { getSetting } from "@/lib/data";
import type { SeoSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let base = "https://example.com";
  try {
    const seo = await getSetting<SeoSettings>("seo");
    if (seo.canonicalUrl) base = seo.canonicalUrl.replace(/\/$/, "");
  } catch {
    // fall back
  }
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
