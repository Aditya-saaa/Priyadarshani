import { NextResponse } from "next/server";
import { readSocials, writeSocials, logActivity } from "@/lib/store";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;
  return NextResponse.json({ socials: await readSocials() });
}

/** Adds a platform: { platform, label, url } */
export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as {
    platform?: string;
    label?: string;
    url?: string;
  } | null;

  if (!body?.platform || !body.url) {
    return NextResponse.json(
      { error: "Platform and URL required" },
      { status: 400 }
    );
  }

  const socials = await readSocials();
  const nextId = socials.reduce((m, s) => Math.max(m, s.id), 0) + 1;
  const nextSort = socials.reduce((m, s) => Math.max(m, s.sortOrder), -1) + 1;

  socials.push({
    id: nextId,
    platform: body.platform,
    label: body.label ?? body.platform,
    url: body.url,
    visible: true,
    sortOrder: nextSort,
  });

  await writeSocials(socials);
  await logActivity("Added social link", body.platform);
  return NextResponse.json({ social: socials[socials.length - 1] });
}

/** Update or reorder: { id, ... } or { order: number[] } */
export async function PATCH(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as {
    id?: number;
    platform?: string;
    label?: string;
    url?: string;
    visible?: boolean;
    order?: number[];
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const socials = await readSocials();

  if (body.order) {
    const byId = new Map(socials.map((s) => [s.id, s]));
    body.order.forEach((id, index) => {
      const s = byId.get(id);
      if (s) s.sortOrder = index;
    });
    await writeSocials(socials);
    await logActivity("Reordered social links");
    return NextResponse.json({ ok: true });
  }

  if (typeof body.id !== "number") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const link = socials.find((s) => s.id === body.id);
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  if (body.platform !== undefined) link.platform = body.platform;
  if (body.label !== undefined) link.label = body.label;
  if (body.url !== undefined) link.url = body.url;
  if (body.visible !== undefined) link.visible = body.visible;

  await writeSocials(socials);
  await logActivity("Updated social link", `#${body.id}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const socials = (await readSocials()).filter((s) => s.id !== id);
  await writeSocials(socials);
  await logActivity("Removed social link", `#${id}`);
  return NextResponse.json({ ok: true });
}
