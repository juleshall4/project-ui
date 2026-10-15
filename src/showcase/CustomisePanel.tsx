import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { CustomiseControls } from "./CustomiseControls";
import type { ThemeController } from "./theme";

/**
 * Theme settings in a Coss Sidebar on the right. It docks beside the page so
 * changes stay visible, and becomes a sheet on small screens.
 */
export function CustomisePanel({ settings, update }: Pick<ThemeController, "settings" | "update">) {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  return (
    <Sidebar id="customise-panel" side="right">
      <SidebarHeader className="min-h-14 flex-row items-center justify-between gap-2 border-b px-4">
        <div>
          <h2 className="font-heading font-semibold text-foreground text-sm">Customise theme</h2>
          <p className="text-muted-foreground text-xs">Applies to light and dark mode.</p>
        </div>
        <Button
          aria-label="Close customise panel"
          onClick={() => (isMobile ? setOpenMobile(false) : setOpen(false))}
          size="icon-sm"
          variant="ghost"
        >
          <XIcon />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-4 text-foreground">
          <CustomiseControls settings={settings} update={update} />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

/** The top bar button that opens and closes the panel. */
export function CustomiseButton({ children }: { children: React.ReactNode }) {
  const { isMobile, open, openMobile, toggleSidebar } = useSidebar();
  const expanded = isMobile ? openMobile : open;

  return (
    <Button
      aria-controls="customise-panel"
      aria-expanded={expanded}
      onClick={toggleSidebar}
      size="sm"
      variant={expanded ? "secondary" : "outline"}
    >
      {children}
    </Button>
  );
}
