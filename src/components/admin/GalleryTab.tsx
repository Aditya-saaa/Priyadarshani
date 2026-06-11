"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, GripVertical, RefreshCw, Trash2, Upload } from "lucide-react";
import type { GalleryImageDTO } from "@/lib/types";
import { Button, Card, Input, Toggle } from "./ui";

/**
 * Full gallery management: multi-upload (auto-compressed), replace, delete,
 * drag-and-drop reordering, captions, alt text and visibility.
 */
export default function GalleryTab({
  showToast,
  onChanged,
}: {
  showToast: (m: string) => void;
  onChanged: () => void;
}) {
  const [images, setImages] = useState<GalleryImageDTO[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/gallery");
    if (res.ok) {
      const data = await res.json();
      setImages(data.images);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadFiles = async (files: FileList): Promise<string[]> => {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.urls as string[];
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await uploadFiles(files);
      await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: urls.map((url) => ({ url })) }),
      });
      showToast(`${urls.length} image(s) added`);
      await load();
      onChanged();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleReplace = async (files: FileList | null) => {
    const id = replaceTarget.current;
    if (!files?.length || id === null) return;
    setUploading(true);
    try {
      const [url] = await uploadFiles(files);
      await patch({ id, url });
      showToast("Image replaced");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Replace failed");
    } finally {
      setUploading(false);
      replaceTarget.current = null;
    }
  };

  const patch = async (body: Record<string, unknown>) => {
    await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await load();
    onChanged();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this image permanently?")) return;
    await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
    showToast("Image deleted");
    await load();
    onChanged();
  };

  /* Drag-and-drop reorder */
  const onDrop = async (targetId: number) => {
    if (dragId === null || dragId === targetId) return;
    const ids = images.map((i) => i.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ...ids.splice(from, 1));
    // Optimistic local update
    setImages((prev) =>
      [...prev].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
    );
    setDragId(null);
    await patch({ order: ids });
    showToast("Order saved");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gallery</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Drag cards to reorder. Uploads are automatically compressed to WebP.
          </p>
        </div>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 inline h-4 w-4" />
          {uploading ? "Uploading…" : "Upload images"}
        </Button>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleUpload(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          handleReplace(e.target.files);
          e.target.value = "";
        }}
      />

      {images.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-sm text-zinc-500">
            No images yet. Upload your first photographs.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((img) => (
            <li
              key={img.id}
              draggable
              onDragStart={() => setDragId(img.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(img.id)}
              className={`rounded-2xl border bg-zinc-900/50 p-3 transition ${
                dragId === img.id
                  ? "border-amber-400/60 opacity-60"
                  : "border-zinc-800"
              }`}
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt || img.caption || "Gallery image"}
                  className={`h-44 w-full rounded-xl object-cover ${
                    img.visible ? "" : "opacity-40 grayscale"
                  }`}
                  loading="lazy"
                />
                <span className="absolute left-2 top-2 cursor-grab rounded-md bg-zinc-950/70 p-1 text-zinc-400">
                  <GripVertical className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <Input
                  aria-label="Caption"
                  placeholder="Caption"
                  defaultValue={img.caption}
                  onBlur={(e) => {
                    if (e.target.value !== img.caption)
                      patch({ id: img.id, caption: e.target.value });
                  }}
                />
                <Input
                  aria-label="Alt text"
                  placeholder="Alt text (SEO)"
                  defaultValue={img.alt}
                  onBlur={(e) => {
                    if (e.target.value !== img.alt)
                      patch({ id: img.id, alt: e.target.value });
                  }}
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Toggle
                      checked={img.visible}
                      onChange={(v) => patch({ id: img.id, visible: v })}
                      label={img.visible ? "Hide image" : "Show image"}
                    />
                    {img.visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      aria-label="Replace image"
                      title="Replace"
                      onClick={() => {
                        replaceTarget.current = img.id;
                        replaceRef.current?.click();
                      }}
                      className="rounded-lg p-2 text-zinc-400 transition hover:text-amber-300"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Delete image"
                      title="Delete"
                      onClick={() => remove(img.id)}
                      className="rounded-lg p-2 text-zinc-400 transition hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
