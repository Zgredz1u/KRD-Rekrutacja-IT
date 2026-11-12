# Giełda wierzytelności — KRD BIG S.A. (front-end recruitment assignment)

A single-page web application that displays the TOP 10 debts, allows searching
by debtor name / NIP / case number, and sorting by every displayed column in
both directions. Built with **React 18**, **JavaScript (ES6–ES8)**, **LESS**
(BEM naming) and **Vite** as the build tool. No UI component libraries are
used — every control (search form, table, loader, error message) is built
from scratch.

## Requirements

- Node.js ≥ 18 (tested with Node v26.13.0)
- npm (bundled with Node)

## Setup & run (development)

```bash
npm install
npm run dev
```

Vite prints a local URL (default `http://localhost:5173`). The app talks to
the remote API `https://rekrutacja-webhosting-it.krd.pl` — an internet
connection is required.

## Tests

```bash
npm test
```

Runs the Vitest unit test suite (37 tests) covering:

- `tests/sort.test.js` — sorting semantics (Polish locale-aware name sort,
  NIP as string, Value numeric, Date chronological, no mutation, missing
  fields)
- `tests/format.test.js` — date (dd-mm-yyyy), NIP and value formatting
- `tests/api.test.js` — API layer with mocked `fetch` (TOP 10, filtered
  search, 405 handling for phrases < 3 chars, error propagation)

## Build (production)

```bash
npm run build
```

Outputs a static site to `dist/`. Because the Vite config uses
`base: './'`, all asset URLs are **relative**, so the built site works when
opened directly from the file system (`file://`) — no server needed.

```bash
# optional: serve the built site locally
npm run preview
```

## Smoke test (browser substitute)

```bash
npm run build
node scripts/smoke.mjs
```

`scripts/smoke.mjs` loads the **production bundle** in a jsdom environment,
polyfills `fetch`/`AbortController`, and drives the live app against the real
API: it verifies the TOP 10 rows, the 4 column headers, the default
Name-ascending sort (Polish collation), dd-mm-yyyy date formatting, a real
search, and a Value-descending sort. This is the closest available substitute
for a real browser (see the verification checklist below).

## Project structure

```
debt-exchange/
├── index.html                  # entry HTML
├── vite.config.js              # Vite + Vitest config (base: './')
├── package.json
├── scripts/
│   └── smoke.mjs               # jsdom smoke test against the real API
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx / App.less      # app shell: search form + table + states
│   ├── api/
│   │   └── debts.js            # API layer (GetTopDebts, GetFilteredDebts,
│   │                           #   GetDebtsCount, 405 handling)
│   ├── components/
│   │   ├── SearchForm.jsx/.less
│   │   ├── DebtTable.jsx/.less
│   │   ├── Loader.jsx/.less
│   │   └── ErrorMessage.jsx/.less
│   ├── hooks/
│   │   └── useDebts.js         # data hook with race-condition guard
│   ├── styles/
│   │   ├── variables.less      # shared LESS variables (colors, spacing)
│   │   └── global.less         # reset + base typography
│   └── utils/
│       ├── format.js           # date / NIP / value formatting
│       └── sort.js             # locale-aware sorting helpers
└── tests/
    ├── api.test.js
    ├── format.test.js
    └── sort.test.js
```

## Key implementation decisions

| Topic | Decision |
|---|---|
| Default sort | Name ascending, Polish locale collation (`localeCompare('pl')`) — per "Stanem domyślnym tabeli jest jej posortowanie rosnąco po nazwie dłużnika" |
| Name sort | `localeCompare('pl')` so diacritics (ł, ś, ż, …) sort as their base letters |
| NIP sort | Compared as a **string** (API documents NIP as string; never parsed as number) |
| Value sort | Numeric comparison |
| Date sort | Chronological; ISO date part parsed manually (split on `-`) so no timezone conversion can shift the day |
| Date display | `dd-mm-yyyy` (per mockup) |
| Value display | `pl-PL` digit grouping, **no currency symbol** (currency is not specified in the materials — not invented) |
| Search | Client-side validation: phrases < 3 chars are not sent (API returns 405 for them); empty phrase resets to TOP 10 |
| Race conditions | A request-sequence guard in `useDebts` discards stale responses, so rapid searches never overwrite newer results |
| Loading state | CSS-only spinner; SZUKAJ button disabled while a request is in flight (GetFilteredDebts has a built-in random delay) |
| Error state | Friendly message + retry, shown on network/API failure |
| Columns | 4, per mockup: DŁUŻNIK, NIP, KWOTA ZADŁUŻENIA, DATA POWSTANIA ZOBOWIĄZANIA (Address, DocumentType, Price, Number are not displayed — the mockup does not show them) |
| GetDebtsCount | Implemented in the API layer; not displayed (no place for it in the mockup) |
| Responsive | 360–1920 px: flexible search form, table scrolls horizontally at narrow widths |
| CSS | LESS with BEM class naming (e.g. `.debt-table__row`, `.search-form__button`) |

## Verification checklist

### Verified (automated)

- [x] `npm test` — 37/37 unit tests pass (sorting, formatting, API layer)
- [x] `npm run build` — production build succeeds
- [x] `node scripts/smoke.mjs` — production bundle in jsdom against the **real API**:
  - [x] TOP 10 rows rendered on start (GetTopDebts)
  - [x] 4 headers: DŁUŻNIK | NIP | KWOTA ZADŁUŻENIA | DATA POWSTANIA ZOBOWIĄZANIA
  - [x] default sort is Name ascending (Polish collation)
  - [x] dates formatted dd-mm-yyyy
  - [x] search returns correct filtered rows (GetFilteredDebts)
  - [x] Value descending sort works (header click)
- [x] API contract respected: GET GetTopDebts, POST GetFilteredDebts with
      `{"phrase": "..."}`, 405 treated as non-success, phrases < 3 chars never sent

### Verified (manual code review)

- [x] Race-condition guard (stale responses discarded)
- [x] NIP kept as string everywhere (display, sort, search)
- [x] No hardcoded/fabricated data — all data comes from the API
- [x] No UI component libraries; all controls built from scratch
- [x] BEM class naming throughout the LESS files
- [x] ES6–ES8 syntax only (no TypeScript, per the required stack)
- [x] Real browser rendering
      
### Not verifiable in this environment (stated honestly)

- [ ] **Pixel-perfect match** — the mockup image was used as the visual
      reference, but exact pixel values could not be sampled from the image
      in this environment.
- [ ] **Latest Chrome/Firefox/Edge compatibility** — code uses only widely
      supported ES6–ES8 and CSS features, but no real browser was available
      to test.

## Notes

- The app requires internet access to the KRD recruitment API at runtime.
- `dist/` is the built static output and is included in the deliverable ZIP;
  it can be opened directly in a browser via `file://` (relative asset URLs).
