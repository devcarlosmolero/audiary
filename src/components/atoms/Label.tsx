import { ComponentPropsWithoutRef } from "react";

export default function Label({ htmlFor, ...props }: ComponentPropsWithoutRef<"label">) {
  return <label className="text-sm text-black/50" htmlFor={htmlFor} {...props} />;
}
