"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type {
  ContentSettings,
  LayoutSettings,
  ThemeSettings,
} from "@/lib/types";
import { THEME_PRESETS, getPreset } from "@/lib/themes";
import { buildThemeCss } from "@/lib/theme-css";
import { Button, Card, Field, Input, Select, Toggle } from "./ui";
import { ImagePicker } from "./ImagePicker";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  gallery: "Gallery",
};

/**
 * Theme customization (presets, mode, colors, typography, radius, motion,
 * spacing) and the layout editor (section order/visibility, hero image,
 * alignment, gallery layout) — with a live preview.
 */
export default function ThemeTab({
  theme,
  layout,
  content,
  onSaveTheme,
  onSaveLayout,
  onSaveContent,
  showToast,
}: {
  theme: ThemeSettings;
  layout: LayoutSettings;
  content: ContentSettings;
  onSaveTheme: (v: ThemeSettings) => Promise<boolean>;
  onSaveLayout: (v: LayoutSettings) => Promise<boolean>;
  onSaveContent: (v: ContentSettings) => Promise<boolean>;
  showToast: (m: string) => void;
}) {
  const [draft, setDraft] = useState<ThemeSettings>(theme);
  const [layoutDraft, setLayoutDraft] = useState<LayoutSettings>(layout);
  const [heroImage, setHeroImage] = useState(content.heroImage);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const preset = getPreset(draft.preset);
  const palette = draft.mode === "light" ? preset.light : preset.dark;

  /** Live preview CSS scoped to the preview element. */
  const previewCss = useMemo(
    () =>
      buildThemeCss({ ...draft, mode: draft.mode === "auto" ? "dark" : draft.mode })
        .replace(":root", "#theme-preview"),
    [draft]
  );

  const saveAll = async () => {
    setBusy(true);
    const ok = await onSaveTheme(draft);
    const ok2 = await onSaveLayout(layoutDraft);
    if (heroImage !== content.heroImage) {
      await onSaveContent({ ...content, heroImage });
    }
    setBusy(false);
    if (ok && ok2) showToast("Theme & layout saved — live instantly");
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const sections = [...layoutDraft.sections];
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    [sections[index], sections[target]] = [sections[target], sections[index]];
    setLayoutDraft((l) => ({ ...l, sections }));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Theme & Layout</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Changes apply instantly to the live site after saving.
          </p>
        </div>
        <Button onClick={saveAll} disabled={busy}>
          {busy ? "Saving…" : "Save & publish"}
        </Button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Presets */}
          <Card title="Theme preset">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {THEME_PRESETS.map((p) => {
                const pal = draft.mode === "light" ? p.light : p.dark;
                const active = draft.preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => set("preset", p.id)}
                    aria-pressed={active}
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-amber-400/70 ring-1 ring-amber-400/40"
                        : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <span
                      className="mb-2 flex h-10 items-center gap-1 rounded-lg px-2"
                      style={{ backgroundColor: pal.background }}
                    >
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: pal.accent }} />
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pal.text }} />
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pal.muted }} />
                    </span>
                    <span className="text-xs text-zinc-300">{p.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field label="Mode">
                <Select
                  value={draft.mode}
                  onChange={(e) => set("mode", e.target.value as ThemeSettings["mode"])}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto (system)</option>
                </Select>
              </Field>
              <Field label="Typography">
                <Select
                  value={draft.typography}
                  onChange={(e) =>
                    set("typography", e.target.value as ThemeSettings["typography"])
                  }
                >
                  <option value="serif">Editorial serif</option>
                  <option value="sans">Modern sans</option>
                </Select>
              </Field>
              <Field label="Button style">
                <Select
                  value={draft.buttonStyle}
                  onChange={(e) =>
                    set("buttonStyle", e.target.value as ThemeSettings["buttonStyle"])
                  }
                >
                  <option value="outline">Outline</option>
                  <option value="solid">Solid</option>
                </Select>
              </Field>
            </div>
          </Card>

          {/* Fine-tuning */}
          <Card title="Fine-tuning">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Accent color">
                <Input
                  type="color"
                  aria-label="Accent color"
                  value={draft.overrides.accent || palette.accent}
                  onChange={(e) =>
                    set("overrides", { ...draft.overrides, accent: e.target.value })
                  }
                  className="h-10 !p-1"
                />
              </Field>
              <Field label="Background">
                <Input
                  type="color"
                  aria-label="Background color"
                  value={draft.overrides.background || palette.background}
                  onChange={(e) =>
                    set("overrides", { ...draft.overrides, background: e.target.value })
                  }
                  className="h-10 !p-1"
                />
              </Field>
              <Field label="Surface">
                <Input
                  type="color"
                  aria-label="Surface color"
                  value={draft.overrides.surface || palette.surface}
                  onChange={(e) =>
                    set("overrides", { ...draft.overrides, surface: e.target.value })
                  }
                  className="h-10 !p-1"
                />
              </Field>
              <Field label="Text color">
                <Input
                  type="color"
                  aria-label="Text color"
                  value={draft.overrides.text || palette.text}
                  onChange={(e) =>
                    set("overrides", { ...draft.overrides, text: e.target.value })
                  }
                  className="h-10 !p-1"
                />
              </Field>
              <Field label={`Border radius — ${draft.radius}px`}>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={draft.radius}
                  aria-label="Border radius"
                  onChange={(e) => set("radius", Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </Field>
              <Field label="Animation speed">
                <Select
                  value={draft.animationSpeed}
                  onChange={(e) =>
                    set("animationSpeed", e.target.value as ThemeSettings["animationSpeed"])
                  }
                >
                  <option value="slow">Slow & cinematic</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </Select>
              </Field>
              <Field label="Section spacing">
                <Select
                  value={draft.sectionSpacing}
                  onChange={(e) =>
                    set("sectionSpacing", e.target.value as ThemeSettings["sectionSpacing"])
                  }
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="spacious">Spacious</option>
                </Select>
              </Field>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={() => set("overrides", {})}
                  className="w-full"
                >
                  Reset overrides
                </Button>
              </div>
            </div>
          </Card>

          {/* Layout editor */}
          <Card title="Layout editor">
            <ul className="space-y-2">
              {layoutDraft.sections.map((s, i) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3"
                >
                  <span className="flex-1 text-sm text-zinc-200">
                    {SECTION_LABELS[s.id] ?? s.id}
                  </span>
                  <Toggle
                    checked={s.visible}
                    onChange={(v) =>
                      setLayoutDraft((l) => ({
                        ...l,
                        sections: l.sections.map((x, j) =>
                          j === i ? { ...x, visible: v } : x
                        ),
                      }))
                    }
                    label={`Toggle ${s.id} section`}
                  />
                  <button
                    aria-label={`Move ${s.id} up`}
                    onClick={() => moveSection(i, -1)}
                    disabled={i === 0}
                    className="rounded-lg p-1.5 text-zinc-400 transition hover:text-amber-300 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    aria-label={`Move ${s.id} down`}
                    onClick={() => moveSection(i, 1)}
                    disabled={i === layoutDraft.sections.length - 1}
                    className="rounded-lg p-1.5 text-zinc-400 transition hover:text-amber-300 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Hero text alignment">
                <Select
                  value={layoutDraft.heroAlignment}
                  onChange={(e) =>
                    setLayoutDraft((l) => ({
                      ...l,
                      heroAlignment: e.target.value as LayoutSettings["heroAlignment"],
                    }))
                  }
                >
                  <option value="center">Centered</option>
                  <option value="left">Left aligned</option>
                </Select>
              </Field>
              <Field label="Gallery layout">
                <Select
                  value={layoutDraft.galleryLayout}
                  onChange={(e) =>
                    setLayoutDraft((l) => ({
                      ...l,
                      galleryLayout: e.target.value as LayoutSettings["galleryLayout"],
                    }))
                  }
                >
                  <option value="masonry">Masonry</option>
                  <option value="grid">Uniform grid</option>
                </Select>
              </Field>
              <Field label="Gallery columns (desktop)">
                <Select
                  value={String(layoutDraft.galleryColumns ?? 3)}
                  onChange={(e) =>
                    setLayoutDraft((l) => ({
                      ...l,
                      galleryColumns: Number(
                        e.target.value
                      ) as LayoutSettings["galleryColumns"],
                    }))
                  }
                >
                  <option value="2">2 columns</option>
                  <option value="3">3 columns</option>
                  <option value="4">4 columns</option>
                </Select>
              </Field>
              <Field label="Image spacing">
                <Select
                  value={layoutDraft.galleryGap ?? "normal"}
                  onChange={(e) =>
                    setLayoutDraft((l) => ({
                      ...l,
                      galleryGap: e.target.value as LayoutSettings["galleryGap"],
                    }))
                  }
                >
                  <option value="tight">Tight</option>
                  <option value="normal">Normal</option>
                  <option value="airy">Airy</option>
                </Select>
              </Field>
              <Field
                label="Image shape (grid mode)"
                hint="Masonry always keeps natural image heights."
              >
                <Select
                  value={layoutDraft.galleryAspect ?? "square"}
                  disabled={layoutDraft.galleryLayout === "masonry"}
                  onChange={(e) =>
                    setLayoutDraft((l) => ({
                      ...l,
                      galleryAspect: e.target.value as LayoutSettings["galleryAspect"],
                    }))
                  }
                >
                  <option value="square">Square (1:1)</option>
                  <option value="portrait">Portrait (3:4)</option>
                  <option value="landscape">Landscape (4:3)</option>
                </Select>
              </Field>
            </div>

            {/* Mini layout preview */}
            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="mb-3 text-xs uppercase tracking-wider text-zinc-500">
                Gallery preview
              </p>
              <GalleryMiniPreview layout={layoutDraft} />
            </div>

            <div className="mt-5">
              <Field label="Hero image">
                <ImagePicker value={heroImage} onChange={setHeroImage} />
              </Field>
            </div>
          </Card>
        </div>

        {/* Live preview */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <Card title="Live preview">
            <style dangerouslySetInnerHTML={{ __html: previewCss }} />
            <div
              id="theme-preview"
              className="overflow-hidden rounded-xl border"
              style={{
                backgroundColor: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              <div className="p-6 text-center">
                <p
                  className="text-[0.6rem] uppercase"
                  style={{ letterSpacing: "0.3em", color: "var(--accent)" }}
                >
                  Official Website
                </p>
                <p
                  className="mt-3 text-2xl"
                  style={{
                    fontFamily:
                      draft.typography === "serif"
                        ? "var(--font-playfair), serif"
                        : "var(--font-inter), sans-serif",
                  }}
                >
                  {content.name}
                </p>
                <p className="mt-2 text-[0.65rem] uppercase tracking-[0.3em]" style={{ color: "var(--muted)" }}>
                  {content.heroSubtitle}
                </p>
                <div
                  className="mx-auto mt-5 h-px w-24"
                  style={{
                    background: `linear-gradient(to right, transparent, var(--accent), transparent)`,
                  }}
                />
                <div
                  className="mt-5 p-4 text-left text-xs leading-relaxed"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--muted)",
                  }}
                >
                  A premium card surface using the selected palette, radius and
                  typography.
                </div>
                <button
                  className="mt-4 px-5 py-2 text-[0.65rem] uppercase tracking-[0.25em]"
                  style={{
                    borderRadius: "var(--radius)",
                    ...(draft.buttonStyle === "solid"
                      ? {
                          backgroundColor: "var(--accent)",
                          color: "var(--accent-contrast)",
                        }
                      : {
                          border: "1px solid var(--accent)",
                          color: "var(--accent)",
                        }),
                  }}
                >
                  Button
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mini gallery layout preview                                         */
/* ------------------------------------------------------------------ */

/** Schematic preview of the gallery layout settings (columns, gap, shape). */
function GalleryMiniPreview({ layout }: { layout: LayoutSettings }) {
  const cols = layout.galleryColumns ?? 3;
  const gap = { tight: 3, normal: 6, airy: 12 }[layout.galleryGap ?? "normal"];
  const isMasonry = layout.galleryLayout === "masonry";
  const aspect = {
    square: "1 / 1",
    portrait: "3 / 4",
    landscape: "4 / 3",
  }[layout.galleryAspect ?? "square"];

  // Varied heights to suggest masonry flow.
  const masonryHeights = [42, 64, 50, 70, 46, 58, 66, 44, 54, 60, 48, 62];
  const tiles = cols * 3;

  if (isMasonry) {
    return (
      <div className="flex" style={{ gap }}>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="flex flex-1 flex-col" style={{ gap }}>
            {Array.from({ length: 3 }).map((_, r) => (
              <div
                key={r}
                className="rounded-sm bg-zinc-700/70"
                style={{ height: masonryHeights[(c * 3 + r) % masonryHeights.length] }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}
    >
      {Array.from({ length: tiles }).map((_, i) => (
        <div
          key={i}
          className="rounded-sm bg-zinc-700/70"
          style={{ aspectRatio: aspect }}
        />
      ))}
    </div>
  );
}
