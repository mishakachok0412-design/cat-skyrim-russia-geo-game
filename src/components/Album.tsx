import { seasons } from "../data"
import { overview } from "../geo"
import { formatWhen, plural } from "../format"
import { useGame } from "../game"
import { choiceOf, expertInSeason, progressOf } from "../logic"
import { MapBoard } from "./MapBoard"
import { Motif } from "./Motif"

export function Album() {
  const game = useGame()
  const collected = Object.keys(game.save.picks).length
  const experts = seasons.reduce((sum, season) => sum + expertInSeason(season, game.save.picks), 0)

  return (
    <div>
      <h2 className="font-display text-3xl">Альбом марок</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Марки не сгорают. Пустая точка — причина открыть карту снова. Утренние марки не покупают тур: это короткий повод зайти без заявки.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Регионы" value={String(collected)} hint={`из ${seasons.length * 4}`} />
        <Stat label="Знатоки" value={String(experts)} hint="совпали с характером" />
        <Stat label="Утро" value={String(game.save.morning)} hint={plural(game.save.morning, "марка", "марки", "марок")} />
      </div>
      <div className="mt-4">
        <MapBoard
          frame={overview}
          nudge={false}
          markers={seasons.flatMap((season) =>
            season.stops.map((stop) => {
              const choice = choiceOf(stop, game.save.picks)
              return {
                id: stop.id,
                lon: stop.lon,
                lat: stop.lat,
                label: stop.short,
                tone: !choice ? "idle" : choice.fits ? "expert" : "done",
              }
            }),
          )}
          onPick={(id) => {
            const season = seasons.find((item) => item.stops.some((stop) => stop.id === id))
            if (!season) return
            game.setSeasonId(season.id)
            game.setStopId(id)
            game.setView("play")
          }}
          caption="Вся игровая карта. Близкие точки на общем масштабе слипаются — список ниже точнее."
        />
      </div>
      {game.taste.length > 0 ? (
        <div className="mt-4 rounded-3xl bg-white px-4 py-4">
          <h3 className="font-semibold">Что уже видно по выбору</h3>
          <p className="mt-1 text-sm text-muted">
            Платформа и так поднимает карточки по интересу. Марки делают интерес прямым, а не догадкой по кликам.
          </p>
          <ul className="mt-3 space-y-2">
            {game.taste.map((item) => (
              <li key={item.tag} className="grid grid-cols-[88px_1fr_auto] items-center gap-2 text-sm">
                <span>{item.tag}</span>
                <span className="h-2 overflow-hidden rounded-full bg-[#e7e1d4]">
                  <span className="block h-full bg-forest" style={{ width: `${Math.min(100, item.count * 25)}%` }} />
                </span>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">Марок пока нет. Первая появится, когда остановка ляжет в маршрут.</p>
      )}
      <div className="mt-4 grid gap-4">
        {seasons.map((season) => {
          const progress = progressOf(season, game.save.picks)
          return (
            <section key={season.id}>
              <h3 className="font-semibold">
                {season.name} · {progress.done}/{progress.total}
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {season.stops.map((stop) => {
                  const choice = choiceOf(stop, game.save.picks)
                  return (
                    <button
                      key={stop.id}
                      type="button"
                      onClick={() => {
                        game.setSeasonId(season.id)
                        game.setStopId(stop.id)
                        game.setView("play")
                      }}
                      className="rounded-3xl border border-line bg-white p-3 text-center"
                    >
                      <span className={choice ? (choice.fits ? "stamp is-expert" : "stamp") : "stamp is-empty"}>
                        <Motif name={stop.motif} className="h-7 w-7" />
                        <span>{choice ? stop.stamp : "пусто"}</span>
                      </span>
                      <span className="mt-2 block text-sm font-semibold">{stop.short}</span>
                      <span className="block text-xs text-muted">
                        {!choice ? "не собрана" : choice.fits ? "знаток тропы" : "марка региона"}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
      {game.save.applications.length > 0 ? (
        <section className="mt-6">
          <h3 className="font-semibold">Заявки</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {game.save.applications.map((item) => (
              <li key={item.id} className="rounded-2xl bg-white px-4 py-3">
                {formatWhen(item.at)} · {item.total.toLocaleString("ru-RU")} ₽ · {item.seasons.join(", ")}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-2xl">{value}</p>
      <p className="text-xs text-muted">{hint}</p>
    </div>
  )
}
