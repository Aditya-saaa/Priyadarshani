import { NextResponse } from "next/server";
import { readGallery } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Public paginated gallery feed used for infinite loading. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit")) || 9));

  const all = (await readGallery()).filter((img) => img.visible);
  const page = all.slice(offset, offset + limit);

  return NextResponse.json({ images: page });
}
