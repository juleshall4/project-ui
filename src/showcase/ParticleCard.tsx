import { CheckIcon, CodeIcon } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import type { Particle } from "./catalog";
import { ErrorBoundary } from "./ErrorBoundary";
import "./preview-surfaces.css";

/** Becomes true once the element comes near the viewport, and stays true. */
function useNearViewport<T extends Element>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setNear(true),
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);

  return [ref, near] as const;
}

export function ParticleCard({ particle }: { particle: Particle }) {
  const [copied, setCopied] = useState(false);
  const [stageRef, near] = useNearViewport<HTMLDivElement>();
  const Component = particle.loaded ?? particle.Component;

  const copySource = async () => {
    await navigator.clipboard.writeText(await particle.loadSource());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="overflow-hidden" render={<figure />}>
      <div
        className="flex min-h-56 flex-1 items-center justify-center overflow-auto p-8"
        data-slot="showcase-stage"
        ref={stageRef}
      >
        {near && (
          <ErrorBoundary name={particle.name}>
            <Suspense fallback={<Spinner className="text-muted-foreground" />}>
              {/^p-alert-\d+$/.test(particle.name) ? (
                <div className="w-full rounded-xl" data-slot="showcase-alert-backing">
                  <Component />
                </div>
              ) : (
                <Component />
              )}
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
      <Separator />
      <figcaption className="flex items-center justify-between px-3 py-1.5">
        <code className="text-muted-foreground text-xs">{particle.name}</code>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label={`Copy ${particle.name} source`}
                onClick={copySource}
                size="icon-xs"
                variant="ghost"
              />
            }
          >
            {copied ? <CheckIcon /> : <CodeIcon />}
          </TooltipTrigger>
          <TooltipPopup>{copied ? "Copied" : "Copy code"}</TooltipPopup>
        </Tooltip>
      </figcaption>
    </Card>
  );
}
