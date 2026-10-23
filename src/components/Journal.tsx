import type { ReactNode } from "react"
import { seasons } from "../data"
import { weekendLabel } from "../format"
import { useGame } from "../game"
import { completedSeasons } from "../logic"

export function Journal() {
  const game = useGame()
  const done = completedSeasons(game.save)
  const posted = done.filter((season) =>
    game.save.applications.some((application) =>
      application.stopIds.some((id) => season.stops.some((stop) => stop.id === id)),
    ),
  )

  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-xs font-bold tracking-[0.16em] text-forest uppercase">Журнал решения</p>
      <h2 className="mt-1 font-display text-3xl leading-tight">Своя тропа</h2>
      <p className="mt-3 text-sm leading-relaxed">
        Сезонная игра на карте России внутри «Своё за городом». За несколько минут человек собирает поездку по хозяйствам. Каждый выбор кладёт в конструктор путешествий три вещи, которые платформа уже продаёт: тур, ночь и дорогу. В конце — заявка без предоплаты.
      </p>

      <Section title="Что взято из сервиса">
        <p>
          Платформа — агрегатор сельских туров: день на ферме, мастерские, дегустации, животные, многодневные маршруты. Рядом живут конструктор путешествий, отели, ж/д и авиа, автомаршруты, баллы РСХБ и подписка «Всё Своё». Игровые викторины там уже есть, поэтому ещё одна викторина задачу не закрывает.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Кнопка «В маршрут» собирает экскурсии в одну заявку. Предоплаты нет, лишнее можно убрать после звонка специалиста.</li>
          <li>На публичных карточках тур с подпиской «Всё Своё» дешевле на 10%, а рядом написано около 15% баллами.</li>
          <li>С 1 мая 2025 года баллы не оплачивают бронь. Ими возвращают деньги после оплаты: 1 балл = 1 ₽, один раз, в течение 60 дней.</li>
          <li>К автомаршрутам BelkaCar добавляет до 1 200 бонусов. Это не скидка тура.</li>
          <li>Карточки туров уже сортируют по интересу. Марка в игре делает интерес прямым.</li>
        </ul>
      </Section>

      <Section title="Цель">
        <p>
          Довести человека от «хочу за город» до заявки на конкретные хозяйства и оставить причину вернуться, даже если он сегодня ничего не бронирует. Игра встроена в витрины, а не висит отдельным сайтом.
        </p>
      </Section>

      <Section title="Правила">
        <ul className="list-disc space-y-1 pl-5">
          <li>Сезон — четыре остановки. Идти можно по номерам или с любой точки.</li>
          <li>На остановке три способа провести время. Тупиков нет: любой выбор едет в заявку.</li>
          <li>У сезона есть характер. Совпал — марка «Знаток тропы». Не совпал — марка региона.</li>
          <li>Кнопка «В маршрут» добавляет тур, ночь и дорогу. Ночь можно снять, не теряя тур. Есть пресет «две ночи», если поездка короткая.</li>
          <li>Заявку можно отправить с одной остановки. Четыре — это цель сезона, не порог оплаты.</li>
          <li>Утренняя марка — один заход в день. Она не даёт банковские баллы.</li>
          <li>Две собранные тропы включают серию: в чеке появляется −5% на туры поверх подписки. Это механика прототипа, не акция банка.</li>
        </ul>
      </Section>

      <Section title="Сценарии">
        <div className="space-y-3">
          {seasons.map((season) => (
            <div key={season.id} className="rounded-2xl bg-white px-4 py-3">
              <h3 className="font-semibold">{season.name}</h3>
              <p className="text-sm text-muted">{season.reach}</p>
              <p className="mt-1 text-sm leading-relaxed">{season.blurb}</p>
              <p className="mt-1 text-sm">
                <span className="font-semibold">Характер. </span>
                {season.character}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Связь с картой, маршрутом, отелем и дорогой">
        <ul className="list-disc space-y-1 pl-5">
          <li>Карта сезона — тот же контур. Точки стоят на широте и долготе хозяйств, не на случайной сетке.</li>
          <li>Каталог, карточка тура, страница ночей и страница дороги пишут в один маршрут. Источник строки виден в конструкторе: из игры, из каталога, со страницы ночей или дороги.</li>
          <li>Отель не оплачивается баллами. В чеке это прогноз возврата, с той же оговоркой, что в справке платформы.</li>
          <li>Поезд, электричка, трансфер и машина — разные плечи. Машина помечена как оценка, не тариф.</li>
          <li>Заявка повторяет конструктор: без предоплаты, с правом убрать лишнее.</li>
        </ul>
      </Section>

      <Section title="Почему возвращаются и планируют поездку">
        <ul className="list-disc space-y-1 pl-5">
          <li>Сезон этих выходных ({weekendLabel()}) — повод открыть сервис в конце недели. В бою новый сезон приходил бы в субботу. В прототипе открыты все четыре, иначе сценарии нельзя посмотреть за один заход.</li>
          <li>Пустые марки видны в альбоме. Это недособранная карта, а не сгоревшие очки.</li>
          <li>Утренняя марка даёт заход без покупки.</li>
          <li>После заявки по собранному сезону назначается открытка через три дня: спросить, как прошло, и показать соседнюю точку.</li>
          <li>Серия из двух троп чуть удешевляет туры и тянет во второй сезон.</li>
          <li>Можно забронировать одну остановку и уйти. Несобранный сезон остаётся, штраф за раннюю заявку не нужен.</li>
        </ul>
        {posted.length > 0 ? (
          <div className="mt-3 space-y-2">
            {posted.map((season) => (
              <div key={season.id} className="rounded-2xl bg-[#e7f2ea] px-4 py-3 text-sm leading-relaxed">
                <p className="font-semibold">Открытка · {season.name}</p>
                <p className="mt-1">{season.postcard}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Открытка появится здесь, когда сезон будет собран и заявка отправлена.
          </p>
        )}
      </Section>

      <Section title="Что нажать">
        <ol className="list-decimal space-y-1 pl-5">
          <li>На карте открыть остановку и нажать «В маршрут».</li>
          <li>То же самое сделать из каталога, с карточки тура, со страницы ночей или дороги — конструктор один.</li>
          <li>Снять лишнюю ночь или оставить две.</li>
          <li>Включить подписку и отправить заявку.</li>
          <li>Забрать утреннюю марку и открыть альбом.</li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => game.loadDemo("near")}>
            Собрать ближние выходные
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => game.loadDemo("series")}>
            Собрать две тропы
          </button>
          <button type="button" className="btn btn-ghost" onClick={game.reset}>
            Очистить прототип
          </button>
        </div>
      </Section>

      <Section title="Границы прототипа">
        <p>
          Цены учебные. Оплаты, личного кабинета и живых остатков номеров нет. Контур России упрощён. Авиа не собрана. Сезоны не закрываются по календарю. Скидка серии не является акцией банка.
        </p>
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </section>
  )
}
