import {
  CopyIcon,
  MonitorIcon,
  MoonIcon,
  PanelLeftIcon,
  RotateCcwIcon,
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
import { toastManager } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomiseButton } from "./CustomisePanel";
import { SaveThemeMenu } from "./SaveThemeMenu";
import { type Mode, type ThemeController, themeCss, themeOf, themePresets } from "./theme";

const unsaved = "unsaved";

type TopBarProps = ThemeController & {
  /** Toggles the left navigation, which lives in a different sidebar provider. */
  onToggleNavigation: () => void;
};

export function TopBar({ onToggleNavigation, ...controller }: TopBarProps) {
  const { active, apply, reset, saved, settings, update } = controller;
  const themes = [...themePresets, ...saved];
  const items = [
    ...themes.map(({ id, label }) => ({ label, value: id })),
    { label: "Unsaved changes", value: unsaved },
  ];

  const copyTheme = async () => {
    const prompt = "Apply this Project UI theme to the app. Use https://github.com/juleshall4/project-ui as the source of truth: update the shared UI components and base styles from its source files, install required dependencies, then merge the CSS below for the selected theme. Follow the included motion preset, preserve app functionality, and check the build.";
    await navigator.clipboard.writeText(`/* ${prompt} */\n\n${themeCss(themeOf(settings))}`);
    toastManager.add({
      description: "Includes the theme CSS and a short prompt to apply Project UI.",
      title: "Theme and prompt copied",
      type: "success",
    });
  };

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

        <SaveThemeMenu {...controller} />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button aria-label="Reset theme" onClick={reset} size="icon-sm" variant="ghost" />
            }
          >
            <RotateCcwIcon />
          </TooltipTrigger>
          <TooltipPopup>Reset to the Project theme</TooltipPopup>
        </Tooltip>

        <Button onClick={copyTheme} size="sm" variant="raised">
          <CopyIcon />
          Copy theme
        </Button>
      </div>
    </header>
  );
}
