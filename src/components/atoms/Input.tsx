import { ComponentPropsWithoutRef } from "react";

import Label from "./Label";

type InputProps = ComponentPropsWithoutRef<"input"> & {
  label?: string;
  _slot?: React.ReactNode;
};

export default function Input({ label, id, onBlur, _slot, ...props }: InputProps) {
  return (
    <div className="flex relative flex-col gap-1">
      {label && <Label htmlFor={id}>{label}</Label>}
      <input
        id={id}
        className="border border-black/5 text-sm bg-white h-8 rounded-md pl-2"
        onBlur={onBlur}
        {...props}
      />
      {_slot}
    </div>
  );
}
