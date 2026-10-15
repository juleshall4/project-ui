import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { parseHex } from "./theme";

type CustomColourProps = {
  hex: string;
  onChange: (hex: string) => void;
};

/** A colour picker and hex field for the Custom brand colour. */
export function CustomColour({ hex, onChange }: CustomColourProps) {
  const [draft, setDraft] = useState(hex);
  const valid = parseHex(draft) !== undefined;

  useEffect(() => setDraft(hex), [hex]);

  const commit = (value: string) => {
    setDraft(value);
    const parsed = parseHex(value);
    if (parsed) onChange(parsed);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          aria-label="Colour picker"
          className="size-8 shrink-0 cursor-pointer rounded-lg border bg-transparent p-0.5"
          onChange={(event) => commit(event.target.value)}
          type="color"
          value={hex}
        />
        <Input
          aria-invalid={!valid || undefined}
          aria-label="Hex code"
          className="font-mono"
          id="custom-hex"
          onChange={(event) => commit(event.target.value)}
          placeholder="#ff5a1f"
          size="sm"
          spellCheck={false}
          value={draft}
        />
      </div>
      {!valid && (
        <p className="text-destructive-foreground text-xs">Use a hex code like #ff5a1f or #f52.</p>
      )}
    </div>
  );
}
