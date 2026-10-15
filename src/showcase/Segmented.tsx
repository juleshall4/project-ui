import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type SegmentedProps<T extends string> = {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

/** A single-choice row of buttons, built on Coss Toggle Group. */
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <ToggleGroup
      aria-label={label}
      className="w-full *:flex-1"
      onValueChange={([next]) => next && onChange(next as T)}
      size="sm"
      value={[value]}
      variant="outline"
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
