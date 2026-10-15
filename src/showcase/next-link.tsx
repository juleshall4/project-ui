import type { ComponentProps } from "react";

/** Stands in for `next/link`, which some Coss examples import. */
export default function Link({ href, ...props }: ComponentProps<"a"> & { href: string }) {
  return <a href={href} {...props} />;
}
