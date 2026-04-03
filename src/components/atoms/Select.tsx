import { ComponentPropsWithoutRef } from "react";

import Label from "./Label";

interface Option {
  label: string;
  value: string;
}

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  label?: string;
  options?: Option[];
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
};

export default function Select({ label, id, options = [], onBlur, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <Label htmlFor={id}>{label}</Label>}
      <select
        id={id}
        className="text-sm bg-black/5 text-primary-vibrant-label h-8 rounded-md pl-2"
        onBlur={onBlur}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
