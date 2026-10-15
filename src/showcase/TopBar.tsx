import { CopyIcon, MonitorIcon, MoonIcon, RotateCcwIcon, SunIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toastManager } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomColour } from "./CustomColour";
import {
  brandPresets,
  customBrand,
  fontFor,
  fonts,
  headingFonts,
  type Mode,
  type MotionPreset,
  motionPresets,
  radiusOptions,
  type ThemeSettings,
  themeCss,
} from "./theme";

const brandItems = [
  ...brandPresets.map(({ id, label }) => ({ label, value: id })),
  { label: "Custom", value: customBrand },
];

type TopBarProps = {
  settings: ThemeSettings;
  update: (patch: Partial<ThemeSettings>) => void;
  reset: () => void;
};

export function TopBar({ settings, update, reset }: TopBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const copyTheme = async () => {
    await navigator.clipboard.writeText(themeCss(settings));
    toastManager.add({
      description: "Paste it after the Project UI theme in your CSS.",
      title: "Theme CSS copied",
      type: "success",
    });
  };

  return (
    <header className="sticky top-0 z-20 flex min-h-14 items-center gap-2 border-b py-2 bg-background/80 px-3 backdrop-blur-md">
      <SidebarTrigger />
      <Separator className="mx-1 h-5" orientation="vertical" />

      <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
        <Select
          items={brandItems}
          onValueChange={(brand) => {
            if (!brand) return;
            update({ brand });
            if (brand === customBrand) setPickerOpen(true);
          }}
          value={settings.brand}
        >
          <SelectTrigger aria-label="Brand colour" className="w-40" size="sm">
            <span className="text-muted-foreground">Colour</span>
            <span className="size-3 shrink-0 rounded-full bg-brand" />
            <SelectValue className="flex-1" />
          </SelectTrigger>
          <SelectPopup>
            {brandPresets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{
                    background: `oklch(57.92% ${preset.chroma} ${preset.hue})`,
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
          <CustomColour
            hex={settings.customHex}
            onChange={(customHex) => update({ customHex })}
            onOpenChange={setPickerOpen}
            open={pickerOpen}
          />
        )}

        <Select
          items={radiusOptions}
          onValueChange={(radius) => radius && update({ radius })}
          value={settings.radius}
        >
          <SelectTrigger aria-label="Corner radius" className="w-32" size="sm">
            <span className="text-muted-foreground">Radius</span>
            <SelectValue className="flex-1" />
          </SelectTrigger>
          <SelectPopup>
            {radiusOptions.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>

        <Select
          items={fonts}
          onValueChange={(font) => font && update({ font })}
          value={settings.font}
        >
          <SelectTrigger aria-label="Body font" className="w-44" size="sm">
            <span className="text-muted-foreground">Font</span>
            <SelectValue className="flex-1" />
          </SelectTrigger>
          <SelectPopup>
            {fonts.map(({ family, label, value }) => (
              <SelectItem key={value} style={{ fontFamily: family }} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>

        <Select
          items={headingFonts}
          onValueChange={(heading) => heading && update({ heading })}
          value={settings.heading}
        >
          <SelectTrigger aria-label="Heading font" className="w-52" size="sm">
            <span className="text-muted-foreground">Headings</span>
            <SelectValue className="flex-1" />
          </SelectTrigger>
          <SelectPopup>
            {headingFonts.map(({ label, value }) => (
              <SelectItem
                key={value}
                style={{ fontFamily: fonts.some((font) => font.value === value) ? fontFor(value).family : undefined }}
                value={value}
              >
                {label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>

        <Select
          items={motionPresets}
          onValueChange={(motion) => motion && update({ motion: motion as MotionPreset })}
          value={settings.motion}
        >
          <SelectTrigger aria-label="Motion" className="w-36" size="sm">
            <span className="text-muted-foreground">Motion</span>
            <SelectValue className="flex-1" />
          </SelectTrigger>
          <SelectPopup>
            {motionPresets.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>

        <ToggleGroup
          aria-label="Colour mode"
          onValueChange={([mode]) => mode && update({ mode: mode as Mode })}
          size="sm"
          value={[settings.mode]}
          variant="outline"
        >
          <ToggleGroupItem aria-label="Light mode" value="light">
            <SunIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="System mode" value="system">
            <MonitorIcon />
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Dark mode" value="dark">
            <MoonIcon />
          </ToggleGroupItem>
        </ToggleGroup>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button aria-label="Reset theme" onClick={reset} size="icon-sm" variant="ghost" />
            }
          >
            <RotateCcwIcon />
          </TooltipTrigger>
          <TooltipPopup>Reset to defaults</TooltipPopup>
        </Tooltip>

        <Button onClick={copyTheme} size="sm" variant="raised">
          <CopyIcon />
          Copy theme
        </Button>
      </div>
    </header>
  );
}
