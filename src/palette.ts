/**
 * Project UI palette generator.
 *
 * Builds every colour token for light and dark mode from a few inputs: the
 * brand colour, a tone for the greys, a dark-mode style, and a contrast level.
 * The showcase applies its output live, and scripts/sync-theme.ts writes the
 * default palette into src/index.css, so this file is the source of truth.
 */

export type Tone = "neutral" | "cool" | "warm" | "brand";
export type DarkStyle = "dim" | "deep" | "black";
export type Contrast = "soft" | "crisp";

export type Brand = { lightness: number; hue: number; chroma: number };

export type PaletteInput = {
  brand: Brand;
  tone: Tone;
  darkStyle: DarkStyle;
  contrast: Contrast;
};

export const tones: { label: string; value: Tone }[] = [
  { label: "Neutral", value: "neutral" },
  { label: "Cool", value: "cool" },
  { label: "Warm", value: "warm" },
  { label: "Brand", value: "brand" },
];

export const darkStyles: { label: string; value: DarkStyle }[] = [
  { label: "Dim", value: "dim" },
  { label: "Deep", value: "deep" },
  { label: "Black", value: "black" },
];

export const contrasts: { label: string; value: Contrast }[] = [
  { label: "Soft", value: "soft" },
  { label: "Crisp", value: "crisp" },
];

type Oklch = { l: number; c: number; h: number; alpha?: number };

/** Hue, how much tint surfaces and text get, and the light-mode page lightness. */
function toneFor(tone: Tone, brand: Brand) {
  switch (tone) {
    case "neutral":
      return { hue: 0, page: 1, surface: 0, text: 0 };
    case "cool":
      return { hue: 229, page: 1, surface: 0.003, text: 0.0065 };
    case "warm":
      return { hue: 75, page: 0.985, surface: 0.008, text: 0.01 };
    case "brand":
      return { hue: brand.hue, page: 0.99, surface: 0.012, text: 0.016 };
  }
}

/** Dark-mode lightness for each surface. */
const darkSurfaces: Record<DarkStyle, Record<string, number>> = {
  dim: { page: 0.1822, card: 0.205, sidebar: 0.2247, secondary: 0.2766, muted: 0.269, sidebarAccent: 0.3317 },
  deep: { page: 0.145, card: 0.178, sidebar: 0.165, secondary: 0.25, muted: 0.24, sidebarAccent: 0.3 },
  black: { page: 0, card: 0.155, sidebar: 0.1, secondary: 0.23, muted: 0.22, sidebarAccent: 0.28 },
};

/** WCAG AA for normal text. */
export const minimumContrast = 4.5;

const white: Oklch = { c: 0, h: 0, l: 1 };
const darkText: Oklch = { c: 0, h: 0, l: 0.2 };

const round = (value: number, digits = 4) => Number(value.toFixed(digits));

function format({ l, c, h, alpha }: Oklch): string {
  const base = `${round(l)} ${round(c)} ${round(h, 2)}`;
  return alpha === undefined ? `oklch(${base})` : `oklch(${base} / ${round(alpha * 100, 1)}%)`;
}

/* Colour maths for contrast checks: OKLCH to sRGB, then WCAG luminance. */

function toLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  return [
    clamp(4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp),
    clamp(-1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp),
    clamp(-0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp),
  ];
}

const encode = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
const decode = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

