/**
 * Premium theme presets. Each preset provides a dark and a light palette;
 * the active mode (light / dark / auto) decides which palette is rendered.
 */

export type Palette = {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  muted: string;
  accent: string;
  accentContrast: string;
  border: string;
};

export type ThemePreset = {
  id: string;
  name: string;
  dark: Palette;
  light: Palette;
};

const p = (
  background: string,
  surface: string,
  surfaceElevated: string,
  text: string,
  muted: string,
  accent: string,
  accentContrast: string,
  border: string
): Palette => ({
  background,
  surface,
  surfaceElevated,
  text,
  muted,
  accent,
  accentContrast,
  border,
});

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "obsidian-gold",
    name: "Obsidian Black + Gold",
    dark: p("#0a0a0b", "#121214", "#1a1a1d", "#f5f2ea", "#a39e92", "#c9a96a", "#0a0a0b", "#26241f"),
    light: p("#faf8f4", "#ffffff", "#ffffff", "#17150f", "#6e675a", "#a8843c", "#ffffff", "#e8e2d4"),
  },
  {
    id: "platinum",
    name: "White + Platinum",
    dark: p("#101113", "#17181b", "#1f2024", "#f2f3f5", "#9aa0a8", "#c8ccd4", "#101113", "#26282d"),
    light: p("#fbfbfc", "#ffffff", "#ffffff", "#16181c", "#6b7077", "#8d939e", "#ffffff", "#e6e8ec"),
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    dark: p("#060b16", "#0c1322", "#121b2e", "#eef2f9", "#8e9ab0", "#7fa6d9", "#060b16", "#1b2538"),
    light: p("#f6f8fc", "#ffffff", "#ffffff", "#0e1626", "#5c6a82", "#2c5e9e", "#ffffff", "#dfe6f0"),
  },
  {
    id: "emerald",
    name: "Emerald",
    dark: p("#06100c", "#0b1812", "#102019", "#edf6f1", "#8fa79b", "#5fbf8f", "#06100c", "#1b2c24"),
    light: p("#f5faf7", "#ffffff", "#ffffff", "#0d1a14", "#5c7065", "#1d7a4f", "#ffffff", "#dcebe2"),
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    dark: p("#0d0a14", "#15101f", "#1d172b", "#f3effa", "#a299b3", "#b08ae0", "#0d0a14", "#272034"),
    light: p("#f9f7fc", "#ffffff", "#ffffff", "#171024", "#695f7a", "#6c3fb0", "#ffffff", "#e8e1f1"),
  },
  {
    id: "burgundy",
    name: "Burgundy",
    dark: p("#120709", "#1b0d10", "#241317", "#f8eff1", "#b09499", "#d08a96", "#120709", "#321d22"),
    light: p("#fcf7f8", "#ffffff", "#ffffff", "#1f0c10", "#7d6166", "#8c2438", "#ffffff", "#f0dee1"),
  },
  {
    id: "mocha",
    name: "Mocha",
    dark: p("#100c09", "#181210", "#211a16", "#f6f0e9", "#ab9f91", "#c49a6c", "#100c09", "#2c241d"),
    light: p("#faf6f1", "#ffffff", "#ffffff", "#1c140d", "#75685a", "#8a5a2b", "#ffffff", "#ece2d4"),
  },
  {
    id: "sunset",
    name: "Sunset",
    dark: p("#120b10", "#1b1016", "#251620", "#faf0ee", "#b39a9b", "#e8946a", "#120b10", "#32202a"),
    light: p("#fdf8f5", "#ffffff", "#ffffff", "#22100e", "#7d6360", "#c2552b", "#ffffff", "#f2e1d8"),
  },
];

export function getPreset(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) ?? THEME_PRESETS[0];
}

export const SPEED_MAP = { slow: "1.1s", normal: "0.7s", fast: "0.4s" } as const;
export const SPACING_MAP = {
  compact: "4.5rem",
  normal: "7rem",
  spacious: "10rem",
} as const;
