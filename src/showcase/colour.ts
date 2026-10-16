export type Hsv = { h: number; s: number; v: number };

/** Hue is in degrees; saturation and value are percentages. */
export function hexToHsv(hex: string, fallbackHue = 0): Hsv {
  const [r, g, b] = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = fallbackHue;
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : (delta / max) * 100, v: max * 100 };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const chroma = (v / 100) * (s / 100);
  const sector = (h % 360) / 60;
  const x = chroma * (1 - Math.abs((sector % 2) - 1));
  const channels = [
    [chroma, x, 0], [x, chroma, 0], [0, chroma, x],
    [0, x, chroma], [x, 0, chroma], [chroma, 0, x],
  ][Math.floor(sector)];
  const offset = v / 100 - chroma;
  return `#${channels.map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, "0")).join("")}`;
}
