import { weekendLabel } from "../format"
import { useGame } from "../game"
import { Album } from "./Album"
import { Catalog, TourCard } from "./Catalog"
import { DailyDialog } from "./DailyDialog"
import { Journal } from "./Journal"
import { Play } from "./Play"
import { RouteDrawer } from "./RouteDrawer"
import { Hotels, Roads } from "./StaysAndRoads"
import type { View } from "../types"

const nav: Array<{ id: View; label: string }> = [
  { id: "catalog", label: "Туры" },
  { id: "hotels", label: "Отели" },
  { id: "roads", label: "Автомаршруты" },
  { id: "play", label: "Игра" },
]

export function Shell() {
  const game = useGame()
  const count = game.quote.lines.length

  return (
    <div className="min-h-screen bg-[#d5e3d8] text-ink">
      <a href="#game" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-paper focus:px-3 focus:py-2">
        К игре
      </a>
      <div className="mx-auto min-h-screen max-w-6xl bg-paper sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:rounded-[28px] sm:shadow-[0_20px_60px_rgba(20,48,40,0.12)]">
        <header className="bg-deep text-paper sm:rounded-t-[28px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
            <button
              type="button"
              className="font-display text-sm whitespace-nowrap"
              onClick={() => game.setView("play")}
            >
              Своё за городом
            </button>
            <nav className="flex flex-wrap gap-1 text-sm" aria-label="Разделы прототипа">
              {nav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => game.setView(item.id)}
                  className={game.view === item.id ? "nav-link is-active" : "nav-link"}
                  aria-current={game.view === item.id ? "page" : undefined}
                >
                  {item.label}
                </button>
              ))}
              <button type="button" className="nav-link" onClick={() => game.setRouteOpen(true)}>
                Конструктор{count > 0 ? ` · ${count}` : ""}
              </button>
            </nav>
          </div>
        </header>
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-forest uppercase">
              Прототип виджета · выходные {weekendLabel()}
            </p>
            <h1 className="font-display text-3xl leading-none sm:text-4xl">Своя тропа</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Сезон на карте собирает тур, ночь и дорогу в одну заявку конструктора путешествий.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={!game.dailyAvailable}
              onClick={() => game.setDailyOpen(true)}
            >
              {game.dailyAvailable ? "Утренняя марка" : "Марка сегодня есть"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => game.setView("album")}>
              Альбом
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => game.setView("journal")}>
              Журнал
            </button>
            <button type="button" className="btn btn-primary" onClick={() => game.setRouteOpen(true)}>
              Маршрут{count > 0 ? ` · ${count}` : ""}
            </button>
          </div>
        </div>
        {game.storageNote ? (
          <p className="mx-4 mb-3 rounded-2xl bg-[#f8e7df] px-4 py-3 text-sm sm:mx-6" role="status">
            {game.storageNote}
          </p>
        ) : null}
        <main id="game" className="px-4 pb-8 sm:px-6">
          {game.view === "play" ? <Play /> : null}
          {game.view === "catalog" ? <Catalog /> : null}
          {game.view === "card" ? <TourCard /> : null}
          {game.view === "hotels" ? <Hotels /> : null}
          {game.view === "roads" ? <Roads /> : null}
          {game.view === "album" ? <Album /> : null}
          {game.view === "journal" ? <Journal /> : null}
        </main>
        <footer className="border-t border-line px-4 py-4 text-xs leading-relaxed text-muted sm:px-6">
          Учебный прототип кейса «Игра для платформы Своё за городом». Не сайт банка и не оферта. Цифры скидки и баллов сверены с публичными карточками svoe-zagorodom.ru.
        </footer>
      </div>
      <RouteDrawer />
      <DailyDialog />
      {game.toast ? (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-50 max-w-[min(92vw,28rem)] -translate-x-1/2 rounded-full bg-deep px-4 py-2 text-center text-sm text-paper shadow-lg"
        >
          {game.toast}
        </div>
      ) : null}
    </div>
  )
}
