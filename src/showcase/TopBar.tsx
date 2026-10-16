import {
  MoonIcon,
  PanelLeftIcon,
  SlidersHorizontalIcon,
  SunIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPopup,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CustomiseButton } from "./CustomisePanel";
import { SaveThemeMenu } from "./SaveThemeMenu";
import { ThemeTransfer } from "./ThemeTransfer";
import { type ThemeController, themePresets } from "./theme";

const unsaved = "unsaved";

type TopBarProps = ThemeController & {
  /** Toggles the left navigation, which lives in a different sidebar provider. */
  onToggleNavigation: () => void;
};

export function TopBar({ onToggleNavigation, ...controller }: TopBarProps) {
  const { active, apply, saved, settings, update } = controller;
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const dark = settings.mode === "dark" || (settings.mode === "system" && systemDark);
  const modeLabel = dark ? "Switch to light mode" : "Switch to dark mode";
  const themes = [...themePresets, ...saved];
  const items = [
    ...themes.map(({ id, label }) => ({ label, value: id })),
    { label: "Unsaved changes", value: unsaved },
  ];

  return (
    <header className="sticky top-0 z-20 flex min-h-14 items-center gap-2 border-b bg-background/80 px-3 py-2 backdrop-blur-md">
      <Button
        aria-label="Toggle navigation"
        className="size-7"
        onClick={onToggleNavigation}
        size="icon"
        variant="ghost"
      >
        <PanelLeftIcon />
      </Button>
      <Separator className="mx-1 h-5" orientation="vertical" />

      <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
        <Select
          items={items}
          onValueChange={(id, details) => {
            // Only follow choices the user made, not Select reacting to the list changing.
            if (details.reason !== "item-press" && details.reason !== "list-navigation") return;
            const theme = themes.find((item) => item.id === id);
            if (theme) apply(theme.theme);
          }}
          value={active?.id ?? unsaved}
        >
          <SelectTrigger aria-label="Theme" className="w-52" size="sm">
            <span className="text-muted-foreground">Theme</span>
            <SelectValue className="flex-1" />
          </SelectTrigger>
          <SelectPopup>
            <SelectGroup>
              <SelectGroupLabel>Presets</SelectGroupLabel>
              {themePresets.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  {theme.label}
                </SelectItem>
              ))}
            </SelectGroup>
            {saved.length > 0 && (
              <>
                <SelectSeparator />
                <SelectGroup>
                  <SelectGroupLabel>Saved</SelectGroupLabel>
                  {saved.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}
            {/* Always mounted: removing the selected item makes Select pick another value. */}
            <SelectSeparator className={active ? "hidden" : undefined} />
            <SelectItem className={active ? "hidden" : undefined} disabled value={unsaved}>
              Unsaved changes
            </SelectItem>
          </SelectPopup>
        </Select>

        <CustomiseButton>
          <SlidersHorizontalIcon />
          Customise
        </CustomiseButton>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label={modeLabel}
                onClick={() => update({ mode: dark ? "light" : "dark" })}
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </TooltipTrigger>
          <TooltipPopup>{modeLabel}</TooltipPopup>
        </Tooltip>

        <SaveThemeMenu {...controller} />

        <ThemeTransfer {...controller} />
      </div>
    </header>
  );
}
