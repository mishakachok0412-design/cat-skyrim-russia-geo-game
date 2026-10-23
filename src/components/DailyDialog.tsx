import { useEffect, useState } from "react"
import { morningFacts } from "../data"
import { useGame } from "../game"

const todayFact = morningFacts[new Date().getDate() % morningFacts.length]

export function DailyDialog() {
  const game = useGame()
  const [fact, setFact] = useState<string | null>(null)
  const open = game.dailyOpen

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFact(null)
        game.setDailyOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, game])

  if (!game.dailyOpen) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-deep/40 p-4" onClick={() => game.setDailyOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-title"
        className="w-full max-w-md rounded-3xl bg-paper p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-bold tracking-[0.16em] text-forest uppercase">Утренняя марка</p>
        <h2 id="daily-title" className="mt-1 font-display text-2xl">
          {fact ? "Марка в альбоме" : "Один заход без покупки"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed">{fact ?? todayFact}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {fact ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFact(null)
                game.setDailyOpen(false)
              }}
            >
              Хорошо
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setFact(game.claimDaily())}>
              Забрать марку
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setFact(null)
              game.setDailyOpen(false)
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
