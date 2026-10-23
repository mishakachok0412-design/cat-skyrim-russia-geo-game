import type { ReactNode } from "react"
import type { Motif as MotifName } from "../types"

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export function Motif({ name, className }: { name: MotifName; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {shapes[name]}
    </svg>
  )
}

const shapes: Record<MotifName, ReactNode> = {
  cheese: (
    <path
      {...common}
      d="M8 34 L24 10 L40 34 Z M20 24 h.1 M28 28 h.1 M23 31 h.1"
    />
  ),
  honey: (
    <>
      <path {...common} d="M24 8 l6 3.5 v7 L24 22 l-6-3.5 v-7 Z" />
      <path {...common} d="M24 22 v8 M21 34c0 3 6 3 6 0" />
    </>
  ),
  clay: <path {...common} d="M18 14 h12 l-2 6 c4 2 6 6 5 12 H15 c-1-6 1-10 5-12 Z" />,
  fish: <path {...common} d="M8 26 c8-8 16-8 22-2 l8-6 v16 l-8-6 c-6 6-14 6-22-2 Z" />,
  dune: (
    <path {...common} d="M6 32c4-8 8-8 12 0s8 8 12 0 8-8 12 0 M8 38h32" />
  ),
  fortress: <path {...common} d="M10 38 V20 h6 v-6 h4 v6 h8 v-6 h4 v6 h6 v18 Z" />,
  bread: <path {...common} d="M10 28c0-8 6-12 14-12s14 4 14 12v4H10Z M16 24h.1M24 22h.1M30 25h.1" />,
  deer: (
    <path
      {...common}
      d="M16 38c2-8 4-12 8-14 4 2 6 6 8 14 M24 24 v-6 M18 14c2 2 4 3 6 4 M30 14c-2 2-4 3-6 4 M14 10c2 2 3 4 4 6 M34 10c-2 2-3 4-4 6"
    />
  ),
  grape: (
    <>
      <circle {...common} cx="24" cy="28" r="4" />
      <circle {...common} cx="17" cy="24" r="4" />
      <circle {...common} cx="31" cy="24" r="4" />
      <circle {...common} cx="20" cy="18" r="3.5" />
      <circle {...common} cx="28" cy="18" r="3.5" />
      <path {...common} d="M24 14c4-6 8-6 10-4" />
    </>
  ),
  mountain: <path {...common} d="M6 36 L18 16 L24 26 L30 12 L42 36 Z" />,
  horse: (
    <path
      {...common}
      d="M12 34 v-8 l6-6 4 2 8-8 4 3 v5 l4 4 v8 M18 28 v6 M30 28 v6 M34 16 l4-4"
    />
  ),
  lotus: (
    <path
      {...common}
      d="M24 34c-8-2-10-10-6-16 2 6 6 8 6 8s4-2 6-8c4 6 2 14-6 16Z M24 34c0-8 2-14 0-20 M16 30c4-2 6-1 8 2 M32 30c-4-2-6-1-8 2"
    />
  ),
  linen: <path {...common} d="M14 10 v28 M24 10 v28 M34 10 v28 M10 18 h28 M10 28 h28" />,
  pattern: (
    <path {...common} d="M24 8 l8 8 -8 8 -8-8 Z M24 24 l8 8 -8 8 -8-8 Z M8 24 h8 M32 24 h8" />
  ),
  pond: (
    <>
      <ellipse {...common} cx="24" cy="28" rx="14" ry="6" />
      <path {...common} d="M14 28c2-6 6-8 10-8s8 2 10 8" />
      <path {...common} d="M24 8 v6" />
    </>
  ),
}
