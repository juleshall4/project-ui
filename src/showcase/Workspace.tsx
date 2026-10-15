import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { CustomisePanel } from "./CustomisePanel";
import type { ThemeController } from "./theme";
import { TopBar } from "./TopBar";

/**
 * The top bar and page, plus the Customise sidebar on the right. The right
 * sidebar has its own SidebarProvider, so the left navigation keeps its own state.
 */
export function Workspace({ theme, children }: { theme: ThemeController; children: ReactNode }) {
  const navigation = useSidebar();
  const [open, setOpen] = useState(false);
  const shortcut = useRef(false);

  // Both providers listen for Cmd/Ctrl+B. Flag it first, so only the navigation toggles.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        shortcut.current = true;
        queueMicrotask(() => {
          shortcut.current = false;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []);

  return (
    <SidebarProvider
      className="min-h-0"
      onOpenChange={(next) => {
        if (!shortcut.current) setOpen(next);
      }}
      open={open}
      style={{ "--sidebar-width": "20rem" } as CSSProperties}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar {...theme} onToggleNavigation={navigation.toggleSidebar} />
        {children}
      </div>
      <CustomisePanel settings={theme.settings} update={theme.update} />
    </SidebarProvider>
  );
}
