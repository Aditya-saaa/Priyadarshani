import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { getSiteData, logActivity, setSetting } from "@/lib/data";

export const dynamic = "force-dynamic";

const ALLOWED_KEYS = new Set(["content", "theme", "seo", "layout"]);

/** Returns the full editable site data set for the admin panel. */
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const data = await getSiteData();
  return NextResponse.json(data);
}

/** Persists one settings document: { key, value } */
export async function PUT(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    const body = (await req.json().catch(() => null)) as {
      key?: string;
      value?: unknown;
    } | null;

    if (
      !body?.key ||
      !ALLOWED_KEYS.has(body.key) ||
      body.value === undefined
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    await setSetting(body.key, body.value);
    await logActivity(`Updated ${body.key} settings`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SETTINGS SAVE ERROR:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
