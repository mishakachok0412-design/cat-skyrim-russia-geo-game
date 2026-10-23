import { useMemo } from "react"
import { countryFrame, countryPath, don, frameOf, landPath, project, volga, type Frame } from "../geo"
import { cx } from "../format"

export type MapMarker = {
  id: string
  lon: number
  lat: number
  label: string
  n?: number
  tone: "idle" | "next" | "done" | "expert"
  selected?: boolean
}

type Laid = MapMarker & { tx: number; ty: number; x: number; y: number }

export function MapBoard({
  markers,
  frame,
  onPick,
  nudge = true,
  caption,
  showInset = false,
}: {
  markers: MapMarker[]
  frame?: Frame
  onPick: (id: string) => void
  nudge?: boolean
  caption?: string
  showInset?: boolean
}) {
  const bounds = frame ?? frameOf(markers)
  const laid = useMemo(() => layout(markers, bounds, nudge), [markers, bounds, nudge])

  return (
    <div className="map-wrap">
      <div
        className="relative w-full"
        style={{ aspectRatio: `${bounds.width} / ${bounds.height}` }}
      >
        <svg
          viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Карта остановок сезона"
        >
          <rect
            x={bounds.minX}
            y={bounds.minY}
            width={bounds.width}
            height={bounds.height}
            fill="#e7f0e4"
          />
          <path
            d={graticule(bounds)}
            fill="none"
            stroke="#1e6b45"
            strokeOpacity="0.12"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <path d={landPath} fill="#f7f3ea" stroke="#1e6b45" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <River points={volga} />
          <River points={don} />
          {laid.map((marker) => {
            const moved = Math.hypot(marker.x - marker.tx, marker.y - marker.ty) > 4
            if (!moved) return null
            const from = toWorld(marker.tx, marker.ty, bounds)
            const to = toWorld(marker.x, marker.y, bounds)
            return (
              <line
                key={`${marker.id}-lead`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#1e6b45"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
                strokeDasharray="3 3"
              />
            )
          })}
        </svg>
        <p className="pointer-events-none absolute left-3 top-3 text-[10px] font-bold tracking-[0.18em] text-forest">
          СЕВЕР
        </p>
        {seaLabels(bounds).map((sea) => (
          <span
            key={sea.name}
            className="pointer-events-none absolute text-[10px] font-semibold tracking-[0.14em] text-[#5d7c8a] uppercase"
            style={{ left: `${sea.x}%`, top: `${sea.y}%` }}
          >
            {sea.name}
          </span>
        ))}
        {showInset ? (
          <svg
            viewBox={`${countryFrame.minX} ${countryFrame.minY} ${countryFrame.width} ${countryFrame.height}`}
            className="pointer-events-none absolute top-2 right-2 h-14 w-24 rounded-xl bg-white/85 p-1"
            aria-hidden="true"
          >
            <path d={countryPath} fill="#d7e6d4" stroke="#1e6b45" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            <rect
              x={bounds.minX}
              y={bounds.minY}
              width={bounds.width}
              height={bounds.height}
              fill="rgba(227,161,45,0.18)"
              stroke="#c45b3e"
              strokeWidth="1.4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : null}
        {laid.map((marker) => (
          <button
            key={marker.id}
            type="button"
            onClick={() => onPick(marker.id)}
            className={cx("map-pin", `is-${marker.tone}`, marker.selected && "is-selected")}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            aria-pressed={marker.selected}
            aria-label={marker.n ? `${marker.n}. ${marker.label}` : marker.label}
          >
            {marker.n ?? ""}
          </button>
        ))}
      </div>
      {caption ? <p className="mt-2 text-xs text-muted">{caption}</p> : null}
    </div>
  )
}

const seas = [
  { name: "Балтика", lon: 19.6, lat: 57.2 },
  { name: "Чёрное море", lon: 34.4, lat: 43.5 },
  { name: "Каспий", lon: 50.6, lat: 45.4 },
]

function seaLabels(frame: Frame) {
  return seas.flatMap((sea) => {
    const point = project(sea.lon, sea.lat)
    const x = ((point.x - frame.minX) / frame.width) * 100
    const y = ((point.y - frame.minY) / frame.height) * 100
    if (x < 2 || x > 88 || y < 4 || y > 92) return []
    return [{ ...sea, x, y }]
  })
}

function graticule(frame: Frame) {
  const parts: string[] = []
  for (let lon = 16; lon <= 72; lon += 4) {
    const x = lon * Math.cos((54 * Math.PI) / 180)
    if (x <= frame.minX || x >= frame.minX + frame.width) continue
    parts.push(`M${x},${frame.minY} L${x},${frame.minY + frame.height}`)
  }
  for (let lat = 40; lat <= 68; lat += 2) {
    const y = -lat
    if (y <= frame.minY || y >= frame.minY + frame.height) continue
    parts.push(`M${frame.minX},${y} L${frame.minX + frame.width},${y}`)
  }
  return parts.join(" ")
}

function River({ points }: { points: Array<[number, number]> }) {
  const d = points
    .map(([lon, lat], index) => {
      const point = project(lon, lat)
      return `${index === 0 ? "M" : "L"}${point.x},${point.y}`
    })
    .join(" ")
  return (
    <path
      d={d}
      fill="none"
      stroke="#7fa8c9"
      strokeWidth="1.4"
      vectorEffect="non-scaling-stroke"
      strokeLinecap="round"
    />
  )
}

function toWorld(x: number, y: number, frame: Frame) {
  return {
    x: frame.minX + (x / 100) * frame.width,
    y: frame.minY + (y / 100) * frame.height,
  }
}

function layout(markers: MapMarker[], frame: Frame, nudge: boolean): Laid[] {
  const placed: Laid[] = markers.map((marker) => {
    const point = project(marker.lon, marker.lat)
    const x = ((point.x - frame.minX) / frame.width) * 100
    const y = ((point.y - frame.minY) / frame.height) * 100
    return { ...marker, tx: x, ty: y, x, y }
  })
  if (!nudge) return placed
  for (let pass = 0; pass < 10; pass += 1) {
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i]
        const b = placed[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy) || 0.01
        if (dist >= 8) continue
        const push = (8 - dist) / 2
        const ux = dx / dist
        const uy = dy / dist
        a.x -= ux * push
        a.y -= uy * push
        b.x += ux * push
        b.y += uy * push
      }
    }
  }
  for (const marker of placed) {
    marker.x = Math.min(92, Math.max(8, marker.x))
    marker.y = Math.min(90, Math.max(10, marker.y))
  }
  return placed
}
