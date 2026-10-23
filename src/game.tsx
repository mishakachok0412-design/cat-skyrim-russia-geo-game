import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { morningFacts, seasons, weekSeasonId } from "./data"
import { dateKey } from "./format"
import {
  buildQuote,
  completedSeasons,
  emptySave,
  makeDemo,
  newApplication,
  sanitize,
  tasteOf,
  weekendNights,
} from "./logic"
import type { Application, Save, Source, View } from "./types"

const KEY = "svoya-tropa-v1"

type Demo = "demo" | "demo-route" | "demo-album" | "demo-series"

function readHash() {
  const raw = window.location.hash.replace("#", "")
  if (raw.startsWith("card-")) {
    return { view: "card" as View, card: raw.slice(5), demo: null as Demo | null }
  }
  if (raw === "demo" || raw === "demo-route" || raw === "demo-album" || raw === "demo-series") {
    const view: View = raw === "demo-album" ? "album" : "play"
    return { view, card: null, demo: raw }
  }
  const views: View[] = ["play", "catalog", "hotels", "roads", "album", "journal", "card"]
  if (views.includes(raw as View)) return { view: raw as View, card: null, demo: null }
  return { view: "play" as View, card: null, demo: null }
}

function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptySave()
    return sanitize(JSON.parse(raw) as Partial<Save>)
  } catch {
    return emptySave()
  }
}

type GameApi = {
  save: Save
  view: View
  setView: (view: View) => void
  seasonId: string
  setSeasonId: (id: string) => void
  weekId: string
  stopId: string | null
  setStopId: (id: string | null) => void
  cardId: string | null
  openCard: (id: string) => void
  routeOpen: boolean
  setRouteOpen: (open: boolean) => void
  dailyOpen: boolean
  setDailyOpen: (open: boolean) => void
  confirm: Application | null
  clearConfirm: () => void
  storageNote: string | null
  toast: string | null
  quote: ReturnType<typeof buildQuote>
  taste: ReturnType<typeof tasteOf>
  dailyAvailable: boolean
  selectChoice: (stopId: string, choiceId: string, source: Source) => void
  removeStop: (stopId: string) => void
  toggleNight: (stopId: string) => void
  applyWeekendNights: () => void
  setSubscription: (value: boolean) => void
  claimDaily: () => string
  submit: () => void
  reset: () => void
  loadDemo: (kind: "near" | "series") => void
}

const GameContext = createContext<GameApi | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const initial = readHash()
  const [save, setSave] = useState<Save>(() => {
    if (initial.demo === "demo-series") return makeDemo("series")
    if (initial.demo) return makeDemo("near")
    return loadSave()
  })
  const [view, setViewState] = useState<View>(initial.view)
  const [seasonId, setSeasonId] = useState(() => (initial.demo ? "near" : weekSeasonId()))
  const [stopId, setStopId] = useState<string | null>(null)
  const [cardId, setCardId] = useState<string | null>(initial.card)
  const [routeOpen, setRouteOpen] = useState(initial.demo === "demo-route" || initial.demo === "demo-series")
  const [dailyOpen, setDailyOpen] = useState(false)
  const [confirm, setConfirm] = useState<Application | null>(null)
  const [storageNote, setStorageNote] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const weekId = weekSeasonId()

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(save))
      setStorageNote(null)
    } catch {
      setStorageNote(
        "Браузер не сохранил прогресс. В этой вкладке игра работает, после закрытия марки пропадут.",
      )
    }
  }, [save])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const onHash = () => {
      const next = readHash()
      setViewState(next.view)
      if (next.card) setCardId(next.card)
      if (next.demo === "demo-route" || next.demo === "demo-series") setRouteOpen(true)
      if (next.demo) {
        setSave(makeDemo(next.demo === "demo-series" ? "series" : "near"))
        setSeasonId("near")
      }
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  const writeHash = (nextView: View, nextCard: string | null) => {
    const hash = nextView === "card" && nextCard ? `#card-${nextCard}` : `#${nextView}`
    if (window.location.hash !== hash) history.replaceState(null, "", hash)
  }

  const quote = useMemo(() => buildQuote(save), [save])
  const taste = useMemo(() => tasteOf(save), [save])
  const dailyAvailable = save.daily !== dateKey()

  const api: GameApi = {
    save,
    view,
    setView: (next) => {
      setViewState(next)
      setRouteOpen(false)
      setConfirm(null)
      writeHash(next, cardId)
    },
    seasonId,
    setSeasonId: (id) => {
      setSeasonId(id)
      setStopId(null)
    },
    weekId,
    stopId,
    setStopId,
    cardId,
    openCard: (id) => {
      setCardId(id)
      setViewState("card")
      writeHash("card", id)
    },
    routeOpen,
    setRouteOpen,
    dailyOpen,
    setDailyOpen,
    confirm,
    clearConfirm: () => setConfirm(null),
    storageNote,
    toast,
    quote,
    taste,
    dailyAvailable,
    selectChoice: (stopId, choiceId, source) => {
      const found = seasons.flatMap((season) => season.stops).find((stop) => stop.id === stopId)
      setSave((current) => ({
        ...current,
        picks: { ...current.picks, [stopId]: choiceId },
        sources: { ...current.sources, [stopId]: source },
        nights: {
          ...current.nights,
          [stopId]: current.nights[stopId] ?? true,
        },
      }))
      setToast(found ? `В маршруте: ${found.short}` : "Остановка в маршруте")
    },
    removeStop: (id) => {
      setSave((current) => {
        const picks = { ...current.picks }
        const sources = { ...current.sources }
        const nights = { ...current.nights }
        delete picks[id]
        delete sources[id]
        delete nights[id]
        return { ...current, picks, sources, nights }
      })
    },
    toggleNight: (id) => {
      setSave((current) => ({
        ...current,
        nights: { ...current.nights, [id]: current.nights[id] === false },
      }))
    },
    applyWeekendNights: () => {
      setSave((current) => {
        if (Object.keys(current.picks).length === 0) return current
        return { ...current, nights: weekendNights(current) }
      })
      setToast("Для коротких выходных оставлены не больше двух ночей")
    },
    setSubscription: (subscription) => setSave((current) => ({ ...current, subscription })),
    claimDaily: () => {
      const fact = morningFacts[new Date().getDate() % morningFacts.length]
      setSave((current) => ({ ...current, daily: dateKey(), morning: current.morning + 1 }))
      return fact
    },
    submit: () => {
      if (quote.lines.length === 0) return
      const application = newApplication(quote)
      const done = completedSeasons(save).map((season) => season.id)
      setSave((current) => ({
        ...current,
        applications: [application, ...current.applications].slice(0, 12),
      }))
      setConfirm(application)
      if (done.length > 0) {
        setToast("Заявка записана. Сезон остаётся в альбоме")
      }
    },
    reset: () => {
      setSave(emptySave())
      setStopId(null)
      setConfirm(null)
      setRouteOpen(false)
      setToast("Прототип очищен")
    },
    loadDemo: (kind) => {
      setSave(makeDemo(kind))
      setSeasonId("near")
      setStopId(null)
      setViewState("play")
      writeHash("play", null)
      setRouteOpen(true)
      setToast(kind === "series" ? "Собраны две тропы" : "Собран сезон ближних выходных")
    },
  }

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error("Игра не подключена")
  return ctx
}
