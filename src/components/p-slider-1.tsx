"use client";

import { Slider } from "@/components/ui/slider";

export default function Particle() {
  return <Slider getAriaLabel={() => "Value"} defaultValue={50} />;
}
