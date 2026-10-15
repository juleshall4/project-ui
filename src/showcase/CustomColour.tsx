import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseHex } from "./theme";

type CustomColourProps = {
  hex: string;
  onChange: (hex: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CustomColour({ hex, onChange, open, onOpenChange }: CustomColourProps) {
  const [draft, setDraft] = useState(hex);
  const valid = parseHex(draft) !== undefined;

  useEffect(() => setDraft(hex), [hex]);

  const commit = (value: string) => {
    setDraft(value);
    const parsed = parseHex(value);
    if (parsed) onChange(parsed);
  };

  return (
    <Popover onOpenChange={onOpenChange} open={open}>
      <PopoverTrigger
        render={<Button aria-label="Edit custom colour" size="icon-sm" variant="outline" />}
      >
        <span className="size-4 rounded-full border border-black/10" style={{ background: hex }} />
      </PopoverTrigger>
      <PopoverPopup className="w-64">
        <PopoverTitle className="text-base">Custom colour</PopoverTitle>
        <PopoverDescription>Pick a colour or type a hex code.</PopoverDescription>
        <div className="mt-4 flex items-end gap-3">
          <input
            aria-label="Colour picker"
            className="size-9 shrink-0 cursor-pointer rounded-lg border bg-transparent p-0.5"
            onChange={(event) => commit(event.target.value)}
            type="color"
            value={hex}
          />
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="custom-hex">Hex</Label>
            <Input
              aria-invalid={!valid || undefined}
              className="font-mono"
              id="custom-hex"
              onChange={(event) => commit(event.target.value)}
              placeholder="#ff5a1f"
              size="sm"
              spellCheck={false}
              value={draft}
            />
          </div>
        </div>
        {!valid && (
          <p className="mt-2 text-destructive-foreground text-xs">
            Use a hex code like #ff5a1f or #f52.
          </p>
        )}
      </PopoverPopup>
    </Popover>
  );
}
