import { SearchIcon, SwatchBookIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  componentGroups,
  particleCount,
  preloadAllWhenIdle,
  preloadGroup,
} from "@/showcase/catalog";
import { Foundations } from "@/showcase/Foundations";
import { ParticleCard } from "@/showcase/ParticleCard";
import { themeOf, useThemeSettings } from "@/showcase/theme";
import { Workspace } from "@/showcase/Workspace";

const foundations = "foundations";

function currentPage(): string {
  return window.location.hash.slice(1) || foundations;
}

export default function App() {
  const theme = useThemeSettings();
  const [page, setPage] = useState(currentPage);
  const [query, setQuery] = useState("");

  const visibleGroups = useMemo(
    () =>
      componentGroups.filter((group) =>
        group.title.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );
  const group = componentGroups.find((item) => item.slug === page);

  useEffect(preloadAllWhenIdle, []);

  const open = (slug: string) => {
    window.history.replaceState(null, "", `#${slug}`);
    setPage(slug);
    window.scrollTo({ top: 0 });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="gap-3 p-3">
          <div className="flex items-center gap-2 px-1 pt-1">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand font-bold text-brand-foreground text-sm">
              P
            </span>
            <div className="leading-tight">
              <p className="font-heading font-semibold text-sm">Project UI</p>
              <p className="text-muted-foreground text-xs">Coss components, my way</p>
            </div>
          </div>
          <InputGroup>
            <InputGroupInput
              aria-label="Search components"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search components"
              size="sm"
              type="search"
              value={query}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={page === foundations}
                  onClick={() => open(foundations)}
                >
                  <SwatchBookIcon />
                  Foundations
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Components</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleGroups.map((item) => (
                  <SidebarMenuItem key={item.slug}>
                    <SidebarMenuButton
                      isActive={page === item.slug}
                      onClick={() => open(item.slug)}
                      onFocus={() => preloadGroup(item)}
                      onPointerEnter={() => preloadGroup(item)}
                    >
                      {item.title}
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{item.particles.length}</SidebarMenuBadge>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <Workspace theme={theme}>
          <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-10">
            <div className="space-y-2">
              <h1 className="font-heading font-semibold text-3xl tracking-tight">
                {group ? group.title : "Foundations"}
              </h1>
              <p className="text-muted-foreground">
                {group
                  ? `${group.particles.length} ${group.particles.length === 1 ? "example" : "examples"} built with the ${group.title} component.`
                  : `Colours, buttons, and type for ${componentGroups.length} Coss components and ${particleCount} examples.`}
              </p>
            </div>
            {group ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4">
                {group.particles.map((particle) => (
                  <ParticleCard key={particle.name} particle={particle} />
                ))}
              </div>
            ) : (
              <Foundations theme={themeOf(theme.settings)} />
            )}
          </div>
        </Workspace>
      </SidebarInset>
    </SidebarProvider>
  );
}
