import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { getSetting, ensureSeeded } from "@/lib/data";
import { buildThemeCss } from "@/lib/theme-css";
import type { SeoSettings, ThemeSettings, ContentSettings } from "@/lib/types";
import { DEFAULT_SEO, DEFAULT_THEME } from "@/lib/defaults";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let seo: SeoSettings = DEFAULT_SEO;
  let content: ContentSettings | null = null;
  try {
    [seo, content] = await Promise.all([
      getSetting<SeoSettings>("seo"),
      getSetting<ContentSettings>("content"),
    ]);
  } catch {
    // DB unavailable during build — fall back to defaults.
  }
  const ogImage = seo.ogImage || content?.heroImage || "";
  return {
    title: {
      default: seo.title,
      template: `%s · ${content?.name ?? seo.title}`,
    },
    description: seo.description,
    keywords: seo.keywords.split(",").map((k) => k.trim()).filter(Boolean),
    ...(seo.canonicalUrl
      ? {
          metadataBase: new URL(seo.canonicalUrl),
          alternates: { canonical: seo.canonicalUrl },
        }
      : {}),
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "profile",
      siteName: content?.name ?? seo.title,
      ...(ogImage ? { images: [{ url: ogImage, alt: content?.heroImageAlt ?? seo.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      ...(seo.twitterHandle ? { creator: seo.twitterHandle } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let theme: ThemeSettings = DEFAULT_THEME;
  try {
    await ensureSeeded();
    theme = await getSetting<ThemeSettings>("theme");
  } catch {
    // DB unavailable during build — fall back to defaults.
  }

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <style
          id="theme-vars"
          dangerouslySetInnerHTML={{ __html: buildThemeCss(theme) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
