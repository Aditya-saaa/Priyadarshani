"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ContentSettings } from "@/lib/types";
import { Button, Card, Field, Input, Textarea } from "./ui";
import { ImagePicker } from "./ImagePicker";

/** Edits every public-facing text block plus the hero image. */
export default function ContentTab({
  content,
  onSave,
}: {
  content: ContentSettings;
  onSave: (value: ContentSettings) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<ContentSettings>(content);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ContentSettings>(
    key: K,
    value: ContentSettings[K]
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setBusy(true);
    await onSave(draft);
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Content</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Every text on the public site is editable here.
          </p>
        </div>
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </header>

      <Card title="Hero">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name (H1)">
            <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Subtitle">
            <Input
              value={draft.heroSubtitle}
              onChange={(e) => set("heroSubtitle", e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Hero image">
              <ImagePicker
                value={draft.heroImage}
                onChange={(url) => set("heroImage", url)}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Hero image alt text (SEO & accessibility)">
              <Input
                value={draft.heroImageAlt}
                onChange={(e) => set("heroImageAlt", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="About">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Section kicker">
            <Input
              value={draft.aboutKicker}
              onChange={(e) => set("aboutKicker", e.target.value)}
            />
          </Field>
          <Field label="Section heading">
            <Input
              value={draft.aboutHeading}
              onChange={(e) => set("aboutHeading", e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field
              label="Biography"
              hint="Separate paragraphs with a blank line."
            >
              <Textarea
                rows={7}
                value={draft.biography}
                onChange={(e) => set("biography", e.target.value)}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Description (highlighted line)">
              <Textarea
                rows={2}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Quote (optional)">
            <Textarea
              rows={2}
              value={draft.quote}
              onChange={(e) => set("quote", e.target.value)}
            />
          </Field>
          <Field label="Quote author">
            <Input
              value={draft.quoteAuthor}
              onChange={(e) => set("quoteAuthor", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Achievements"
        actions={
          <Button
            variant="ghost"
            onClick={() =>
              set("achievements", [
                ...draft.achievements,
                { title: "New achievement", detail: "" },
              ])
            }
          >
            <Plus className="mr-1 inline h-4 w-4" /> Add
          </Button>
        }
      >
        <div className="mb-4">
          <Field label="Achievements heading">
            <Input
              value={draft.achievementsHeading}
              onChange={(e) => set("achievementsHeading", e.target.value)}
            />
          </Field>
        </div>
        <ul className="space-y-3">
          {draft.achievements.map((a, i) => (
            <li
              key={i}
              className="flex flex-col gap-2 rounded-xl border border-zinc-800 p-4 sm:flex-row sm:items-start"
            >
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <Input
                  aria-label={`Achievement ${i + 1} title`}
                  value={a.title}
                  onChange={(e) =>
                    set(
                      "achievements",
                      draft.achievements.map((x, j) =>
                        j === i ? { ...x, title: e.target.value } : x
                      )
                    )
                  }
                />
                <Input
                  aria-label={`Achievement ${i + 1} detail`}
                  value={a.detail}
                  onChange={(e) =>
                    set(
                      "achievements",
                      draft.achievements.map((x, j) =>
                        j === i ? { ...x, detail: e.target.value } : x
                      )
                    )
                  }
                />
              </div>
              <button
                aria-label={`Remove achievement ${i + 1}`}
                onClick={() =>
                  set(
                    "achievements",
                    draft.achievements.filter((_, j) => j !== i)
                  )
                }
                className="self-start rounded-lg p-2 text-zinc-500 transition hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Gallery & footer text">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Gallery kicker">
            <Input
              value={draft.galleryKicker}
              onChange={(e) => set("galleryKicker", e.target.value)}
            />
          </Field>
          <Field label="Gallery heading">
            <Input
              value={draft.galleryHeading}
              onChange={(e) => set("galleryHeading", e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Gallery description">
              <Textarea
                rows={2}
                value={draft.galleryDescription}
                onChange={(e) => set("galleryDescription", e.target.value)}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Footer text">
              <Input
                value={draft.footerText}
                onChange={(e) => set("footerText", e.target.value)}
              />
            </Field>
          </div>
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
