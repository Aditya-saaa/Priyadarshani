/**
 * Image upload handler — GitHub edition.
 *
 * Instead of writing to the local filesystem (which is read-only on Vercel),
 * this route commits each uploaded file to the GitHub repository under
 * `public/uploads/`.  It then returns a `raw.githubusercontent.com` URL
 * that is immediately accessible without waiting for a Vercel redeploy.
 *
 * Requirements:
 *   GITHUB_TOKEN  — PAT with Contents read/write permission
 *   GITHUB_OWNER  — Repository owner
 *   GITHUB_REPO   — Repository name
 *
 * NOTE: raw.githubusercontent.com serves files from public repositories
 * without authentication.  If your repository is private you will need a
 * different hosting strategy (e.g. Cloudinary, Vercel Blob, S3).
 */
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/data";
import { uploadBinaryFile } from "../../../../lib/github";
export const dynamic = "force-dynamic";

const MAX_SIZE = 15 * 1024 * 1024; // 15 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

/**
 * Accepts multipart uploads (field "files").
 * Optionally compresses via sharp when available.
 * Commits each file to GitHub and returns its raw URL.
 */
export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // Try to load sharp for optional compression (not available on all runtimes)
  let sharpFn: typeof import("sharp") | null = null;
  try {
    sharpFn = (await import("sharp")).default;
  } catch {
    // Not available — upload originals
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 15 MB)" },
        { status: 400 }
      );
    }

    let buffer = Buffer.from(await file.arrayBuffer());
    let ext = EXT_MAP[file.type] ?? ".bin";

    // Compress with sharp when available
    if (sharpFn) {
      try {
	const compressed = await sharpFn(buffer)
	  .rotate()
	  .resize(2000, 2000, {
	    fit: "inside",
	    withoutEnlargement: true,
	  })
	  .webp({ quality: 80 })
	  .toBuffer();

	buffer = Buffer.from(compressed);
        ext = ".webp";
      } catch {
        // Compression failed — upload the original buffer + ext unchanged
      }
    }

    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
    const repoPath = `public/uploads/${filename}`;

    const rawUrl = await uploadBinaryFile(
      repoPath,
      buffer,
      `media: upload ${filename}`
    );

    urls.push(rawUrl);
  }

  await logActivity("Uploaded media", `${urls.length} file(s)`);
  return NextResponse.json({ urls });
}
