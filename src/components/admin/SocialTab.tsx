"use client";

import { useCallback, useEffect, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { SocialLinkDTO } from "@/lib/types";
import { SocialIcon, PLATFORM_OPTIONS } from "@/components/site/social-icons";
import { Button, Card, Input, Select, Toggle } from "./ui";

/** Add / edit / reorder / hide social platforms. */
export default function SocialTab({
  showToast,
  onChanged,
}: {
  showToast: (m: string) => void;
  onChanged: () => void;
}) {
  const [socials, setSocials] = useState<SocialLinkDTO[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const [newPlatform, setNewPlatform] = useState("instagram");
  const [newUrl, setNewUrl] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/social");
    if (res.ok) setSocials((await res.json()).socials);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (body: Record<string, unknown>) => {
    await fetch("/api/admin/social", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await load();
    onChanged();
  };

  const add = async () => {
    if (!newUrl) {
      showToast("Enter a URL");
      return;
    }
    await fetch("/api/admin/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: newPlatform,
        label: newPlatform.charAt(0).toUpperCase() + newPlatform.slice(1),
        url: newUrl,
      }),
    });
    setNewUrl("");
    showToast("Platform added");
    await load();
    onChanged();
  };

  const remove = async (id: number) => {
    await fetch(`/api/admin/social?id=${id}`, { method: "DELETE" });
    showToast("Platform removed");
    await load();
    onChanged();
  };

  const onDrop = async (targetId: number) => {
    if (dragId === null || dragId === targetId) return;
    const ids = socials.map((s) => s.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ...ids.splice(from, 1));
    setSocials((prev) =>
      [...prev].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
    );
    setDragId(null);
    await patch({ order: ids });
    showToast("Order saved");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Social media</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Drag to reorder. Hidden platforms stay saved but are not shown on
          the site.
        </p>
      </header>

      <Card title="Add platform">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            aria-label="Platform"
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            className="!w-44"
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </Select>
          <Input
            aria-label="Profile URL"
            type="url"
            placeholder="https://instagram.com/username"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="!w-80"
          />
          <Button onClick={add}>
            <Plus className="mr-1 inline h-4 w-4" /> Add
          </Button>
        </div>
      </Card>

      <ul className="space-y-3">
        {socials.map((s) => (
          <li
            key={s.id}
            draggable
            onDragStart={() => setDragId(s.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(s.id)}
            className={`flex flex-wrap items-center gap-3 rounded-2xl border bg-zinc-900/50 p-4 transition ${
              dragId === s.id ? "border-amber-400/60 opacity-60" : "border-zinc-800"
            }`}
          >
            <span className="cursor-grab text-zinc-500">
              <GripVertical className="h-4 w-4" />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300">
              <SocialIcon platform={s.platform} className="h-4 w-4" />
            </span>
            <Select
              aria-label="Platform / icon"
              value={s.platform}
              onChange={(e) => patch({ id: s.id, platform: e.target.value })}
              className="!w-36"
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </Select>
            <Input
              aria-label="Label"
              defaultValue={s.label}
              placeholder="Label"
              className="!w-36"
              onBlur={(e) => {
                if (e.target.value !== s.label)
                  patch({ id: s.id, label: e.target.value });
              }}
            />
            <Input
              aria-label="URL"
              defaultValue={s.url}
              className="min-w-52 flex-1"
              onBlur={(e) => {
                if (e.target.value !== s.url)
                  patch({ id: s.id, url: e.target.value });
              }}
            />
            <div className="flex items-center gap-3">
              <Toggle
                checked={s.visible}
                onChange={(v) => patch({ id: s.id, visible: v })}
                label={s.visible ? "Hide platform" : "Show platform"}
              />
              <button
                aria-label={`Remove ${s.platform}`}
                onClick={() => remove(s.id)}
                className="rounded-lg p-2 text-zinc-500 transition hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
