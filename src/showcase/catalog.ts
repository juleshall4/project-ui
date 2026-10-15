import { type ComponentType, lazy, type LazyExoticComponent } from "react";

type Module = { default: ComponentType };

const modules = import.meta.glob<Module>("../components/p-*.tsx");
const sources = import.meta.glob<string>("../components/p-*.tsx", {
  import: "default",
  query: "?raw",
});

export type Particle = {
  name: string;
  Component: LazyExoticComponent<ComponentType>;
  /** Set once the module has loaded, so cards can render without suspending. */
  loaded?: ComponentType;
  preload: () => Promise<unknown>;
  loadSource: () => Promise<string>;
};

export type ComponentGroup = {
  slug: string;
  title: string;
  particles: Particle[];
};

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ")
    .replace("Otp", "OTP");
}

function buildGroups(): ComponentGroup[] {
  const groups = new Map<string, Particle[]>();

  for (const [path, load] of Object.entries(modules)) {
    const name = path.slice(path.lastIndexOf("/") + 1, -".tsx".length);
    const slug = name.replace(/^p-/, "").replace(/-\d+$/, "");
    let pending: Promise<Module> | undefined;
    const loadOnce = () => {
      pending ??= load().then((module) => {
        particle.loaded = module.default;
        return module;
      });
      return pending;
    };
    const particle: Particle = {
      Component: lazy(loadOnce),
      loadSource: sources[path],
      name,
      preload: loadOnce,
    };
    groups.set(slug, [...(groups.get(slug) ?? []), particle]);
  }

  const order = (name: string) => Number(name.slice(name.lastIndexOf("-") + 1));

  return [...groups.entries()]
    .map(([slug, particles]) => ({
      particles: particles.sort((a, b) => order(a.name) - order(b.name)),
      slug,
      title: titleCase(slug),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export const componentGroups: ComponentGroup[] = buildGroups();

export const particleCount: number = componentGroups.reduce(
  (total, group) => total + group.particles.length,
  0,
);

export function preloadGroup(group: ComponentGroup): Promise<unknown> {
  return Promise.all(group.particles.map((particle) => particle.preload()));
}

const whenIdle: (callback: () => void) => void =
  typeof requestIdleCallback === "function"
    ? (callback) => requestIdleCallback(callback, { timeout: 2000 })
    : (callback) => setTimeout(callback, 200);

/** Loads every example in the background, one component group per idle period. */
export function preloadAllWhenIdle(): void {
  const queue = [...componentGroups];
  const next = () => {
    const group = queue.shift();
    if (group) whenIdle(() => preloadGroup(group).catch(() => {}).finally(next));
  };
  whenIdle(next);
}
