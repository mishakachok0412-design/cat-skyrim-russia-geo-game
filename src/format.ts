export function rub(value: number, approx = false) {
  const formatted = new Intl.NumberFormat("ru-RU").format(Math.round(value))
  return `${approx ? "≈ " : ""}${formatted}\u00a0₽`
}

export function dateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

export function weekendLabel(date = new Date()) {
  const day = date.getDay()
  const untilSaturday = (6 - day + 7) % 7
  const saturday = new Date(date)
  saturday.setDate(date.getDate() + untilSaturday)
  const sunday = new Date(saturday)
  sunday.setDate(saturday.getDate() + 1)
  const month = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(sunday)
  if (saturday.getMonth() === sunday.getMonth()) {
    return `${saturday.getDate()}–${sunday.getDate()} ${month}`
  }
  const left = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(saturday)
  const right = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(sunday)
  return `${left} – ${right}`
}

export function formatWhen(iso: string) {
  const date = new Date(iso)
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

const RIDE: Record<string, string> = {
  car: "Машина",
  train: "Поезд",
  transfer: "Трансфер",
  local: "Электричка",
}

export function rideMode(mode: string) {
  return RIDE[mode] ?? mode
}

export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}
