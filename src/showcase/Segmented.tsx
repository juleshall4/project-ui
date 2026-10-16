import { RadioGroupPrimitive, RadioPrimitive } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  segmentedControlItemVariants,
  segmentedControlRootClassName,
} from "@/lib/segmented-control";

type SegmentedProps<T extends string> = {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

const itemClassName = segmentedControlItemVariants({ className: "grow", size: "sm", state: "checked" });

/**
 * A single-choice row of options, built on Coss Radio Group with the segmented
 * control styling. One option is always selected, so Radio Group fits better
 * than Toggle Group.
 */
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <RadioGroupPrimitive
      aria-label={label}
      className={cn(segmentedControlRootClassName, "w-full")}
      onValueChange={(next) => onChange(next as T)}
      value={value}
    >
      {options.map((option) => (
        <RadioPrimitive.Root className={itemClassName} key={option.value} value={option.value}>
          {option.label}
        </RadioPrimitive.Root>
      ))}
    </RadioGroupPrimitive>
  );
}
