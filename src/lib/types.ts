/** Shared domain types for site settings stored as JSONB documents. */

export type Achievement = {
  title: string;
  detail: string;
};

export type ContentSettings = {
  name: string;
  heroSubtitle: string;
  heroImage: string;
  heroImageAlt: string;
  aboutKicker: string;
  aboutHeading: string;
  biography: string;
  description: string;
  achievementsHeading: string;
  achievements: Achievement[];
  quote: string;
  quoteAuthor: string;
  galleryKicker: string;
  galleryHeading: string;
  galleryDescription: string;
  footerText: string;
};

export type ThemeMode = "light" | "dark" | "auto";

export type ThemeSettings = {
  preset: string;
  mode: ThemeMode;
  /** Optional per-token overrides on top of the preset palette. */
  overrides: Partial<Record<"accent" | "background" | "surface" | "text", string>>;
  typography: "serif" | "sans";
  radius: number; // px, 0 - 24
  buttonStyle: "solid" | "outline";
  animationSpeed: "slow" | "normal" | "fast";
  sectionSpacing: "compact" | "normal" | "spacious";
};

export type SeoSettings = {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;
  twitterHandle: string;
  jobTitle: string;
};

export type SectionId = "hero" | "about" | "gallery";

export type LayoutSection = {
  id: SectionId;
  visible: boolean;
};

export type LayoutSettings = {
  sections: LayoutSection[];
  galleryLayout: "masonry" | "grid";
  /** Desktop column count for the gallery (2–4). */
  galleryColumns: 2 | 3 | 4;
  /** Spacing between gallery images. */
  galleryGap: "tight" | "normal" | "airy";
  /** Image shape in grid mode (masonry always keeps natural heights). */
  galleryAspect: "square" | "portrait" | "landscape";
  heroAlignment: "center" | "left";
};

export type GalleryImageDTO = {
  id: number;
  url: string;
  caption: string;
  alt: string;
  visible: boolean;
  sortOrder: number;
};

export type SocialLinkDTO = {
  id: number;
  platform: string;
  label: string;
  url: string;
  visible: boolean;
  sortOrder: number;
};

export type SiteData = {
  content: ContentSettings;
  theme: ThemeSettings;
  seo: SeoSettings;
  layout: LayoutSettings;
  socials: SocialLinkDTO[];
  gallery: GalleryImageDTO[];
  lastUpdate: string | null;
};
