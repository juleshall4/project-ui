"use client";

import { Slider } from "@/components/ui/slider";

export default function Particle() {
  return (
    <Slider
      getAriaLabel={(index) =>
        index === 0 ? "Minimum value" : "Maximum value"
      }
      defaultValue={[25, 75]}
    />
  );
}
