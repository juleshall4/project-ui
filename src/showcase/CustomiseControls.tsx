import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { contrastReport, contrasts, darkStyles, minimumContrast, tones } from "@/palette";
import { CustomColour } from "./CustomColour";
import { Segmented } from "./Segmented";
import {
  brandPresets,
  customBrand,
  fontFor,
  fonts,
  headingFonts,
  motionPresets,
  paletteFor,
  radiusOptions,
  type ThemeController,
  themeOf,
} from "./theme";

const brandItems = [
  ...brandPresets.map(({ id, label }) => ({ label, value: id })),
  { label: "Custom", value: customBrand },
];

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-medium text-muted-foreground text-xs">{title}</h3>
      {children}
    </section>
  );
}

function FontSelect({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select items={items} onValueChange={(next) => next && onChange(next)} value={value}>
      <SelectTrigger aria-label={label} size="sm">
        <span className="text-muted-foreground">{label}</span>
        <SelectValue className="flex-1" />
      </SelectTrigger>
      <SelectPopup>
        {items.map((item) => (
          <SelectItem
            key={item.value}
            style={{
              fontFamily: fonts.some((font) => font.value === item.value)
                ? fontFor(item.value).family
                : undefined,
            }}
            value={item.value}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}

/** Every theme setting, grouped. Shared by the docked panel and the small-screen sheet. */
export function CustomiseControls({
  settings,
  update,
}: Pick<ThemeController, "settings" | "update">) {
  const failing = contrastReport(paletteFor(themeOf(settings))).filter(
    (row) => row.light < minimumContrast || row.dark < minimumContrast,
  );

  return (
    <div className="flex flex-col gap-5">
      <Group title="Brand colour">
        <Select
          items={brandItems}
          onValueChange={(brand) => brand && update({ brand })}
          value={settings.brand}
        >
          <SelectTrigger aria-label="Brand colour" size="sm">
            <span className="size-3 shrink-0 rounded-full bg-brand" />
            <SelectValue className="flex-1" />
          </SelectTrigger>
          <SelectPopup>
            {brandPresets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{
                    background: `oklch(${preset.lightness} ${preset.chroma} ${preset.hue})`,
                  }}
                />
                {preset.label}
              </SelectItem>
            ))}
            <SelectItem value={customBrand}>
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ background: settings.customHex }}
              />
              Custom
            </SelectItem>
          </SelectPopup>
        </Select>
        {settings.brand === customBrand && (
          <CustomColour hex={settings.customHex} onChange={(customHex) => update({ customHex })} />
        )}
      </Group>

      <Group title="Button opacity">
        <div className="flex justify-end text-muted-foreground text-xs tabular-nums">
          {settings.buttonOpacity}%
        </div>
        <Slider
          getAriaLabel={() => "Button opacity"}
          max={100}
          min={0}
          onValueChange={(value) => update({ buttonOpacity: Array.isArray(value) ? value[0] : value })}
          step={5}
          value={settings.buttonOpacity}
        />
      </Group>

      <Group title="Tone of the greys">
        <Segmented
          label="Tone"
          onChange={(tone) => update({ tone })}
          options={tones}
          value={settings.tone}
        />
      </Group>

      <Group title="Dark mode">
        <Segmented
          label="Dark mode style"
          onChange={(darkStyle) => update({ darkStyle })}
          options={darkStyles}
          value={settings.darkStyle}
        />
      </Group>

      <Group title="Contrast">
        <Segmented
          label="Contrast"
          onChange={(contrast) => update({ contrast })}
          options={contrasts}
          value={settings.contrast}
        />
      </Group>

      <Group title="Corners">
        <Segmented
          label="Corner radius"
          onChange={(radius) => update({ radius })}
          options={radiusOptions}
          value={settings.radius}
        />
      </Group>

      <Group title="Type">
        <FontSelect
          items={fonts}
          label="Body"
          onChange={(font) => update({ font })}
          value={settings.font}
        />
        <FontSelect
          items={headingFonts}
          label="Headings"
          onChange={(heading) => update({ heading })}
          value={settings.heading}
        />
      </Group>

      <Group title="Motion">
        <Segmented
          label="Motion"
          onChange={(motion) => update({ motion })}
          options={motionPresets}
          value={settings.motion}
        />
      </Group>

      <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
        {failing.length === 0 ? (
          <>
            <CircleCheckIcon className="size-4 shrink-0 text-success" />
            All text passes WCAG AA contrast in light and dark mode.
          </>
        ) : (
          <>
            <CircleAlertIcon className="size-4 shrink-0 text-warning" />
            {failing.length} text {failing.length === 1 ? "pair is" : "pairs are"} hard to read:{" "}
            {failing.map((row) => row.label.toLowerCase()).join(", ")}. See Readability on the
            Foundations page.
          </>
        )}
      </p>
    </div>
  );
}
