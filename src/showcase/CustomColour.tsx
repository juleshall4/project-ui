import { type CSSProperties, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverPopup, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { hexToHsv, type Hsv, hsvToHex } from "./colour";
import { parseHex } from "./theme";

type CustomColourProps = {
  hex: string;
  label?: string;
  onChange: (hex: string) => void;
};

function ColourChannel({
  label, value, max, gradient, onChange,
}: {
  label: string;
  value: number;
  max: number;
  gradient: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field
      className="flex flex-col gap-2"
      data-slot="colour-channel"
      style={{ "--colour-gradient": gradient } as CSSProperties}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <FieldLabel>{label}</FieldLabel>
        <div className="flex items-center gap-1">
          <Input
            aria-label={label}
            className="w-16 tabular-nums"
            max={max}
            min={0}
            onChange={(event) => {
              const next = event.target.valueAsNumber;
              if (Number.isFinite(next)) onChange(Math.min(max, Math.max(0, next)));
            }}
            size="sm"
            step={1}
            type="number"
            value={Math.round(value)}
          />
          <span aria-hidden="true" className="w-3 text-muted-foreground text-xs">{max === 360 ? "°" : "%"}</span>
        </div>
      </div>
      <Slider
        getAriaLabel={() => label}
        max={max}
        min={0}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
        step={1}
        value={value}
      />
    </Field>
  );
}

/** An HSV picker with hex entry, shared by every custom colour setting. */
export function CustomColour({ hex, onChange, label = "Brand colour" }: CustomColourProps) {
  const [draft, setDraft] = useState(hex);
  const [shown, setShown] = useState(hex);
  const [hsv, setHsv] = useState(() => hexToHsv(hex));
  const valid = parseHex(draft) !== undefined;

  // Follow preset changes while preserving hue when a slider reaches grey or black.
  if (hex !== shown) {
    setShown(hex);
    setDraft(hex);
    setHsv(hexToHsv(hex, hsv.h));
  }

  const commit = (value: string) => {
    setDraft(value);
    const parsed = parseHex(value);
    if (parsed) {
      setShown(parsed);
      setHsv(hexToHsv(parsed, hsv.h));
      onChange(parsed);
    }
  };

  const changeHsv = (patch: Partial<Hsv>) => {
    const next = { ...hsv, ...patch };
    const colour = hsvToHex(next);
    setHsv(next);
    setShown(colour);
    setDraft(colour);
    onChange(colour);
  };

  return (
    <div className="flex w-full items-start gap-2">
      <Popover>
        <PopoverTrigger render={<Button aria-label={`${label} picker`} size="icon-sm" variant="outline" />}>
          <span className="size-4 rounded-sm border border-input" style={{ backgroundColor: hex }} />
        </PopoverTrigger>
        <PopoverPopup align="start" className="w-64">
          <div className="flex flex-col gap-4">
            <PopoverTitle className="text-sm">{label}</PopoverTitle>
            <ColourChannel
              gradient="linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)"
              label="Hue"
              max={360}
              onChange={(h) => changeHsv({ h })}
              value={hsv.h}
            />
            <ColourChannel
              gradient={`linear-gradient(to right, ${hsvToHex({ ...hsv, s: 0 })}, ${hsvToHex({ ...hsv, s: 100 })})`}
              label="Saturation"
              max={100}
              onChange={(s) => changeHsv({ s })}
              value={hsv.s}
            />
            <ColourChannel
              gradient={`linear-gradient(to right, #000, ${hsvToHex({ ...hsv, v: 100 })})`}
              label="Brightness"
              max={100}
              onChange={(v) => changeHsv({ v })}
              value={hsv.v}
            />
          </div>
        </PopoverPopup>
      </Popover>
      <Field className="min-w-0 flex-1" invalid={!valid}>
        <Input
          aria-label={`${label} hex code`}
          className="font-mono"
          onChange={(event) => commit(event.target.value)}
          placeholder="#ff5a1f"
          size="sm"
          spellCheck={false}
          type="text"
          value={draft}
        />
        <FieldError match={!valid}>Use a hex code like #ff5a1f or #f52.</FieldError>
      </Field>
    </div>
  );
}
