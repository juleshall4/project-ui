import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  controlStyles,
  customBrand,
  fontFor,
  fonts,
  headingFonts,
  motionPresets,
  paletteFor,
  radiusOptions,
  shadowOptions,
  type ThemeController,
  themeOf,
} from "./theme";

const brandItems = [
  ...brandPresets.map(({ id, label }) => ({ label, value: id })),
  { label: "Custom", value: customBrand },
];

/** A small colour dot for brand options. */
function Swatch({ colour }: { colour?: string }) {
  return (
    <span
      className={colour ? "size-3 shrink-0 rounded-full" : "size-3 shrink-0 rounded-full bg-brand"}
      style={colour ? { background: colour } : undefined}
    />
  );
}

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
            <Swatch />
            <SelectValue className="flex-1" />
          </SelectTrigger>
          <SelectPopup>
            {brandPresets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                <Swatch colour={`oklch(${preset.lightness} ${preset.chroma} ${preset.hue})`} />
                {preset.label}
              </SelectItem>
            ))}
            <SelectItem value={customBrand}>
              <Swatch colour={settings.customHex} />
              Custom
            </SelectItem>
          </SelectPopup>
        </Select>
        {settings.brand === customBrand && (
          <CustomColour hex={settings.customHex} onChange={(customHex) => update({ customHex })} />
        )}
      </Group>

      <Group title="Text on brand colour">
        <Segmented
          label="Brand text colour mode"
          onChange={(brandTextMode) => update({ brandTextMode })}
          options={[
            { label: "Auto", value: "auto" },
            { label: "Manual", value: "manual" },
          ]}
          value={settings.brandTextMode}
        />
        {settings.brandTextMode === "manual" ? (
          <CustomColour
            hex={settings.brandTextHex}
            label="Brand text colour"
            onChange={(brandTextHex) => update({ brandTextHex })}
          />
        ) : (
          <p className="text-muted-foreground text-xs">Chooses light or dark text for readability.</p>
        )}
      </Group>

      <Group title="Colour opacity">
        <div className="flex justify-end text-muted-foreground text-xs tabular-nums">
          {settings.colourOpacity}%
        </div>
        <Slider
          getAriaLabel={() => "Colour opacity"}
          max={100}
          min={0}
          onValueChange={(value) => update({ colourOpacity: Array.isArray(value) ? value[0] : value })}
          step={5}
          value={settings.colourOpacity}
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

      <Group title="Controls">
        <Segmented
          label="Control style"
          onChange={(controls) => update({ controls })}
          options={controlStyles}
          value={settings.controls}
        />
      </Group>

      <Group title="Shadows">
        <Segmented
          label="Shadows"
          onChange={(shadows) => update({ shadows })}
          options={shadowOptions}
          value={settings.shadows}
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

      {failing.length === 0 ? (
        <Alert variant="success">
          <CircleCheckIcon />
          <AlertDescription>All text passes WCAG AA contrast in light and dark mode.</AlertDescription>
        </Alert>
      ) : (
        <Alert variant="warning">
          <CircleAlertIcon />
          <AlertDescription>
            {failing.length} text {failing.length === 1 ? "pair is" : "pairs are"} hard to read:{" "}
            {failing.map((row) => row.label.toLowerCase()).join(", ")}. See Readability on the
            Foundations page.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
