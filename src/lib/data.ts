/**
 * Compatibility shim — all existing imports from "@/lib/data" are preserved.
 * Every function delegates to the GitHub-backed store in "./store".
 */
import {
  getContent,
  getTheme,
  getSeo,
  getLayout,
  readGallery,
  readSocials,
  getSiteData as _getSiteData,
  ensureSeeded as _ensureSeeded,
  logActivity as _logActivity,
  readActivity,
  readSetting,
  writeSetting,
} from "./store";
import type { SiteData } from "./types";

/* ── Settings helpers ──────────────────────────────────────────────────────── */

// All getters are now async (GitHub API-backed)
const GETTERS: Record<string, () => Promise<unknown>> = {
  content: getContent,
  theme: getTheme,
  seo: getSeo,
  layout: getLayout,
};

export async function getSetting<T>(key: string): Promise<T> {
  const getter = GETTERS[key];
  if (getter) return (await getter()) as T;
  return readSetting<T>(key);
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await writeSetting(key, value);
}

/* ── Aggregated site data ──────────────────────────────────────────────────── */

export async function getSiteData(): Promise<SiteData> {
  return _getSiteData();
}

export async function ensureSeeded(): Promise<void> {
  await _ensureSeeded();
}

/* ── Activity log ──────────────────────────────────────────────────────────── */

export async function logActivity(action: string, detail = ""): Promise<void> {
  await _logActivity(action, detail);
}

export { readActivity };
