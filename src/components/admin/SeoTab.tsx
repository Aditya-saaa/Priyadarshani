"use client";

import { useState } from "react";
import type { SeoSettings } from "@/lib/types";
import { Button, Card, Field, Input, Textarea } from "./ui";
import { ImagePicker } from "./ImagePicker";

/** Enterprise SEO controls: meta, social cards, schema and canonical URL. */
export default function SeoTab({
  seo,
  onSave,
}: {
  seo: SeoSettings;
  onSave: (value: SeoSettings) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<SeoSettings>(seo);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setBusy(true);
    await onSave(draft);
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">SEO</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Metadata, Open Graph / X cards, canonical URL, sitemap and
            Schema.org Person markup are generated from these fields.
          </p>
        </div>
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </header>

      <Card title="Search appearance">
        <div className="space-y-4">
          <Field label="Meta title" hint={`${draft.title.length}/60 characters`}>
            <Input value={draft.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field
            label="Meta description"
            hint={`${draft.description.length}/160 characters`}
          >
            <Textarea
              rows={3}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
          <Field label="Keywords" hint="Comma separated.">
            <Input
              value={draft.keywords}
              onChange={(e) => set("keywords", e.target.value)}
            />
          </Field>
          <Field
            label="Canonical URL"
            hint="e.g. https://www.example.com — also used for sitemap.xml and robots.txt."
          >
            <Input
              type="url"
              placeholder="https://"
              value={draft.canonicalUrl}
              onChange={(e) => set("canonicalUrl", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card title="Social sharing & structured data">
        <div className="space-y-4">
          <Field
            label="Open Graph image"
            hint="Falls back to the hero image when empty."
          >
            <ImagePicker
              value={draft.ogImage}
              onChange={(url) => set("ogImage", url)}
              allowEmpty
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="X / Twitter handle">
              <Input
                placeholder="@handle"
                value={draft.twitterHandle}
                onChange={(e) => set("twitterHandle", e.target.value)}
              />
            </Field>
            <Field label="Job title (Schema.org Person)">
              <Input
                value={draft.jobTitle}
                onChange={(e) => set("jobTitle", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      {/* Google preview */}
      <Card title="Search preview">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="truncate text-sm text-emerald-400">
            {draft.canonicalUrl || "https://your-domain.com"}
          </p>
          <p className="mt-1 truncate text-lg text-blue-400">{draft.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
            {draft.description}
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
