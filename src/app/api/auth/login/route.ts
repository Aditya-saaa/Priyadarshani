import { NextResponse } from "next/server";
import {
  createSession,
  rateLimit,
  sessionCookieOptions,
  verifyAdminPassword,
  verifySameOrigin,
} from "@/lib/auth";
import { logActivity } from "@/lib/data";

export async function POST(req: Request) {
  if (!verifySameOrigin(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(`login:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${limit.retryAfter}s.` },
      { status: 429 }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    password?: string;
  } | null;
  if (!body?.password) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  if (!verifyAdminPassword(body.password)) {
    await logActivity("Failed login attempt", `IP ${ip}`);
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSession();
  await logActivity("Admin signed in");
  const res = NextResponse.json({ ok: true });
  const { name, ...options } = sessionCookieOptions();
  res.cookies.set(name, token, options);
  return res;
}
