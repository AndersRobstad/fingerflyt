# Fingerflyt

A touch-typing trainer for the Norwegian PC and US QWERTY keyboard layouts.
For every character you're about to type, the app shows in real time which
finger should press it, and tracks your progress over time — accuracy,
speed, and which hand is doing the work.

The app chrome (navigation, settings, buttons) is in Norwegian bokmål
regardless of layout; code, comments and this README are in English.

## Stack

- SvelteKit + TypeScript (strict), deployed with `@sveltejs/adapter-vercel`.
- Tailwind CSS v4, with a small local component library (`src/lib/components`)
  built on headless [bits-ui](https://bits-ui.com) primitives, so every
  interactive control (switches, dialogs, segmented controls, tooltips) looks
  and behaves consistently.
- Charts (`src/lib/charts`) are hand-built SVG, using `d3-scale`/`d3-shape`
  for the math — no heavyweight charting library.
- Vitest for unit tests on the pure logic: the character → key/finger
  mapping, the stats calculations, and the storage migrations.

## Running locally

```sh
npm install
npm run dev          # start the dev server
npm run dev -- --open
```

Other scripts:

```sh
npm run check   # svelte-check (TypeScript)
npm run lint    # prettier --check + eslint
npm run format  # prettier --write
npm run test    # vitest, once
npm run build   # production build
npm run preview # preview the production build locally
```

## Deploying

The project is set up for [Vercel](https://vercel.com) via
`@sveltejs/adapter-vercel`. Link the GitHub repository to a Vercel project and
pushes to `main` will deploy automatically — no extra configuration needed.

CI (`.github/workflows/ci.yml`) runs lint, type check, unit tests and a
production build on every push and pull request against `main`.

## Data model

Version 1 has **no backend** — everything lives in the browser's
`localStorage`, under a single versioned key (`fingerflyt:v1`). Every read and
write is wrapped in `try`/`catch`, so the app keeps working even if storage is
empty, corrupted, or unavailable (e.g. private browsing).

The persisted shape (`src/lib/storage/types.ts`):

```ts
interface StoreData {
	version: 1;
	chars: Record<string, { attempts: number; misses: number; latencyMs: number }>;
	sessions: SessionRecord[]; // start time, duration, mode, wpm, accuracy, keystrokes, top misses
	settings: Settings; // show keyboard/hands, strict mode, layout, theme
}
```

- **Per character**, the app aggregates attempts, misses and summed latency.
  Per-finger and per-key stats (used by the progress page's table and
  keyboard heatmap) are derived from this on the fly via the character → key
  mapping for the active layout — they aren't stored separately.
- **Per session** (starts at the first keystroke, ends after 30s of
  inactivity, a mode switch, or the tab being hidden), the app stores a
  summary record: duration, mode, WPM, accuracy, keystrokes and the top 5
  missed characters.
- Data access goes through a small `ProgressStore` interface
  (`src/lib/storage/types.ts`) with a `LocalStorageAdapter` implementation
  (`src/lib/storage/local-storage-adapter.ts`). A future backend (Supabase,
  Vercel Postgres, ...) can implement the same interface without touching the
  rest of the app.
- `src/lib/storage/migrations.ts` turns whatever was read from storage —
  missing, corrupt, or from an older version — into a valid current-version
  `StoreData`, via a per-version step registry. It never throws.

Export, import and reset are available on the `/fremgang` (progress) page.
Export/import round-trip through the same JSON shape as `localStorage`.

## Keyboard layouts

Each layout lives as typed data: the Norwegian PC (ISO) layout in
`src/lib/layouts/no-pc.ts`, the US QWERTY (ANSI) layout in
`src/lib/layouts/us-qwerty.ts` — each key's base/shift/AltGr characters, its
correct finger, and its visual width. `src/lib/layouts/index.ts` is a small
registry keyed by layout id, so a further layout (a Norwegian Mac layout, for
instance) can be added later as one more data file plus an entry in the
settings picker, without touching the trainer engine, stats, or
content-generation logic. `layoutLanguage()` maps each layout to the practice
language it pulls content in (`no-pc` → Norwegian, `us-qwerty` → English);
switching layout in settings reloads the current line in the new language.

## Practice modes

- **Tekst** — everyday sentences, in the active layout's language.
- **Kode** — TypeScript/Svelte one-liners (English, shared by both layouts).
- **Svake taster** — adaptive: generates word lines weighted towards _your_
  actual slow/error-prone keys (`src/lib/stats/weak-keys.ts`). Unlocks after
  300 recorded keystrokes.

## Word lists

Each language ships a small, hand-written word bank bundled with the app
(`src/lib/content/words.ts` for Norwegian, `words.en.ts` for English), used
immediately and as a fallback. In the browser, this is upgraded in the
background to a much larger (2,500-word) frequency-ranked list fetched once
from `/wordlists/{lang}.json` — a static asset built by
`scripts/build-wordlists.mjs` from the
[hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords)
corpus (CC BY-SA 4.0, derived from OpenSubtitles). Re-run the script to
refresh those lists; nothing about it runs at request time or in CI.
