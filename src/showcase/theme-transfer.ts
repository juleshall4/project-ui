import { z } from "zod";
import {
  brandPresets,
  controlStyles,
  customBrand,
  fonts,
  headingFonts,
  motionPresets,
  radiusOptions,
  shadowOptions,
  themeCss,
  type Theme,
} from "./theme";

const themeSchema = z.object({
  brand: z.string().refine((value) => value === customBrand || brandPresets.some(({ id }) => id === value)),
  brandTextMode: z.enum(["auto", "manual"]).default("auto"),
  brandTextHex: z.string().regex(/^#[0-9a-f]{6}$/i).default("#ffffff"),
  colourOpacity: z.number().min(0).max(100),
  customHex: z.string().regex(/^#[0-9a-f]{6}$/i),
  tone: z.enum(["neutral", "cool", "warm", "brand"]),
  darkStyle: z.enum(["dim", "deep", "black"]),
  contrast: z.enum(["soft", "crisp"]),
  radius: z.string().refine((value) => radiusOptions.some(({ value: radius }) => radius === value)),
  controls: z.enum(controlStyles.map(({ value }) => value)).default("outlined"),
  shadows: z.enum(shadowOptions.map(({ value }) => value)).default("on"),
  font: z.string().refine((value) => fonts.some(({ value: font }) => font === value)),
  heading: z.string().refine((value) => headingFonts.some(({ value: font }) => font === value)),
  motion: z.enum(motionPresets.map(({ value }) => value)),
});

const exportSchema = z.object({ version: z.literal(1), theme: themeSchema });
const prompt = "Apply this Project UI theme to the app. Use https://github.com/juleshall4/project-ui as the source of truth: update the shared UI components and base styles from its source files, install required dependencies, then merge the CSS below for the selected theme. Add the <html> attributes that the CSS notes for motion, controls, and shadows. Preserve app functionality and check the build.";

export function exportTheme(theme: Theme, includePrompt = false): string {
  const metadata = `/* Project UI theme: ${JSON.stringify({ version: 1, theme })} */`;
  return `${includePrompt ? `/* ${prompt} */\n\n` : ""}${metadata}\n\n${themeCss(theme)}`;
}

/** Reads settings only; imported CSS is never injected into the page. */
export function importTheme(source: string): Theme {
  const metadata = source.match(/\/\* Project UI theme: (.*?) \*\//);
  try {
    return exportSchema.parse(JSON.parse(metadata ? metadata[1] : source)).theme;
  } catch {
    throw new Error("Paste a complete Project UI theme export or choose an exported theme file.");
  }
}
