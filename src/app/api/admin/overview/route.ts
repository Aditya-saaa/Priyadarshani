import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { readActivity, readGallery, getTheme, getContent } from "@/lib/store";
import { getPreset } from "@/lib/themes";

export const dynamic = "force-dynamic";

/** Dashboard overview: status, counts, active theme, last update, activity. */
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  // Fetch in parallel to keep latency low
  const [gallery, theme, content] = await Promise.all([
    readGallery(),
    getTheme(),
    getContent(),
  ]);

  const activity = readActivity(12);

  return NextResponse.json({
    status: "online",
    totalImages: gallery.length,
    visibleImages: gallery.filter((g) => g.visible).length,
    activeTheme: getPreset(theme.preset).name,
    themeMode: theme.mode,
    lastUpdate: null,
    activity: activity.map((a) => ({
      id: a.id,
      action: a.action,
      detail: a.detail,
      createdAt: a.createdAt,
    })),
  });
}
