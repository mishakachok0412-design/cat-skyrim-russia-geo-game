export type Tag = "руки" | "вкус" | "звери" | "вода" | "дорога" | "ферма"

export type RideMode = "car" | "train" | "transfer" | "local"

export type Motif =
  | "cheese"
  | "honey"
  | "clay"
  | "fish"
  | "dune"
  | "fortress"
  | "bread"
  | "deer"
  | "grape"
  | "mountain"
  | "horse"
  | "lotus"
  | "linen"
  | "pattern"
  | "pond"

export type Choice = {
  id: string
  title: string
  text: string
  fits: boolean
  tags: Tag[]
  tour: { title: string; price: number; time: string }
  stay: { title: string; price: number; kind: string }
  ride: { title: string; price: number; mode: RideMode; estimate?: boolean }
}

export type Stop = {
  id: string
  region: string
  place: string
  short: string
  stamp: string
  motif: Motif
  lon: number
  lat: number
  story: string
  after: string
  choices: Choice[]
}

export type Season = {
  id: string
  name: string
  reach: string
  character: string
  blurb: string
  postcard: string
  stops: Stop[]
}

export type Source = "game" | "catalog" | "hotel" | "road"

export type Application = {
  id: string
  at: string
  stopIds: string[]
  total: number
  points: number
  seasons: string[]
}

export type Save = {
  picks: Record<string, string>
  sources: Record<string, Source>
  nights: Record<string, boolean>
  subscription: boolean
  daily: string | null
  morning: number
  applications: Application[]
}

export type View = "play" | "catalog" | "hotels" | "roads" | "album" | "journal" | "card"
