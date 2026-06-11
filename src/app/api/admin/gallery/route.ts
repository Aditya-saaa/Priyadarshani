import { NextResponse } from "next/server";
import { readGallery, writeGallery, logActivity } from "@/lib/store";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;
  return NextResponse.json({ images: await readGallery() });
}

/** Adds one or more images: { images: [{ url, caption?, alt? }] } */
export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as {
    images?: { url: string; caption?: string; alt?: string }[];
  } | null;

  if (!body?.images?.length) {
    return NextResponse.json({ error: "No images provided" }, { status: 400 });
  }

  const gallery = await readGallery();
  let nextId = gallery.reduce((m, g) => Math.max(m, g.id), 0) + 1;
  let nextSort = gallery.reduce((m, g) => Math.max(m, g.sortOrder), -1) + 1;

  const inserted = body.images.map((img) => ({
    id: nextId++,
    url: img.url,
    caption: img.caption ?? "",
    alt: img.alt ?? img.caption ?? "",
    visible: true,
    sortOrder: nextSort++,
  }));

  gallery.push(...inserted);
  await writeGallery(gallery);
  await logActivity("Uploaded gallery images", `${inserted.length} added`);
  return NextResponse.json({ images: inserted });
}

/**
 * Updates images.
 * - { id, caption?, alt?, visible?, url? } — single update / replace
 * - { order: number[] } — full reorder (array of ids in new order)
 */
export async function PATCH(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as {
    id?: number;
    caption?: string;
    alt?: string;
    visible?: boolean;
    url?: string;
    order?: number[];
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const gallery = await readGallery();

  if (body.order) {
    const byId = new Map(gallery.map((g) => [g.id, g]));
    body.order.forEach((id, index) => {
      const img = byId.get(id);
      if (img) img.sortOrder = index;
    });
    await writeGallery(gallery);
    await logActivity("Reordered gallery");
    return NextResponse.json({ ok: true });
  }

  if (typeof body.id !== "number") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const img = gallery.find((g) => g.id === body.id);
  if (!img) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  if (body.caption !== undefined) img.caption = body.caption;
  if (body.alt !== undefined) img.alt = body.alt;
  if (body.visible !== undefined) img.visible = body.visible;
  if (body.url !== undefined) img.url = body.url;

  await writeGallery(gallery);
  await logActivity("Updated gallery image", `#${body.id}`);
  return NextResponse.json({ ok: true });
}

/** Deletes an image: ?id=123 */
export async function DELETE(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const gallery = (await readGallery()).filter((g) => g.id !== id);
  await writeGallery(gallery);
  await logActivity("Deleted gallery image", `#${id}`);
  return NextResponse.json({ ok: true });
}
