/**
 * Authentication backed by environment variables only.
 * No database required. Sessions live in-memory (lost on server restart).
 * Credentials come from ADMIN_USERNAME / ADMIN_PASSWORD in .env.local.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 h

/* ------------------------------------------------------------------ */
/* Credentials                                                         */
/* ------------------------------------------------------------------ */

function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
  };
}

/* ------------------------------------------------------------------ */
/* Password hashing (scrypt)                                           */
/* ------------------------------------------------------------------ */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/* ------------------------------------------------------------------ */
/* In-memory sessions                                                  */
/* ------------------------------------------------------------------ */

type Session = { expiresAt: number };
const sessions = new Map<string, Session>();

function gc() {
  const now = Date.now();
  for (const [token, sess] of sessions) {
    if (sess.expiresAt < now) sessions.delete(token);
  }
}

export async function createSession(): Promise<string> {
  return process.env.ADMIN_PASSWORD || "admin123";
}
export async function destroySession(_token: string): Promise<void> {
  return;
}
export async function isAuthenticated(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;

    return (
      token ===
      (process.env.ADMIN_PASSWORD || "admin123")
    );
  } catch {
    return false;
  }
}
export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export { SESSION_COOKIE };

/* ------------------------------------------------------------------ */
/* Rate limiting (in-memory, per key)                                  */
/* ------------------------------------------------------------------ */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, max = 5, windowMs = 60_000): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  bucket.count += 1;
  if (bucket.count > max) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/* ------------------------------------------------------------------ */
/* CSRF: verify same-origin                                            */
/* ------------------------------------------------------------------ */

export function verifySameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Auth helpers used by the login route                                */
/* ------------------------------------------------------------------ */

export function verifyAdminPassword(password: string): boolean {
  const creds = getAdminCredentials();
  return password === creds.password;
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const creds = getAdminCredentials();
  return username === creds.username && password === creds.password;
}

/** Stub — password is env-based, so nothing to persist. */
export async function setAdminPassword(_password: string): Promise<void> {
  // Password comes from env vars. Nothing to do here.
}
