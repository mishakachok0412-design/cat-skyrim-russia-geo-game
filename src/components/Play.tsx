import { useState } from "react"
import { seasons } from "../data"
import { cx, plural, rub } from "../format"
import { useGame } from "../game"
import { choiceOf, expertInSeason, nextStop, progressOf } from "../logic"
import { MapBoard } from "./MapBoard"
import { Motif } from "./Motif"

export function Play() {
  const game = useGame()
  const season = seasons.find((item) => item.id === game.seasonId) ?? seasons[0]
  const stop = season.stops.find((item) => item.id === game.stopId) ?? null
  const progress = progressOf(season, game.save.picks)
  const upcoming = nextStop(season, game.save.picks)

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
        {seasons.map((item) => {
          const itemProgress = progressOf(item, game.save.picks)
          const active = item.id === season.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => game.setSeasonId(item.id)}
              className={cx("season-pill", active && "is-active")}
              aria-pressed={active}
            >
              <span className="block font-semibold">{item.name}</span>
              <span className="block text-xs opacity-80">
                {item.id === game.weekId ? "эти выходные · " : ""}
                {itemProgress.done}/{itemProgress.total}
              </span>
            </button>
          )
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
      <div className="order-2 lg:order-1">
        <MapBoard
          markers={season.stops.map((item, index) => {
            const choice = choiceOf(item, game.save.picks)
            const tone = !choice
              ? upcoming?.id === item.id
                ? "next"
                : "idle"
              : choice.fits
                ? "expert"
                : "done"
            return {
              id: item.id,
              lon: item.lon,
              lat: item.lat,
              label: item.short,
              n: index + 1,
              tone,
              selected: item.id === stop?.id,
            }
          })}
          onPick={(id) => game.setStopId(id)}
          showInset
          caption="Контур упрощён, точки стоят на своей широте и долготе. Рамка на маленькой карте — где сейчас сезон. Можно идти по номерам, можно открыть любую."
        />
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {season.stops.map((item, index) => {
            const picked = Boolean(game.save.picks[item.id])
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => game.setStopId(item.id)}
                className={cx(
                  "rounded-2xl border px-3 py-2 text-left text-sm",
                  item.id === stop?.id ? "border-forest bg-white" : "border-line bg-paper-2",
                )}
              >
                <span className="text-xs text-muted">{index + 1}</span>
                <span className="mt-0.5 block font-semibold leading-tight">{item.short}</span>
                <span className="text-xs text-forest">{picked ? "в маршруте" : "пусто"}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="order-1 lg:order-2 lg:sticky lg:top-4 lg:self-start">
        {stop ? (
          <Scene key={stop.id} stopId={stop.id} />
        ) : (
          <SeasonPanel
            name={season.name}
            reach={season.reach}
            blurb={season.blurb}
            character={season.character}
            done={progress.done}
            total={progress.total}
            experts={expertInSeason(season, game.save.picks)}
            nextLabel={upcoming?.short ?? null}
            onNext={() => upcoming && game.setStopId(upcoming.id)}
            onRoute={() => game.setRouteOpen(true)}
          />
        )}
      </div>
      </div>
    </div>
  )
}

function SeasonPanel({
  name,
  reach,
  blurb,
  character,
  done,
  total,
  experts,
  nextLabel,
  onNext,
  onRoute,
}: {
  name: string
  reach: string
  blurb: string
  character: string
  done: number
  total: number
  experts: number
  nextLabel: string | null
  onNext: () => void
  onRoute: () => void
}) {
  const complete = done === total
  return (
    <section className="panel">
      <p className="text-xs font-bold tracking-[0.16em] text-forest uppercase">Сезон</p>
      <h2 className="mt-1 font-display text-3xl leading-tight">{name}</h2>
      <p className="mt-1 text-sm text-muted">{reach}</p>
      <p className="mt-4 text-sm leading-relaxed">{blurb}</p>
      <div className="mt-4 rounded-2xl bg-[#e7f2ea] px-4 py-3 text-sm leading-relaxed">
        <span className="font-bold">Характер тропы. </span>
        {character} Совпало — марка «Знаток тропы». Не совпало — региональная марка и заявка всё равно ваши.
      </div>
      <p className="mt-4 text-sm">
        В маршруте {done} {plural(done, "остановка", "остановки", "остановок")} из {total}. Знатоков: {experts}.
      </p>
      {complete ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={onRoute}>
            Сезон собран · открыть заявку
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn-primary mt-4" onClick={onNext}>
          Открыть {nextLabel ? `«${nextLabel}»` : "остановку"}
        </button>
      )}
    </section>
  )
}

function Scene({ stopId }: { stopId: string }) {
  const game = useGame()
  const found = seasons.flatMap((season) => season.stops.map((stop) => ({ season, stop }))).find((item) => item.stop.id === stopId)
  const picked = found ? (game.save.picks[found.stop.id] ?? null) : null
  const [draft, setDraft] = useState<string | null>(picked)

  if (!found) return null
  const { season, stop } = found
  const draftChoice = stop.choices.find((choice) => choice.id === draft) ?? null
  const dirty = Boolean(draft && draft !== picked)

  return (
    <section className="panel" aria-labelledby="scene-title">
      <button type="button" className="text-sm font-semibold text-forest" onClick={() => game.setStopId(null)}>
        ← К сезону
      </button>
      <p className="mt-3 text-xs font-bold tracking-[0.16em] text-forest uppercase">{stop.region}</p>
      <div className="mt-2 flex items-start gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#e7f2ea] text-forest">
          <Motif name={stop.motif} className="h-9 w-9" />
        </span>
        <div>
          <h2 id="scene-title" className="font-display text-2xl leading-tight">
            {stop.place}
          </h2>
          <p className="text-sm text-muted">{season.name}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed">{stop.story}</p>
      <p className="mt-3 text-sm text-muted">
        Характер: {season.character}
      </p>
      <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Как провести остановку">
        {stop.choices.map((choice) => {
          const selected = draft === choice.id
          const saved = picked === choice.id
          return (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setDraft(choice.id)}
              className={cx("choice", selected && "is-selected")}
            >
              <span className="block font-semibold">{choice.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{choice.text}</span>
              <span className="mt-2 block text-xs text-ink">
                тур {rub(choice.tour.price)} · ночь {rub(choice.stay.price)} · дорога{" "}
                {rub(choice.ride.price, choice.ride.estimate)}
              </span>
              {saved ? (
                <span className="mt-2 inline-block rounded-full bg-deep px-2 py-0.5 text-[11px] font-bold text-paper">
                  {choice.fits ? "в маршруте · знаток тропы" : "в маршруте · марка региона"}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      {draftChoice ? (
        <div className="mt-4 rounded-2xl border border-line bg-white px-4 py-3 text-sm">
          <p className="font-bold">В заявку ляжет сразу три строки</p>
          <ul className="mt-2 space-y-1">
            <li>Тур · {draftChoice.tour.title} · {draftChoice.tour.time} · {rub(draftChoice.tour.price)}</li>
            <li>Ночь · {draftChoice.stay.title} · {draftChoice.stay.kind} · {rub(draftChoice.stay.price)}</li>
            <li>
              Дорога · {draftChoice.ride.title} · {rub(draftChoice.ride.price, draftChoice.ride.estimate)}
            </li>
          </ul>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!draft || (!dirty && Boolean(picked))}
          onClick={() => draft && game.selectChoice(stop.id, draft, "game")}
        >
          {!draft ? "Выберите, как провести остановку" : picked && !dirty ? "Уже в маршруте" : picked ? "Заменить в маршруте" : "В маршрут"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => game.setRouteOpen(true)}>
          Открыть конструктор
        </button>
      </div>
      {picked ? <p className="mt-4 text-sm leading-relaxed text-muted">{stop.after}</p> : null}
    </section>
  )
}
