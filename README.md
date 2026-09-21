# Fingerflyt

A touch-typing trainer for the Norwegian PC keyboard layout, built for a
developer who wants to stop overusing his right index finger. For every
character you're about to type, the app shows in real time which finger
should press it, and tracks your progress over time — accuracy, speed, and
which hand is doing the work.

All UI text is in Norwegian bokmål; code, comments and this README are in
English.

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

The Norwegian PC (ISO) layout lives as typed data in
`src/lib/layouts/no-pc.ts` — each key's base/shift/AltGr characters, its
correct finger, and its visual width. `src/lib/layouts/index.ts` is a small
registry keyed by layout id, so a Norwegian Mac layout (or another language
entirely) can be added later as a second data file plus a picker in settings,
without touching the trainer engine, stats, or content-generation logic.

## Practice modes

- **Tekst** — everyday Norwegian sentences.
- **Kode** — TypeScript/Svelte one-liners.
- **Avlast pekefingeren** — generated word lines weighted towards the keys a
  self-taught typist tends to reach with the right index finger instead of
  the correct finger (i, k, 8, comma, o, l, p).
- **Svake taster** — adaptive: generates lines weighted towards _your_ actual
  slow/error-prone keys (`src/lib/stats/weak-keys.ts`). Unlocks after 300
  recorded keystrokes.
