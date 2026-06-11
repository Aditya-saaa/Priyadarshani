import { getPreset, SPACING_MAP, SPEED_MAP, type Palette } from "./themes";
import type { ThemeSettings } from "./types";

function vars(p: Palette, t: ThemeSettings): string {
  const accent = t.overrides.accent || p.accent;
  const background = t.overrides.background || p.background;
  const surface = t.overrides.surface || p.surface;
  const text = t.overrides.text || p.text;
  return [
    `--bg:${background}`,
    `--surface:${surface}`,
    `--surface-2:${p.surfaceElevated}`,
    `--text:${text}`,
    `--muted:${p.muted}`,
    `--accent:${accent}`,
    `--accent-contrast:${p.accentContrast}`,
    `--border:${p.border}`,
    `--radius:${t.radius}px`,
    `--speed:${SPEED_MAP[t.animationSpeed]}`,
    `--section-gap:${SPACING_MAP[t.sectionSpacing]}`,
    `--font-display:${t.typography === "serif" ? "var(--font-playfair)" : "var(--font-inter)"}`,
  ].join(";");
}

/** Builds the CSS string with theme custom properties for the active theme. */
export function buildThemeCss(theme: ThemeSettings): string {
  const preset = getPreset(theme.preset);
  if (theme.mode === "auto") {
    return `:root{${vars(preset.light, theme)}}@media (prefers-color-scheme: dark){:root{${vars(preset.dark, theme)}}}`;
  }
  const palette = theme.mode === "dark" ? preset.dark : preset.light;
  return `:root{${vars(palette, theme)}}`;
}
