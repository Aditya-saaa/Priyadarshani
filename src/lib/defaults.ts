import type {
  ContentSettings,
  LayoutSettings,
  SeoSettings,
  ThemeSettings,
} from "./types";

export const DEFAULT_CONTENT: ContentSettings = {
  name: "Isabelle Laurent",
  heroSubtitle: "Actress · Producer · Humanitarian",
  heroImage:
    "https://images.pexels.com/photos/20227845/pexels-photo-20227845.jpeg?auto=compress&cs=tinysrgb&w=2400",
  heroImageAlt:
    "Cinematic black and white portrait of Isabelle Laurent in an elegant black outfit",
  aboutKicker: "The Story",
  aboutHeading: "A life devoted to craft, culture and quiet impact.",
  biography:
    "Isabelle Laurent is an internationally acclaimed actress and producer whose work spans two decades of cinema, theatre and global advocacy. Born in Lyon and trained at the Conservatoire national supérieur d'art dramatique in Paris, she rose to prominence with a string of performances praised for their restraint, intelligence and emotional precision.\n\nBeyond the screen, Isabelle has built one of Europe's most respected independent production houses, championing first-time directors and stories told from the margins. Her philanthropic work focuses on arts education for under-served communities, a cause she has carried with her from her earliest days on stage.",
  description:
    "Recognised by audiences and critics alike, Isabelle continues to choose work that asks difficult questions — and answers them with grace.",
  achievementsHeading: "Selected Honours",
  achievements: [
    { title: "Cannes Best Actress", detail: "Festival de Cannes, Palme d'interprétation — 2019" },
    { title: "Two César Awards", detail: "Best Actress 2016 · Best Supporting Actress 2012" },
    { title: "UNESCO Goodwill Ambassador", detail: "Arts education advocacy since 2018" },
    { title: "Légion d'honneur", detail: "Chevalier, for services to French culture — 2022" },
  ],
  quote:
    "Elegance is not about being noticed. It is about being remembered.",
  quoteAuthor: "Isabelle Laurent",
  galleryKicker: "The Gallery",
  galleryHeading: "Moments in light and shadow.",
  galleryDescription:
    "A curated selection of editorial portraits, stills and stage photography from across the years.",
  footerText: "All rights reserved.",
};

export const DEFAULT_THEME: ThemeSettings = {
  preset: "obsidian-gold",
  mode: "dark",
  overrides: {},
  typography: "serif",
  radius: 4,
  buttonStyle: "outline",
  animationSpeed: "normal",
  sectionSpacing: "normal",
};

export const DEFAULT_SEO: SeoSettings = {
  title: "Isabelle Laurent — Official Website",
  description:
    "The official website of Isabelle Laurent — internationally acclaimed actress, producer and humanitarian. Biography, honours and curated photography.",
  keywords:
    "Isabelle Laurent, actress, producer, humanitarian, official website, biography, gallery",
  canonicalUrl: "",
  ogImage: "",
  twitterHandle: "@isabellelaurent",
  jobTitle: "Actress & Producer",
};

export const DEFAULT_LAYOUT: LayoutSettings = {
  sections: [
    { id: "hero", visible: true },
    { id: "about", visible: true },
    { id: "gallery", visible: true },
  ],
  galleryLayout: "masonry",
  galleryColumns: 3,
  galleryGap: "normal",
  galleryAspect: "square",
  heroAlignment: "center",
};

export const DEFAULT_SOCIALS = [
  { id: 1, platform: "instagram", label: "Instagram", url: "https://instagram.com", visible: true, sortOrder: 0 },
  { id: 2, platform: "facebook", label: "Facebook", url: "https://facebook.com", visible: true, sortOrder: 1 },
  { id: 3, platform: "x", label: "X", url: "https://x.com", visible: true, sortOrder: 2 },
  { id: 4, platform: "youtube", label: "YouTube", url: "https://youtube.com", visible: true, sortOrder: 3 },
  { id: 5, platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com", visible: true, sortOrder: 4 },
  { id: 6, platform: "website", label: "Website", url: "https://example.com", visible: false, sortOrder: 5 },
];

const px = (id: number, w = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const DEFAULT_GALLERY = [
  { id: 1, url: px(19432557), caption: "Editorial, Paris — 2023", alt: "Black and white editorial portrait holding a fashion magazine", visible: true, sortOrder: 0 },
  { id: 2, url: px(12367876), caption: "Mist, Normandy coast", alt: "Black and white portrait in a serene foggy setting", visible: true, sortOrder: 1 },
  { id: 3, url: px(20238933), caption: "Studio session, London", alt: "Striking studio portrait in a fashionable jacket", visible: true, sortOrder: 2 },
  { id: 4, url: px(19119549), caption: "Premiere season", alt: "Dramatic portrait in an elegant blouse and skirt", visible: true, sortOrder: 3 },
  { id: 5, url: px(17945059), caption: "Backstage, Théâtre de l'Odéon", alt: "Stylish portrait seated on a stool in a studio", visible: true, sortOrder: 4 },
  { id: 6, url: px(37512797), caption: "Cover story, Milan", alt: "Stylish modern black and white fashion portrait", visible: true, sortOrder: 5 },
  { id: 7, url: px(20227845), caption: "The quiet hour", alt: "Elegant studio portrait in a black outfit", visible: true, sortOrder: 6 },
  { id: 8, url: px(19432553), caption: "Print issue No. 42", alt: "Studio portrait posing with a magazine", visible: true, sortOrder: 7 },
];
