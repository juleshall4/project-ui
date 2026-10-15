import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { componentGroups, type Particle } from "./catalog";
import { ParticleCard } from "./ParticleCard";

const swatches = [
  ["brand", "bg-brand"],
  ["brand-soft", "bg-brand-soft"],
  ["magic", "bg-magic"],
  ["pro-background", "bg-pro-background"],
  ["background", "bg-background"],
  ["foreground", "bg-foreground"],
  ["card", "bg-card"],
  ["secondary", "bg-secondary"],
  ["muted", "bg-muted"],
  ["muted-foreground", "bg-muted-foreground"],
  ["border", "bg-border"],
  ["sidebar", "bg-sidebar"],
  ["destructive", "bg-destructive"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["highlight", "bg-highlight"],
];

const variants = [
  "default",
  "raised",
  "soft",
  "magic",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "destructive-outline",
  "link",
] as const;

const motionDemos = [
  "p-menu-1",
  "p-select-1",
  "p-popover-1",
  "p-tooltip-1",
  "p-preview-card-1",
  "p-dialog-1",
  "p-sheet-1",
  "p-drawer-1",
  "p-accordion-1",
  "p-tabs-1",
  "p-switch-1",
  "p-checkbox-1",
  "p-toast-1",
];

const particlesByName = new Map(
  componentGroups.flatMap((group) => group.particles.map((particle) => [particle.name, particle])),
);
const motionParticles = motionDemos
  .map((name) => particlesByName.get(name))
  .filter((particle): particle is Particle => particle !== undefined);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading font-semibold text-lg">{title}</h2>
      {children}
    </section>
  );
}

export function Foundations() {
  return (
    <div className="space-y-12">
      <Section title="Colours">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
          {swatches.map(([name, className]) => (
            <div className="overflow-hidden rounded-xl border bg-card" key={name}>
              <div className={`h-16 border-b ${className}`} />
              <code className="block px-3 py-2 text-muted-foreground text-xs">{name}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <p className="text-muted-foreground text-sm">
          <code>raised</code>, <code>soft</code>, and <code>magic</code> are Project UI additions.
          Every button presses down slightly when clicked.
        </p>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-6">
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant === "magic" && <SparklesIcon />}
              {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-6">
          {(["xs", "sm", "default", "lg", "xl"] as const).map((size) => (
            <Button key={size} size={size} variant="raised">
              Size {size}
              <ArrowRightIcon />
            </Button>
          ))}
          <Button loading>Saving</Button>
          <Button disabled variant="raised">
            Disabled
          </Button>
        </div>
      </Section>

      <Section title="Motion">
        <p className="max-w-prose text-muted-foreground text-sm">
          Pick a preset with Motion in the top bar, then open these. Menus and popovers grow
          from their trigger, dialogs settle in place, and the command palette and comboboxes
          stay instant because they open from the keyboard. With your system&apos;s Reduce
          motion setting on, every preset fades instead of moving.
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-4">
          {motionParticles.map((particle) => (
            <ParticleCard key={particle.name} particle={particle} />
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-3 rounded-xl border bg-card p-6">
          <p className="font-heading font-semibold text-4xl tracking-tight">
            Build something great
          </p>
          <p className="font-heading font-semibold text-2xl">Section heading</p>
          <p className="max-w-prose text-foreground">
            Body text uses TikTok Sans by default. Use the Font and Headings controls in the top
            bar to try other Google Fonts, and pair a display font with a calmer body font.
          </p>
          <p className="text-muted-foreground text-sm">Muted helper text for hints and captions.</p>
          <div className="flex gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">
              font-mono
            </code>
          </div>
        </div>
      </Section>
    </div>
  );
}
