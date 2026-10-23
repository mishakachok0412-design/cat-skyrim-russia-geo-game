import { useEffect, useRef } from "react"
import { cx, formatWhen, rub } from "../format"
import { useGame } from "../game"
import { sourceLabel } from "../logic"

export function RouteDrawer() {
  const game = useGame()
  const closeRef = useRef<HTMLButtonElement>(null)

  const open = game.routeOpen
  const closeRoute = useRef(game.setRouteOpen)
  useEffect(() => {
    closeRoute.current = game.setRouteOpen
  })
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRoute.current(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (!game.routeOpen) return null
  const quote = game.quote

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-deep/40" onClick={() => game.setRouteOpen(false)}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-title"
        className="flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-forest uppercase">Конструктор</p>
            <h2 id="route-title" className="font-display text-2xl">
              Маршрут
            </h2>
          </div>
          <button ref={closeRef} type="button" className="btn btn-ghost px-3 py-2" onClick={() => game.setRouteOpen(false)}>
            Закрыть
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {game.confirm ? (
            <Confirmation />
          ) : quote.lines.length === 0 ? (
            <div>
              <p className="text-sm leading-relaxed">
                Пока пусто. Соберите остановку — тур, ночь и дорога лягут сюда одной пачкой, как по кнопке «В маршрут» в конструкторе путешествий.
              </p>
              <button type="button" className="btn btn-primary mt-4" onClick={() => game.loadDemo("near")}>
                Показать пример выходных
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {quote.lines.map((line) => (
                <article key={line.stop.id} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{line.stop.short}</h3>
                    <button type="button" className="text-xs font-semibold text-clay" onClick={() => game.removeStop(line.stop.id)}>
                      Убрать
                    </button>
                  </div>
                  <p className="text-xs text-muted">{line.season.name} · {sourceLabel[line.source]}</p>
                  <p className="mt-2">Тур · {line.choice.tour.title} · {rub(line.choice.tour.price)}</p>
                  <label className="mt-1 flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={line.night}
                      onChange={() => game.toggleNight(line.stop.id)}
                    />
                    <span>
                      Ночь · {line.choice.stay.title}
                      <span className="block text-xs text-muted">
                        {line.choice.stay.kind} · {line.night ? rub(line.choice.stay.price) : "не включать"}
                      </span>
                    </span>
                  </label>
                  <p className="mt-1">
                    Дорога · {line.choice.ride.title} · {rub(line.choice.ride.price, line.choice.ride.estimate)}
                  </p>
                </article>
              ))}
              <button type="button" className="btn btn-ghost w-full" onClick={game.applyWeekendNights}>
                Короткие выходные: оставить 2 ночи
              </button>
            </div>
          )}
        </div>
        {quote.lines.length > 0 && !game.confirm ? (
          <div className="border-t border-line bg-white px-5 py-4">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={game.save.subscription}
                onChange={(event) => game.setSubscription(event.target.checked)}
              />
              <span>
                Есть подписка «Всё Своё»
                <span className="block text-xs text-muted">На карточках каталога тур с ней дешевле на 10%.</span>
              </span>
            </label>
            <dl className="mt-3 space-y-1 text-sm">
              <Row label="Туры" value={rub(quote.tours)} />
              <Row label="Ночи" value={rub(quote.stays)} />
              <Row label="Дорога" value={rub(quote.rides)} />
              {quote.subscriptionOff > 0 ? <Row label="Подписка, −10% туров" value={`−${rub(quote.subscriptionOff)}`} /> : null}
              {quote.seriesOff > 0 ? <Row label="Серия из двух троп, −5% туров" value={`−${rub(quote.seriesOff)}`} /> : null}
              <Row label="К заявке" value={rub(quote.due)} strong />
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Прогноз {quote.points.toLocaleString("ru-RU")} баллов при оплате картой РСХБ: 15% от туров и включённых ночей. Баллами бронь не оплатить — ими возвращают деньги после оплаты, 1 балл = 1 ₽, один раз за 60 дней.
              {quote.hasCar ? " Машина — оценка дороги. До 1 200 бонусов BelkaCar в этот чек не входят." : ""}
              {" "}Цены учебные, предоплаты нет.
            </p>
            <button type="button" className="btn btn-amber mt-4 w-full" onClick={game.submit}>
              Оформить заявку
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cx("flex justify-between gap-3", strong && "font-display text-base font-semibold")}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Confirmation() {
  const game = useGame()
  const application = game.confirm
  if (!application) return null
  const done = game.quote.completed
  return (
    <div>
      <p className="font-display text-2xl leading-tight">Заявка без предоплаты</p>
      <p className="mt-3 text-sm leading-relaxed">
        В прототипе никто не перезванивает. На платформе после такой заявки специалист уточняет даты и может выкинуть лишнюю экскурсию. Оплата — отдельно, картой.
      </p>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between gap-3"><dt>Сумма</dt><dd>{rub(application.total)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Прогноз баллов</dt><dd>{application.points}</dd></div>
        <div className="flex justify-between gap-3"><dt>Когда</dt><dd>{formatWhen(application.at)}</dd></div>
      </dl>
      <p className="mt-3 text-sm leading-relaxed">
        Сезоны в заявке: {application.seasons.join(", ") || "—"}. Остановки остаются в альбоме.
      </p>
      {done > 0 ? (
        <div className="mt-4 rounded-2xl bg-[#e7f2ea] px-4 py-3 text-sm leading-relaxed">
          <p className="font-bold">Открытка через три дня</p>
          <p className="mt-1">
            Сезон собран, поэтому возврат уже назначен: спросить, как прошла поездка, и открыть соседнюю пустую марку. В прототипе открытка лежит в журнале, на платформе это было бы письмо или пуш.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed">
          Сезон ещё не собран. Заявка уже возможна с одной остановки — пустые марки остаются причиной вернуться, а не штрафом.
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            game.clearConfirm()
            game.setRouteOpen(false)
            game.setView("album")
          }}
        >
          В альбом
        </button>
        <button type="button" className="btn btn-ghost" onClick={game.clearConfirm}>
          Править маршрут
        </button>
      </div>
    </div>
  )
}
