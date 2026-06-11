/**
 * GitHub-backed JSON store.
 *
 * All persistence goes through the GitHub Contents API via `./github`.
 * This replaces every `fs.writeFileSync` / `renameSync` call so the
 * application runs correctly on Vercel's read-only filesystem.
 *
 * Activity entries are kept in-memory only.  They are intentionally NOT
 * committed to GitHub on every admin action (that would produce too many
 * noisy commits).  They survive warm Lambda invocations but are reset on
 * cold starts and new deployments — acceptable for a display-only log.
 */
import { readJsonFile, writeJsonFile } from "./github";
import {
  DEFAULT_CONTENT,
  DEFAULT_GALLERY,
  DEFAULT_LAYOUT,
  DEFAULT_SEO,
  DEFAULT_SOCIALS,
  DEFAULT_THEME,
} from "./defaults";
import type {
  ContentSettings,
  GalleryImageDTO,
  LayoutSettings,
  SeoSettings,
  SiteData,
  SocialLinkDTO,
  ThemeSettings,
} from "./types";

// ── File path constants ───────────────────────────────────────────────────────

const FILES = {
  content: "data/content.json",
  theme: "data/theme.json",
  seo: "data/settings.json",
  layout: "data/layout.json",
  gallery: "data/gallery.json",
  social: "data/social.json",
} as const;

// ── In-memory activity log ────────────────────────────────────────────────────

type ActivityEntry = {
  id: number;
  action: string;
  detail: string;
  createdAt: string;
};

const _activityLog: ActivityEntry[] = [];
let _activitySeq = 1;

// ── Generic setting helpers ───────────────────────────────────────────────────

/**
 * Read any named settings file from GitHub.
 * Automatically appends ".json" when the name has no extension.
 */
export async function readSetting<T>(name: string): Promise<T> {
  const path = `data/${name.endsWith(".json") ? name : `${name}.json`}`;
  return readJsonFile<T>(path, undefined as unknown as T);
}

/**
 * Write any named settings file to GitHub.
 *
 * The key→file mapping must be consistent with `FILES` above so that
 * the correct SHA is fetched before the PUT.
 */
export async function writeSetting(name: string, value: unknown): Promise<void> {
  // Map logical key names to their actual file paths
  const fileMap: Record<string, string> = {
    content: FILES.content,
    theme: FILES.theme,
    // "seo" is stored in settings.json for historical reasons
    seo: FILES.seo,
    layout: FILES.layout,
  };
  const filePath = fileMap[name] ?? `data/${name.endsWith(".json") ? name : `${name}.json`}`;
  await writeJsonFile(filePath, value, `content: update ${name} settings`);
}

// ── Content settings ──────────────────────────────────────────────────────────

export async function getContent(): Promise<ContentSettings> {
  return readJsonFile<ContentSettings>(FILES.content, DEFAULT_CONTENT);
}

// ── Theme settings ────────────────────────────────────────────────────────────

export async function getTheme(): Promise<ThemeSettings> {
  return readJsonFile<ThemeSettings>(FILES.theme, DEFAULT_THEME);
}

// ── SEO / site settings ───────────────────────────────────────────────────────

export async function getSeo(): Promise<SeoSettings> {
  return readJsonFile<SeoSettings>(FILES.seo, DEFAULT_SEO);
}

// ── Layout settings ───────────────────────────────────────────────────────────

export async function getLayout(): Promise<LayoutSettings> {
  return readJsonFile<LayoutSettings>(FILES.layout, DEFAULT_LAYOUT);
}

// ── Gallery ───────────────────────────────────────────────────────────────────

export async function readGallery(): Promise<GalleryImageDTO[]> {
  return readJsonFile<GalleryImageDTO[]>(FILES.gallery, DEFAULT_GALLERY);
}

export async function writeGallery(images: GalleryImageDTO[]): Promise<void> {
  await writeJsonFile(FILES.gallery, images, "content: update gallery");
}

// ── Social links ──────────────────────────────────────────────────────────────

export async function readSocials(): Promise<SocialLinkDTO[]> {
  return readJsonFile<SocialLinkDTO[]>(FILES.social, DEFAULT_SOCIALS);
}

export async function writeSocials(socials: SocialLinkDTO[]): Promise<void> {
  await writeJsonFile(FILES.social, socials, "content: update social links");
}

// ── Activity log ──────────────────────────────────────────────────────────────

export function logActivitySync(action: string, detail = ""): void {
  _activityLog.push({
    id: _activitySeq++,
    action,
    detail,
    createdAt: new Date().toISOString(),
  });
  // Keep the last 200 entries to bound memory usage
  if (_activityLog.length > 200) {
    _activityLog.splice(0, _activityLog.length - 200);
  }
}

export async function logActivity(action: string, detail = ""): Promise<void> {
  logActivitySync(action, detail);
}

export function readActivity(limit = 12): ActivityEntry[] {
  return _activityLog.slice(-limit).reverse();
}

// ── Aggregated site data ──────────────────────────────────────────────────────

/**
 * Fetch all CMS documents in parallel to minimise latency.
 * Used by the public homepage and the admin overview.
 */
export async function getSiteData(): Promise<SiteData> {
  const [content, theme, seo, layout, socials, gallery] = await Promise.all([
    getContent(),
    getTheme(),
    getSeo(),
    getLayout(),
    readSocials(),
    readGallery(),
  ]);

  return {
    content,
    theme,
    seo,
    layout,
    socials,
    gallery,
    lastUpdate: null,
  };
}

/**
 * Warm the in-memory TTL cache by pre-fetching all data files.
 * Called once at startup so the first real request is fast.
 */
export async function ensureSeeded(): Promise<void> {
  await getSiteData();
}
