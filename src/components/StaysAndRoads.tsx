import { seasons } from "../data"
import { rideMode, rub } from "../format"
import { useGame } from "../game"
import { choiceOf } from "../logic"
import { MapBoard } from "./MapBoard"

export function Hotels() {
  const game = useGame()
  const season = seasons.find((item) => item.id === game.seasonId) ?? seasons[0]

  return (
    <div>
      <h2 className="font-display text-3xl">Ночи</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Игра не подменяет каталог отелей. Она предлагает ночь рядом с остановкой. С 1 мая 2025 года бронь нельзя оплатить баллами: платите картой, а баллами потом возвращают до 100% суммы, 1 балл = 1 ₽, один раз в течение 60 дней.
      </p>
      <div className="mt-4 grid gap-4">
        {season.stops.map((stop) => (
          <section key={stop.id} className="rounded-3xl border border-line bg-white p-4">
            <h3 className="font-semibold">{stop.place}</h3>
            <p className="text-xs text-muted">{stop.region}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {stop.choices.map((choice) => {
                const active = game.save.picks[stop.id] === choice.id
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => game.selectChoice(stop.id, choice.id, "hotel")}
                    className="choice text-left"
                  >
                    <span className="text-xs uppercase tracking-wide text-muted">{choice.stay.kind}</span>
                    <span className="mt-1 block font-semibold">{choice.stay.title}</span>
                    <span className="mt-1 block text-sm">{rub(choice.stay.price)} за ночь</span>
                    <span className="mt-1 block text-xs text-muted">вместе с туром «{choice.tour.title}»</span>
                    {active ? <span className="mt-2 inline-block text-xs font-bold text-forest">выбрана</span> : null}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export function Roads() {
  const game = useGame()
  const season = seasons.find((item) => item.id === game.seasonId) ?? seasons[0]
  const hasCar = season.stops.some((stop) => stop.choices.some((choice) => choice.ride.mode === "car"))

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div>
        <h2 className="font-display text-3xl">Дорога</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Плечо выбирается вместе с остановкой. Поезд — это железнодорожная витрина платформы, трансфер — машина хозяйства, электричка — ближний ход. Авиа в прототипе нет: для этих точек честнее поезд и дорога.
        </p>
        {hasCar ? (
          <p className="mt-3 rounded-2xl bg-[#e7f2ea] px-4 py-3 text-sm leading-relaxed">
            Если в маршруте есть машина, на платформе к автомаршруту можно приложить до 1 200 бонусов BelkaCar. В чеке прототипа эта сумма не вычитается.
          </p>
        ) : null}
        <div className="mt-4">
          <MapBoard
            nudge={false}
            markers={season.stops.map((stop, index) => {
              const choice = choiceOf(stop, game.save.picks)
              return {
                id: stop.id,
                lon: stop.lon,
                lat: stop.lat,
                label: stop.short,
                n: index + 1,
                tone: choice ? (choice.fits ? "expert" : "done") : "idle",
                selected: false,
              }
            })}
            showInset
            onPick={(id) => {
              game.setStopId(id)
              game.setView("play")
            }}
            caption="Точки сезона. Нажатие открывает остановку в игре."
          />
        </div>
      </div>
      <div className="grid gap-3">
        {season.stops.map((stop) => (
          <section key={stop.id} className="rounded-3xl border border-line bg-white p-4">
            <h3 className="font-semibold">{stop.short}</h3>
            <div className="mt-2 grid gap-2">
              {stop.choices.map((choice) => {
                const active = game.save.picks[stop.id] === choice.id
                return (
                  <button
                    key={choice.id}
                    type="button"
                    className="choice text-left"
                    onClick={() => game.selectChoice(stop.id, choice.id, "road")}
                  >
                    <span className="text-xs font-bold uppercase tracking-wide text-forest">
                      {rideMode(choice.ride.mode)}
                    </span>
                    <span className="mt-1 block text-sm">{choice.ride.title}</span>
                    <span className="mt-1 block text-sm">{rub(choice.ride.price, choice.ride.estimate)}</span>
                    {active ? <span className="mt-1 inline-block text-xs font-bold text-forest">в маршруте</span> : null}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
