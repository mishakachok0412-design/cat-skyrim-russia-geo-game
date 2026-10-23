import { featuredChoice, seasons } from "../data"
import { rub } from "../format"
import { useGame } from "../game"
import { progressOf } from "../logic"
import { Motif } from "./Motif"

export function Catalog() {
  const game = useGame()
  const season = seasons.find((item) => item.id === game.seasonId) ?? seasons[0]
  const progress = progressOf(season, game.save.picks)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">Туры и хозяйства</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Это не весь каталог платформы. Здесь программы текущего сезона: те же объекты, которые игра кладёт в заявку.
          </p>
        </div>
      </div>
      <aside className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-deep px-5 py-4 text-paper">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] uppercase text-[#f0d48a]">Игра в каталоге</p>
          <p className="mt-1 font-display text-xl">{season.name}</p>
          <p className="text-sm text-[#d7e6dc]">
            В маршруте {progress.done} из {progress.total}. Карточка тура пишет в тот же конструктор, что и карта.
          </p>
        </div>
        <button type="button" className="btn btn-amber" onClick={() => game.setView("play")}>
          Открыть игру
        </button>
      </aside>
      <div className="grid gap-3 sm:grid-cols-2">
        {season.stops.map((stop) => {
          const choice = featuredChoice(stop)
          const picked = game.save.picks[stop.id] === choice.id
          const sub = Math.round(choice.tour.price * 0.9)
          return (
            <article key={stop.id} className="rounded-3xl border border-line bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7f2ea] text-forest">
                  <Motif name={stop.motif} className="h-8 w-8" />
                </span>
                <div>
                  <p className="text-xs text-muted">{stop.region}</p>
                  <h3 className="font-semibold leading-tight">{choice.tour.title}</h3>
                  <p className="text-sm text-muted">{stop.place}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{choice.text}</p>
              <p className="mt-3 font-display text-lg">{rub(choice.tour.price)}</p>
              <p className="text-xs text-muted">
                с подпиской «Всё Своё» {rub(sub)} · +{Math.round((choice.tour.price + choice.stay.price) * 0.15)} баллов за тур и ночь
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => game.selectChoice(stop.id, choice.id, "catalog")}
                >
                  {picked ? "В маршруте" : "В маршрут"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => game.openCard(stop.id)}>
                  Карточка
                </button>
              </div>
            </article>
          )
        })}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Цены учебные. Скидка 10% и доля баллов 15% взяты с публичных карточек каталога, не из тарифа, который обещает этот прототип.
      </p>
    </div>
  )
}

export function TourCard() {
  const game = useGame()
  const found = seasons
    .flatMap((season) => season.stops.map((stop) => ({ season, stop })))
    .find((item) => item.stop.id === game.cardId)

  if (!found) {
    return (
      <div className="panel">
        <p>Карточка не найдена.</p>
        <button type="button" className="btn btn-primary mt-3" onClick={() => game.setView("catalog")}>
          В каталог
        </button>
      </div>
    )
  }

  const { season, stop } = found
  const picked = game.save.picks[stop.id]
  const choice = stop.choices.find((item) => item.id === picked) ?? featuredChoice(stop)
  const sub = Math.round(choice.tour.price * 0.9)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article className="panel">
        <button type="button" className="text-sm font-semibold text-forest" onClick={() => game.setView("catalog")}>
          ← В каталог
        </button>
        <p className="mt-3 text-xs font-bold tracking-[0.16em] text-forest uppercase">{stop.region}</p>
        <h2 className="mt-1 font-display text-3xl leading-tight">{stop.place}</h2>
        <p className="mt-3 text-sm leading-relaxed">{stop.story}</p>
        <div className="mt-4 rounded-2xl bg-[#e7f2ea] px-4 py-3 text-sm leading-relaxed">
          Игровой модуль на карточке. Остановка входит в сезон «{season.name}». Кнопка «В маршрут» пишет в тот же конструктор, что и игра на карте.
        </div>
        <div className="mt-4 grid gap-2">
          {stop.choices.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => game.selectChoice(stop.id, item.id, "catalog")}
              className="choice text-left"
            >
              <span className="font-semibold">{item.title}</span>
              <span className="mt-1 block text-sm text-muted">{item.text}</span>
              {picked === item.id ? <span className="mt-2 inline-block text-xs font-bold text-forest">в маршруте</span> : null}
            </button>
          ))}
        </div>
      </article>
      <aside className="panel h-fit">
        <p className="text-xs text-muted">{choice.tour.time}</p>
        <h3 className="font-semibold">{choice.tour.title}</h3>
        <p className="mt-2 font-display text-2xl">{rub(choice.tour.price)}</p>
        <p className="text-sm text-muted">с подпиской {rub(sub)}</p>
        <p className="mt-3 text-sm">Ночь · {choice.stay.title} · {rub(choice.stay.price)}</p>
        <p className="text-sm">Дорога · {choice.ride.title}</p>
        <button
          type="button"
          className="btn btn-primary mt-4 w-full"
          onClick={() => game.selectChoice(stop.id, choice.id, "catalog")}
        >
          В маршрут
        </button>
        <button
          type="button"
          className="btn btn-ghost mt-2 w-full"
          onClick={() => {
            game.setSeasonId(season.id)
            game.setStopId(stop.id)
            game.setView("play")
          }}
        >
          Играть на карте
        </button>
      </aside>
    </div>
  )
}
