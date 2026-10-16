import { useEffect, useState } from "react";
import {
  type Brand,
  type Contrast,
  type DarkStyle,
  defaultPalette,
  type PaletteInput,
  paletteCss,
  type Tone,
} from "@/palette";

export type Mode = "light" | "dark" | "system";

export type BrandPreset = Brand & { id: string; label: string };

export const customBrand = "custom";

/** Parses #rgb or #rrggbb. Returns undefined for anything else. */
export function parseHex(value: string): string | undefined {
  const match = value.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return undefined;
  const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join("") : match[1];
  return `#${digits.toLowerCase()}`;
}

/** Converts a hex colour to OKLCH, the colour space the theme uses. */
export function hexToBrand(hex: string): Brand {
  const linear = [1, 3, 5].map((i) => {
    const channel = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const [r, g, b] = linear;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const hue = ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360;
  return {
    chroma: Number(Math.hypot(a, bAxis).toFixed(4)),
    hue: Number(hue.toFixed(1)),
    lightness: Number(lightness.toFixed(4)),
  };
}

/** Brand colours, each tuned so white text on buttons passes WCAG AA. */
export const brandPresets: BrandPreset[] = [
  { ...defaultPalette.brand, id: "cobalt", label: "Cobalt" },
  { chroma: 0.2378, hue: 292.5, id: "violet", label: "Violet", lightness: 0.56 },
  { chroma: 0.15, hue: 162, id: "emerald", label: "Emerald", lightness: 0.5 },
  { chroma: 0.19, hue: 45, id: "ember", label: "Ember", lightness: 0.56 },
  { chroma: 0.21, hue: 12, id: "rose", label: "Rose", lightness: 0.56 },
  { chroma: 0.02, hue: 260, id: "graphite", label: "Graphite", lightness: 0.56 },
];

export const radiusOptions = [
  { label: "None", value: "0rem" },
  { label: "Small", value: "0.375rem" },
  { label: "Medium", value: "0.625rem" },
  { label: "Large", value: "0.875rem" },
  { label: "Round", value: "1.25rem" },
];

export type MotionPreset = "off" | "snappy" | "smooth" | "springy";

export const motionPresets: { label: string; value: MotionPreset }[] = [
  { label: "Off", value: "off" },
  { label: "Snappy", value: "snappy" },
  { label: "Smooth", value: "smooth" },
  { label: "Springy", value: "springy" },
];

export type ControlStyle = "outlined" | "filled";

export const controlStyles: { label: string; value: ControlStyle }[] = [
  { label: "Outlined", value: "outlined" },
  { label: "Filled", value: "filled" },
];

export type Shadows = "on" | "off";

export const shadowOptions: { label: string; value: Shadows }[] = [
  { label: "On", value: "on" },
  { label: "Off", value: "off" },
];

export type Font = { label: string; value: string; family: string };

/** Google Fonts, loaded through Fontsource. The package is @fontsource-variable/<value>. */
export const fonts: Font[] = [
  { family: "TikTok Sans Variable", label: "TikTok Sans", value: "tiktok-sans" },
  { family: "Inter Variable", label: "Inter", value: "inter" },
  { family: "Geist Variable", label: "Geist", value: "geist" },
  { family: "DM Sans Variable", label: "DM Sans", value: "dm-sans" },
  { family: "Plus Jakarta Sans Variable", label: "Plus Jakarta Sans", value: "plus-jakarta-sans" },
  { family: "Manrope Variable", label: "Manrope", value: "manrope" },
  { family: "Figtree Variable", label: "Figtree", value: "figtree" },
  { family: "Onest Variable", label: "Onest", value: "onest" },
  { family: "Space Grotesk Variable", label: "Space Grotesk", value: "space-grotesk" },
  { family: "Bricolage Grotesque Variable", label: "Bricolage Grotesque", value: "bricolage-grotesque" },
];

export const sameAsBody = "body";

export const headingFonts = [{ label: "Same as body", value: sameAsBody }, ...fonts];

export function fontFor(value: string): Font {
  return fonts.find((font) => font.value === value) ?? fonts[0];
}

function stack(font: Font): string {
  return `'${font.family}', ui-sans-serif, system-ui, sans-serif`;
}

/** Everything that makes up a theme. Light or dark viewing mode is separate. */
export type Theme = {
  brand: string;
  colourOpacity: number;
  customHex: string;
  brandTextMode: "auto" | "manual";
  brandTextHex: string;
  tone: Tone;
  darkStyle: DarkStyle;
  contrast: Contrast;
  radius: string;
  controls: ControlStyle;
  shadows: Shadows;
  font: string;
  heading: string;
  motion: MotionPreset;
};

export type ThemeSettings = Theme & { mode: Mode };

const projectTheme: Theme = {
  brand: "cobalt",
  brandTextMode: "auto",
  brandTextHex: "#ffffff",
  colourOpacity: 90,
  contrast: defaultPalette.contrast,
  controls: "outlined",
  customHex: "#ff5a1f",
  darkStyle: defaultPalette.darkStyle,
  font: "tiktok-sans",
  heading: sameAsBody,
  motion: "snappy",
  radius: "0.625rem",
  shadows: "on",
  tone: defaultPalette.tone,
};

export type NamedTheme = { id: string; label: string; description: string; theme: Theme };

export const themePresets: NamedTheme[] = [
  {
    description: "Cobalt, cool greys, and a crisp feel. The default.",
    id: "project",
    label: "Project",
    theme: projectTheme,
  },
  {
    description: "Warm paper tones, rounded corners, and calm motion.",
    id: "paper",
    label: "Paper",
    theme: {
      ...projectTheme,
      brand: "ember",
      font: "figtree",
      heading: "bricolage-grotesque",
      motion: "smooth",
      radius: "0.875rem",
      tone: "warm",
    },
  },
  {
    description: "Violet on true black, strong contrast, and filled controls.",
    id: "midnight",
    label: "Midnight",
    theme: {
      ...projectTheme,
      brand: "violet",
      contrast: "crisp",
      controls: "filled",
      darkStyle: "black",
      font: "geist",
    },
  },
  {
    description: "Green-tinted surfaces, soft shapes, and smooth motion.",
    id: "forest",
    label: "Forest",
    theme: {
      ...projectTheme,
      brand: "emerald",
      darkStyle: "deep",
      font: "manrope",
      motion: "smooth",
      radius: "1.25rem",
      tone: "brand",
    },
  },
  {
    description: "Greyscale, sharp corners, no shadows, and no motion.",
    id: "mono",
    label: "Mono",
    theme: {
      ...projectTheme,
      brand: "graphite",
      contrast: "crisp",
      darkStyle: "black",
      font: "inter",
      heading: "space-grotesk",
      motion: "off",
      radius: "0.375rem",
      shadows: "off",
      tone: "neutral",
    },
  },
  {
    description: "Rose-tinted, round, and bouncy.",
    id: "candy",
    label: "Candy",
    theme: {
      ...projectTheme,
      brand: "rose",
      font: "onest",
      heading: "bricolage-grotesque",
      motion: "springy",
      radius: "1.25rem",
      tone: "brand",
    },
  },
];

const defaults: ThemeSettings = { ...projectTheme, mode: "system" };

const storageKey = "project-ui-theme";
const savedKey = "project-ui-saved-themes";

function read<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function themeOf({ mode: _mode, ...theme }: ThemeSettings): Theme {
  return theme;
}

const sameTheme = (a: Theme, b: Theme) =>
  (Object.keys(projectTheme) as (keyof Theme)[]).every(
    (key) => {
      if (key === "customHex" && a.brand !== customBrand) return true;
      if (key === "brandTextHex" && a.brandTextMode !== "manual") return true;
      return a[key] === b[key];
    },
  );

export function brandFor(theme: Theme): Brand {
  if (theme.brand === customBrand) return hexToBrand(theme.customHex);
  return brandPresets.find(({ id }) => id === theme.brand) ?? brandPresets[0];
}

export function paletteFor(theme: Theme): PaletteInput {
  return {
    brand: brandFor(theme),
    brandForeground: theme.brandTextMode === "manual" ? hexToBrand(theme.brandTextHex) : undefined,
    contrast: theme.contrast,
    darkStyle: theme.darkStyle,
    tone: theme.tone,
  };
}

function fontTokens(theme: Theme): Record<string, string> {
  const tokens: Record<string, string> = {
    "--button-opacity": `${theme.colourOpacity}%`,
    "--font-body": stack(fontFor(theme.font)),
    "--radius": theme.radius,
  };
  tokens["--font-display"] =
    theme.heading === sameAsBody ? "var(--font-body)" : stack(fontFor(theme.heading));
  return tokens;
}

/** Attributes on <html> that switch on the motion, control, and shadow styles. */
export function htmlAttributes(theme: Theme): Record<string, string> {
  const attributes: Record<string, string> = {};
  if (theme.motion !== "snappy") attributes["data-motion"] = theme.motion;
  if (theme.controls !== "outlined") attributes["data-controls"] = theme.controls;
  if (theme.shadows !== "on") attributes["data-shadows"] = theme.shadows;
  return attributes;
}

/** The full CSS for a theme: font imports, light and dark tokens, and motion. */
export function themeCss(theme: Theme): string {
  const body = fontFor(theme.font);
  const heading = theme.heading === sameAsBody ? undefined : fontFor(theme.heading);
  const imports = [...new Set([body, heading])]
    .filter((font): font is Font => font !== undefined && font.value !== fonts[0].value)
    .map((font) => `@import "@fontsource-variable/${font.value}";\n`)
    .join("");
  const attributes = Object.entries(htmlAttributes(theme))
    .map(([name, value]) => `${name}="${value}"`)
    .join(" ");
  const note = attributes ? `\n/* Add ${attributes} to the <html> element. */\n` : "";
  return `${imports}${imports ? "\n" : ""}${paletteCss(paletteFor(theme), fontTokens(theme))}${note}`;
}

/**
 * Applies a theme change with transitions off, so colours snap instead of every
 * element animating at once. The reflow commits the new colours while the
 * override still applies; it is removed after the next paint.
 */
function withoutTransitions(change: () => void) {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none !important}";
  document.head.append(style);
  change();
  void document.body.offsetHeight;
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
}

export function useThemeSettings() {
  const [settings, setSettings] = useState<ThemeSettings>(() => ({
    ...defaults,
    ...read<Partial<ThemeSettings>>(storageKey, {}),
  }));
  const [saved, setSaved] = useState<NamedTheme[]>(() =>
    read<NamedTheme[]>(savedKey, []).map((entry) => ({
      ...entry,
      theme: { ...projectTheme, ...entry.theme },
    })),
  );

  useEffect(() => {
    const theme = themeOf(settings);
    let style = document.getElementById("project-ui-theme");
    if (!style) {
      style = document.createElement("style");
      style.id = "project-ui-theme";
      document.head.append(style);
    }
    const css = paletteCss(paletteFor(theme), fontTokens(theme));
    if (style.textContent !== css) withoutTransitions(() => (style.textContent = css));
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(savedKey, JSON.stringify(saved));
  }, [saved]);

  const { controls, motion, shadows } = settings;
  useEffect(() => {
    const root = document.documentElement;
    const attributes = htmlAttributes({ ...projectTheme, controls, motion, shadows });
    for (const name of ["data-motion", "data-controls", "data-shadows"]) {
      if (attributes[name]) root.setAttribute(name, attributes[name]);
      else root.removeAttribute(name);
    }
  }, [controls, motion, shadows]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = settings.mode === "dark" || (settings.mode === "system" && query.matches);
      const root = document.documentElement;
      const change = () => {
        root.classList.toggle("dark", dark);
        root.style.colorScheme = dark ? "dark" : "light";
      };
      if (root.classList.contains("dark") === dark) change();
      else withoutTransitions(change);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [settings.mode]);

  const update = (patch: Partial<ThemeSettings>) =>
    setSettings((current) => ({ ...current, ...patch }));

  const current = themeOf(settings);
  const active = [...themePresets, ...saved].find(({ theme }) => sameTheme(theme, current));

  return {
    active,
    apply: (theme: Theme) => update(theme),
    deleteSaved: (id: string) => setSaved((list) => list.filter((item) => item.id !== id)),
    reset: () => setSettings((current) => ({ ...current, ...projectTheme })),
    save: (label: string) => {
      const entry: NamedTheme = {
        description: "Saved theme",
        id: `saved-${Date.now()}`,
        label,
        theme: current,
      };
      setSaved((list) => [...list, entry]);
      return entry;
    },
    saved,
    settings,
    update,
  };
}

export type ThemeController = ReturnType<typeof useThemeSettings>;
