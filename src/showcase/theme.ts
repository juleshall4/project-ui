import { useEffect, useState } from "react";

export type Mode = "light" | "dark" | "system";

export type BrandPreset = {
  id: string;
  label: string;
  hue: number;
  chroma: number;
};

export const customBrand = "custom";
const defaultLightness = 0.5792;

export type Brand = { lightness: number; hue: number; chroma: number };

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

/** Light brand colours need dark text on top to stay readable. */
export function needsDarkText(brand: Brand): boolean {
  return brand.lightness > 0.72;
}

const darkText = "oklch(0.2 0 0)";

export const brandPresets: BrandPreset[] = [
  { chroma: 0.2293, hue: 260.2, id: "cobalt", label: "Cobalt" },
  { chroma: 0.2378, hue: 292.5, id: "violet", label: "Violet" },
  { chroma: 0.16, hue: 162, id: "emerald", label: "Emerald" },
  { chroma: 0.19, hue: 45, id: "ember", label: "Ember" },
  { chroma: 0.21, hue: 12, id: "rose", label: "Rose" },
  { chroma: 0.02, hue: 260, id: "graphite", label: "Graphite" },
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

export type ThemeSettings = {
  mode: Mode;
  brand: string;
  radius: string;
  font: string;
  heading: string;
  motion: MotionPreset;
  customHex: string;
};

const defaults: ThemeSettings = {
  brand: "cobalt",
  font: "tiktok-sans",
  heading: sameAsBody,
  motion: "snappy",
  customHex: "#ff5a1f",
  mode: "system",
  radius: "0.625rem",
};

const storageKey = "project-ui-theme";

function readSettings(): ThemeSettings {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  } catch {
    return defaults;
  }
}

export function brandFor(settings: ThemeSettings): Brand {
  if (settings.brand === customBrand) return hexToBrand(settings.customHex);
  const preset = brandPresets.find(({ id }) => id === settings.brand) ?? brandPresets[0];
  return { chroma: preset.chroma, hue: preset.hue, lightness: defaultLightness };
}

/** Returns the CSS for the current settings, including any extra font imports. */
export function themeCss(settings: ThemeSettings): string {
  const brand = brandFor(settings);
  const body = fontFor(settings.font);
  const heading = settings.heading === sameAsBody ? undefined : fontFor(settings.heading);
  const imports = [...new Set([body, heading])]
    .filter((font): font is Font => font !== undefined && font.value !== fonts[0].value)
    .map((font) => `@import "@fontsource-variable/${font.value}";\n`)
    .join("");
  const lines = [
    `  --brand-l: ${brand.lightness};`,
    `  --brand-h: ${brand.hue};`,
    `  --brand-c: ${brand.chroma};`,
    `  --radius: ${settings.radius};`,
    `  --font-body: ${stack(body)};`,
  ];
  if (needsDarkText(brand)) lines.push(`  --brand-foreground: ${darkText};`);
  if (heading) lines.push(`  --font-display: ${stack(heading)};`);
  const motion =
    settings.motion === "snappy"
      ? ""
      : `\n/* Motion: add data-motion="${settings.motion}" to the <html> element. */\n`;
  return `${imports}${imports ? "\n" : ""}:root {\n${lines.join("\n")}\n}\n${motion}`;
}

export function useThemeSettings() {
  const [settings, setSettings] = useState<ThemeSettings>(readSettings);

  useEffect(() => {
    const root = document.documentElement;
    const brand = brandFor(settings);
    root.style.setProperty("--brand-l", String(brand.lightness));
    root.style.setProperty("--brand-h", String(brand.hue));
    root.style.setProperty("--brand-c", String(brand.chroma));
    root.style.setProperty("--radius", settings.radius);
    if (needsDarkText(brand)) {
      root.style.setProperty("--brand-foreground", darkText);
    } else {
      root.style.removeProperty("--brand-foreground");
    }
    root.style.setProperty("--font-body", stack(fontFor(settings.font)));
    if (settings.heading === sameAsBody) {
      root.style.removeProperty("--font-display");
    } else {
      root.style.setProperty("--font-display", stack(fontFor(settings.heading)));
    }
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (settings.motion === "snappy") {
      delete document.documentElement.dataset.motion;
    } else {
      document.documentElement.dataset.motion = settings.motion;
    }
  }, [settings.motion]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark =
        settings.mode === "dark" || (settings.mode === "system" && query.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [settings.mode]);

  const update = (patch: Partial<ThemeSettings>) =>
    setSettings((current) => ({ ...current, ...patch }));

  return { reset: () => setSettings(defaults), settings, update };
}