/** Luminance of a colour, blending any transparency over its background. */
function luminance(colour: Oklch, background?: Oklch): number {
  let rgb = toLinearSrgb(colour);
  if (colour.alpha !== undefined && background) {
    const under = toLinearSrgb(background);
    const a = colour.alpha;
    rgb = rgb.map((v, i) => decode(encode(v) * a + encode(under[i]) * (1 - a))) as typeof rgb;
  }
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

export function contrastRatio(text: Oklch, background: Oklch): number {
  const a = luminance(text, background);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** White or near-black, whichever reads better on the colour. */
function textOn(colour: Oklch): Oklch {
  return contrastRatio(white, colour) >= contrastRatio(darkText, colour) ? white : darkText;
}

/** Steps a text colour's lightness until it reads on the background. */
function readable(text: Oklch, background: Oklch, step: number): Oklch {
  let colour = text;
  while (contrastRatio(colour, background) < minimumContrast && colour.l > 0 && colour.l < 1) {
    colour = { ...colour, l: round(colour.l + step, 3) };
  }
  return colour;
}

type Mode = { tokens: Record<string, string>; values: Record<string, Oklch> };

function lightMode({ brand, tone, contrast }: PaletteInput): Mode {
  const t = toneFor(tone, brand);
  const crisp = contrast === "crisp";
  const surface = (l: number): Oklch => ({ c: t.surface, h: t.hue, l: Math.min(1, l) });
  const text = (l: number): Oklch => ({ c: t.text, h: t.hue, l });
  const line = (alpha: number): Oklch => ({ alpha, c: t.text, h: t.hue, l: 0.2 });

  const page = t.page;
  const brandColour: Oklch = { c: brand.chroma, h: brand.hue, l: brand.lightness };
  const values: Record<string, Oklch> = {
    background: surface(page),
    card: surface(page + 0.01),
    foreground: text(crisp ? 0.24 : 0.3376),
    secondary: surface(page - 0.045),
    muted: surface(page - 0.03),
    "muted-foreground": text(crisp ? 0.46 : 0.53),
    accent: line(crisp ? 0.06 : 0.04),
    "accent-foreground": text(crisp ? 0.2 : 0.28),
    border: line(crisp ? 0.14 : 0.08),
    input: line(crisp ? 0.18 : 0.1),
    sidebar: surface(page - 0.018),
    "sidebar-foreground": text(crisp ? 0.38 : 0.52),
    "sidebar-accent": surface(page - 0.048),
    "sidebar-border": line(crisp ? 0.1 : 0.06),
    "raised-2": surface(page - 0.033),
    "raised-3": surface(page - 0.051),
    "raised-stroke": surface(page - 0.145),
    brand: brandColour,
    "brand-foreground": textOn(brandColour),
    "brand-soft": { c: brand.chroma * 0.139, h: brand.hue, l: 0.9337 },
    "destructive-foreground": { c: 0.2235, h: 28.32, l: 0.52 },
  };
  values["brand-soft-foreground"] = readable(
    { c: brand.chroma * 0.889, h: brand.hue, l: 0.5 },
    values["brand-soft"],
    -0.01,
  );

  const tokens: Record<string, string> = {
    "--brand-l": String(brand.lightness),
    "--brand-h": String(brand.hue),
    "--brand-c": String(brand.chroma),
    "--brand": "oklch(var(--brand-l) var(--brand-c) var(--brand-h))",
    "--brand-foreground": format(values["brand-foreground"]),
    "--brand-soft": "oklch(0.9337 calc(var(--brand-c) * 0.139) var(--brand-h))",
    "--brand-soft-foreground": `oklch(${values["brand-soft-foreground"].l} calc(var(--brand-c) * 0.889) var(--brand-h))`,
    "--magic": "oklch(0.5946 0.2378 292.5)",
    "--pro": "oklch(0.5946 0.2378 292.5)",
    "--pro-background": "oklch(0.8911 0.0517 300.15)",
    "--highlight": "oklch(0.852 0.199 91.936)",

    "--raised-1": format(values.card),
    "--raised-2": format(values["raised-2"]),
    "--raised-3": format(values["raised-3"]),
    "--raised-stroke": format(values["raised-stroke"]),
    "--raised-shadow-1": "rgb(189 189 189 / 0.2)",
    "--raised-shadow-2": "rgb(223 223 223 / 0.1)",
    "--raised-edge": "rgb(255 255 255 / 0.5)",

    "--background": format(values.background),
    "--foreground": format(values.foreground),
    "--card": format(values.card),
    "--card-foreground": "var(--foreground)",
    "--popover": format(values.card),
    "--popover-foreground": "var(--foreground)",
    "--primary": "var(--brand)",
    "--primary-foreground": "var(--brand-foreground)",
    "--secondary": format(values.secondary),
    "--secondary-foreground": "var(--foreground)",
    "--muted": format(values.muted),
    "--muted-foreground": format(values["muted-foreground"]),
    "--accent": format(values.accent),
    "--accent-foreground": format(values["accent-foreground"]),
    "--border": format(values.border),
    "--input": format(values.input),
    "--ring": "color-mix(in oklab, var(--brand) 64%, transparent)",
    "--destructive": "oklch(0.5788 0.2215 27.8)",
    "--destructive-foreground": format(values["destructive-foreground"]),
    "--info": "var(--brand)",
    "--info-foreground": "var(--brand-soft-foreground)",
    "--success": "oklch(0.696 0.17 162.48)",
    "--success-foreground": "oklch(0.508 0.118 165.612)",
    "--warning": "oklch(0.769 0.188 70.08)",
    "--warning-foreground": "oklch(0.555 0.163 48.998)",
    "--chart-1": "var(--brand)",
    "--chart-2": "oklch(0.6 0.118 184.704)",
    "--chart-3": "var(--magic)",
    "--chart-4": "oklch(0.828 0.189 84.429)",
    "--chart-5": "oklch(0.645 0.246 16.439)",
    "--code": format(values.sidebar),
    "--code-foreground": "var(--foreground)",
    "--code-highlight": format(values.accent),
    "--sidebar": format(values.sidebar),
    "--sidebar-foreground": format(values["sidebar-foreground"]),
    "--sidebar-primary": "var(--brand)",
    "--sidebar-primary-foreground": "var(--brand-foreground)",
    "--sidebar-accent": format(values["sidebar-accent"]),
    "--sidebar-accent-foreground": "var(--foreground)",
    "--sidebar-border": format(values["sidebar-border"]),
    "--sidebar-ring": "var(--ring)",
  };

  return { tokens, values };
}

function darkMode({ brand, tone, darkStyle, contrast }: PaletteInput): Mode {
  const t = toneFor(tone, brand);
  const d = darkSurfaces[darkStyle];
  const crisp = contrast === "crisp";
  const surface = (l: number): Oklch => ({ c: l === 0 ? 0 : t.surface, h: t.hue, l: Math.max(0, l) });
  const text = (l: number): Oklch => ({ c: t.text, h: t.hue, l });
  const line = (alpha: number): Oklch => ({ alpha, c: t.text, h: t.hue, l: 0.98 });

  const brandColour: Oklch = { c: brand.chroma, h: brand.hue, l: brand.lightness };
  const values: Record<string, Oklch> = {
    background: surface(d.page),
    card: surface(d.card),
    foreground: text(crisp ? 0.96 : 0.9006),
    secondary: surface(d.secondary),
    muted: surface(d.muted),
    "muted-foreground": text(crisp ? 0.79 : 0.708),
    accent: line(crisp ? 0.09 : 0.06),
    "accent-foreground": text(0.96),
    border: line(crisp ? 0.16 : 0.1),
    input: line(crisp ? 0.22 : 0.15),
    sidebar: surface(d.sidebar),
    "sidebar-foreground": text(crisp ? 0.84 : 0.74),
    "sidebar-accent": surface(d.sidebarAccent),
    "sidebar-border": line(crisp ? 0.1 : 0.06),
    "raised-1": surface(d.card + 0.03),
    "raised-2": surface(d.page + 0.002),
    "raised-3": surface(d.page + 0.009),
    "raised-stroke": surface(d.page - 0.03),
    brand: brandColour,
    "brand-foreground": textOn(brandColour),
    "brand-soft": { c: brand.chroma * 0.357, h: brand.hue, l: 0.3241 },
    "destructive-foreground": { c: 0.191, h: 22.216, l: 0.704 },
  };
  values["brand-soft-foreground"] = readable(
    { c: brand.chroma * 0.337, h: brand.hue, l: 0.8389 },
    values["brand-soft"],
    0.01,
  );

  const tokens: Record<string, string> = {
    "--brand": "oklch(var(--brand-l) var(--brand-c) var(--brand-h))",
    "--brand-foreground": format(values["brand-foreground"]),
    "--brand-soft": "oklch(0.3241 calc(var(--brand-c) * 0.357) var(--brand-h))",
    "--brand-soft-foreground": `oklch(${values["brand-soft-foreground"].l} calc(var(--brand-c) * 0.337) var(--brand-h))`,
    "--magic": "oklch(0.7 0.18 292.5)",
    "--pro": "oklch(0.78 0.13 292.5)",
    "--pro-background": "oklch(0.3 0.08 292.5)",

    "--raised-1": format(values["raised-1"]),
    "--raised-2": format(values["raised-2"]),
    "--raised-3": format(values["raised-3"]),
    "--raised-stroke": format(values["raised-stroke"]),
    "--raised-shadow-1": "rgb(0 0 0 / 0.2)",
    "--raised-shadow-2": "rgb(0 0 0 / 0.1)",
    "--raised-edge": "rgb(255 255 255 / 0.1)",

    "--background": format(values.background),
    "--foreground": format(values.foreground),
    "--card": format(values.card),
    "--popover": format(values.card),
    "--secondary": format(values.secondary),
    "--secondary-foreground": "var(--foreground)",
    "--muted": format(values.muted),
    "--muted-foreground": format(values["muted-foreground"]),
    "--accent": format(values.accent),
    "--accent-foreground": format(values["accent-foreground"]),
    "--border": format(values.border),
    "--input": format(values.input),
    "--destructive": "oklch(0.57 0.1977 28.18)",
    "--destructive-foreground": format(values["destructive-foreground"]),
    "--success-foreground": "oklch(0.765 0.177 163.223)",
    "--warning-foreground": "oklch(0.828 0.189 84.429)",
    "--chart-2": "oklch(0.696 0.17 162.48)",
    "--chart-4": "oklch(0.769 0.188 70.08)",
    "--code": format(values.sidebar),
    "--code-highlight": format(values.accent),
    "--sidebar": format(values.sidebar),
    "--sidebar-foreground": format(values["sidebar-foreground"]),
    "--sidebar-accent": format(values["sidebar-accent"]),
    "--sidebar-border": format(values["sidebar-border"]),
  };

  return { tokens, values };
}

export function generatePalette(input: PaletteInput) {
  return { dark: darkMode(input), light: lightMode(input) };
}

export function paletteCss(input: PaletteInput, extraRootTokens: Record<string, string> = {}): string {
  const { dark, light } = generatePalette(input);
  const block = (selector: string, tokens: Record<string, string>) =>
    `${selector} {\n${Object.entries(tokens)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join("\n")}\n}\n`;
  return block(":root", { ...extraRootTokens, ...light.tokens }) + block(".dark", dark.tokens);
}

/** Text and background pairs people read, checked against WCAG AA (4.5:1). */
const readablePairs: { label: string; text: string; background: string }[] = [
  { background: "background", label: "Body text", text: "foreground" },
  { background: "card", label: "Text on cards", text: "foreground" },
  { background: "background", label: "Muted text", text: "muted-foreground" },
  { background: "muted", label: "Muted text on muted surfaces", text: "muted-foreground" },
  { background: "secondary", label: "Secondary buttons", text: "foreground" },
  { background: "sidebar", label: "Sidebar text", text: "sidebar-foreground" },
  { background: "brand", label: "Primary buttons", text: "brand-foreground" },
  { background: "brand-soft", label: "Soft brand badges", text: "brand-soft-foreground" },
  { background: "background", label: "Error text", text: "destructive-foreground" },
];

export type ContrastRow = { label: string; light: number; dark: number };

export function contrastReport(input: PaletteInput): ContrastRow[] {
  const { dark, light } = generatePalette(input);
  const ratio = (mode: Mode, text: string, background: string) =>
    round(contrastRatio(mode.values[text], mode.values[background]), 2);
  return readablePairs.map(({ background, label, text }) => ({
    dark: ratio(dark, text, background),
    label,
    light: ratio(light, text, background),
  }));
}

/** The kit's default look: cobalt, cool greys, dim dark mode, soft contrast. */
export const defaultPalette: PaletteInput = {
  brand: { chroma: 0.2293, hue: 260.2, lightness: 0.56 },
  contrast: "soft",
  darkStyle: "dim",
  tone: "cool",
};
