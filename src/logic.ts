import { featuredChoice, findStop, seasons } from "./data"
import { dateKey } from "./format"
import type { Application, Choice, Save, Season, Source, Stop } from "./types"

export const emptySave = (): Save => ({
  picks: {},
  sources: {},
  nights: {},
  subscription: false,
  daily: null,
  morning: 0,
  applications: [],
})

export function sanitize(raw: Partial<Save> | null): Save {
  const save = emptySave()
  if (!raw || typeof raw !== "object") return save
  for (const [stopId, choiceId] of Object.entries(raw.picks ?? {})) {
    const found = findStop(stopId)
    if (!found) continue
    if (!found.stop.choices.some((choice) => choice.id === choiceId)) continue
    save.picks[stopId] = choiceId
  }
  for (const [stopId, source] of Object.entries(raw.sources ?? {})) {
    if (!save.picks[stopId]) continue
    if (source === "game" || source === "catalog" || source === "hotel" || source === "road") {
      save.sources[stopId] = source
    }
  }
  for (const [stopId, night] of Object.entries(raw.nights ?? {})) {
    if (save.picks[stopId] && typeof night === "boolean") save.nights[stopId] = night
  }
  save.subscription = Boolean(raw.subscription)
  save.daily = typeof raw.daily === "string" ? raw.daily : null
  save.morning = Number.isFinite(raw.morning) ? Math.max(0, Number(raw.morning)) : 0
  save.applications = Array.isArray(raw.applications)
    ? raw.applications.filter((item) => item && typeof item.id === "string").slice(0, 20)
    : []
  return save
}

export type QuoteLine = {
  season: Season
  stop: Stop
  choice: Choice
  night: boolean
  source: Source
}

export type Quote = {
  lines: QuoteLine[]
  tours: number
  stays: number
  rides: number
  subscriptionOff: number
  seriesOff: number
  due: number
  points: number
  hasCar: boolean
  completed: number
  estimates: number
}

export function seasonDone(season: Season, picks: Save["picks"]) {
  return season.stops.every((stop) => Boolean(picks[stop.id]))
}

export function completedSeasons(save: Save) {
  return seasons.filter((season) => seasonDone(season, save.picks))
}

export function choiceOf(stop: Stop, picks: Save["picks"]) {
  const id = picks[stop.id]
  return stop.choices.find((choice) => choice.id === id) ?? null
}

export function buildQuote(save: Save): Quote {
  const lines: QuoteLine[] = []
  for (const season of seasons) {
    for (const stop of season.stops) {
      const choice = choiceOf(stop, save.picks)
      if (!choice) continue
      lines.push({
        season,
        stop,
        choice,
        night: save.nights[stop.id] !== false,
        source: save.sources[stop.id] ?? "game",
      })
    }
  }
  const tours = lines.reduce((sum, line) => sum + line.choice.tour.price, 0)
  const stays = lines.reduce((sum, line) => sum + (line.night ? line.choice.stay.price : 0), 0)
  const rides = lines.reduce((sum, line) => sum + line.choice.ride.price, 0)
  const completed = completedSeasons(save).length
  const subscriptionOff = save.subscription ? Math.round(tours * 0.1) : 0
  const seriesOff = completed >= 2 ? Math.round((tours - subscriptionOff) * 0.05) : 0
  const due = tours + stays + rides - subscriptionOff - seriesOff
  const points = Math.round((tours + stays) * 0.15)
  const hasCar = lines.some((line) => line.choice.ride.mode === "car")
  const estimates = lines.filter((line) => line.choice.ride.estimate).length
  return {
    lines,
    tours,
    stays,
    rides,
    subscriptionOff,
    seriesOff,
    due,
    points,
    hasCar,
    completed,
    estimates,
  }
}

export function expertInSeason(season: Season, picks: Save["picks"]) {
  return season.stops.filter((stop) => choiceOf(stop, picks)?.fits).length
}

export function progressOf(season: Season, picks: Save["picks"]) {
  const done = season.stops.filter((stop) => picks[stop.id]).length
  return { done, total: season.stops.length }
}

export function nextStop(season: Season, picks: Save["picks"]) {
  return season.stops.find((stop) => !picks[stop.id]) ?? null
}

export function tasteOf(save: Save) {
  const counts = new Map<string, number>()
  for (const season of seasons) {
    for (const stop of season.stops) {
      const choice = choiceOf(stop, save.picks)
      if (!choice) continue
      for (const tag of choice.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

export function weekendNights(save: Save) {
  const quote = buildQuote(save)
  const ranked = [...quote.lines].sort((a, b) => {
    if (a.choice.fits !== b.choice.fits) return a.choice.fits ? -1 : 1
    return a.choice.stay.price - b.choice.stay.price
  })
  const keep = new Set(ranked.slice(0, 2).map((line) => line.stop.id))
  const nights: Record<string, boolean> = {}
  for (const line of quote.lines) nights[line.stop.id] = keep.has(line.stop.id)
  return nights
}

export function makeDemo(kind: "near" | "series"): Save {
  const save = emptySave()
  const ids = kind === "series" ? ["near", "baltic"] : ["near"]
  for (const season of seasons) {
    if (!ids.includes(season.id)) continue
    for (const stop of season.stops) {
      const choice = featuredChoice(stop)
      save.picks[stop.id] = choice.id
      save.sources[stop.id] = "game"
      save.nights[stop.id] = true
    }
  }
  save.subscription = true
  save.morning = 2
  save.daily = dateKey()
  return save
}

export function newApplication(quote: Quote): Application {
  const seasonNames = [...new Set(quote.lines.map((line) => line.season.name))]
  return {
    id: `zayavka-${Date.now()}`,
    at: new Date().toISOString(),
    stopIds: quote.lines.map((line) => line.stop.id),
    total: quote.due,
    points: quote.points,
    seasons: seasonNames,
  }
}

export const sourceLabel: Record<Source, string> = {
  game: "из игры",
  catalog: "из каталога",
  hotel: "со страницы ночей",
  road: "со страницы дороги",
}
