/**
 * GitHub Contents API helpers.
 *
 * This is the single integration point for all CMS persistence.
 * Every read/write goes through the GitHub REST API so the app is
 * fully compatible with Vercel's read-only filesystem.
 *
 * Required environment variables:
 *   GITHUB_TOKEN  — Personal-access token with "Contents: read/write" scope
 *   GITHUB_OWNER  — GitHub username or organisation
 *   GITHUB_REPO   — Repository name (must contain the data/ folder)
 */

const GITHUB_API = "https://api.github.com";

// ── Configuration ─────────────────────────────────────────────────────────────

function cfg() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) {
    throw new Error(
      "GitHub CMS not configured. " +
        "Please set GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO environment variables."
    );
  }
  return { token, owner, repo };
}

function apiHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

// ── In-memory TTL cache ───────────────────────────────────────────────────────
//
// Warm Vercel Lambda instances share module-level state.  This cache prevents
// multiple API calls for the same file within a short time window.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const _cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 30_000; // 30 seconds

function cacheGet<T>(key: string): T | undefined {
  const entry = _cache.get(key) as CacheEntry<T> | undefined;
  if (!entry || entry.expiresAt < Date.now()) {
    _cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function cacheSet<T>(key: string, value: T): void {
  _cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Invalidate a single cache entry after a write. */
export function cacheInvalidate(filePath: string): void {
  _cache.delete(filePath);
}

// ── Low-level file fetch ──────────────────────────────────────────────────────

interface GitHubFileMeta {
  content: string; // base64, possibly newline-wrapped
  sha: string;
  path: string;
}

/**
 * Fetch raw file metadata from GitHub.
 * Returns null for 404; throws on any other error.
 * Results are NOT cached here — callers decide caching strategy.
 */
async function fetchFileMeta(filePath: string): Promise<GitHubFileMeta | null> {
  const { token, owner, repo } = cfg();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
  const res = await fetch(url, {
    headers: apiHeaders(token),
    // Always bypass Next.js fetch cache — we manage our own TTL
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`GitHub GET "${filePath}" → ${res.status}: ${text}`);
  }
  return (await res.json()) as GitHubFileMeta;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Read a JSON file from GitHub.
 *
 * - Uses the TTL cache to reduce API round-trips.
 * - Returns `fallback` when the file does not exist or cannot be parsed.
 */
export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  const cached = cacheGet<T>(filePath);
  if (cached !== undefined) return cached;

  const meta = await fetchFileMeta(filePath);
  if (!meta) {
    cacheSet(filePath, fallback);
    return fallback;
  }

  try {
    // GitHub base64 content may contain newlines — strip them before decode
    const raw = Buffer.from(meta.content.replace(/\n/g, ""), "base64").toString("utf-8");
    const parsed = JSON.parse(raw) as T;
    cacheSet(filePath, parsed);
    return parsed;
  } catch {
    cacheSet(filePath, fallback);
    return fallback;
  }
}

/**
 * Create or update a JSON file in the GitHub repository.
 *
 * - Automatically fetches the current SHA so updates are never rejected.
 * - Invalidates the local cache on success so the next read is fresh.
 * - Triggers a Vercel redeployment when the repo is connected to Vercel.
 */
export async function writeJsonFile(
  filePath: string,
  data: unknown,
  commitMessage: string
): Promise<void> {
  const { token, owner, repo } = cfg();

  // We MUST provide the current SHA for updates, or GitHub returns 409
  const meta = await fetchFileMeta(filePath);

  const content = Buffer.from(JSON.stringify(data, null, 2), "utf-8").toString("base64");
  const body: Record<string, unknown> = { message: commitMessage, content };
  if (meta) body.sha = meta.sha;

  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: apiHeaders(token),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`GitHub PUT "${filePath}" → ${res.status}: ${text}`);
  }

  // Invalidate so the next read reflects the committed data
  cacheInvalidate(filePath);
}

/**
 * Upload a binary file (e.g. an image) to the GitHub repository.
 *
 * Returns a `raw.githubusercontent.com` URL that is immediately accessible
 * without waiting for a Vercel redeployment.
 *
 * NOTE: This requires the repository to be **public**.  For private repos,
 * serve newly uploaded images through a storage service instead.
 */
export async function uploadBinaryFile(
  filePath: string,
  buffer: Buffer,
  commitMessage: string
): Promise<string> {
  const { token, owner, repo } = cfg();

  // Check whether the file already exists (needed for the SHA on replace)
  const meta = await fetchFileMeta(filePath).catch(() => null);

  const content = buffer.toString("base64");
  const body: Record<string, unknown> = { message: commitMessage, content };
  if (meta) body.sha = meta.sha;

  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: apiHeaders(token),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`GitHub PUT "${filePath}" → ${res.status}: ${text}`);
  }

  // Return a URL that serves the file immediately — no redeploy needed
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
}
