# Little Reset

A quiet daily check in. Two things only: how you're looking after yourself, and what you're spending.

Built to be opened for under a minute a day.

## Running it

```bash
npm install
npm run dev
```

Build for production with `npm run build`, then `npm run preview`.

## What's in here

```
src/
  components/
    habits/     habit line, editor sheet, timer sheet
    layout/     app shell, tab bar, floating add button
    spending/   amount pad, expense sheet, ledger rows, category totals
    ui/         button, chip, field, progress, sheet
  hooks/        useStore (state and persistence), useTimer
  lib/          date maths, formatting, selectors, reference data, demo seed
  screens/      Today, Habits, Spending
  types/        shared types
```

## Data

Everything lives in `localStorage` under `little-reset:v1`. No accounts, no sync, no network calls.
First launch seeds a small set of demo habits and expenses so the app never opens empty. Clearing site
data resets it.

## PWA

`public/manifest.webmanifest` and `public/sw.js` are wired up and the service worker registers in
production builds only. Add the three PNG icons listed in `public/icons/README.txt` before shipping.

## Design notes

Colour carries meaning rather than decoration. The care side of the app uses a deep sage, the money
side uses a muted ochre, and the two never mix. Habits are set as ruled lines on a day sheet, money is
set as ledger rows with leader dots between label and amount.

Type is Fraunces for display and Instrument Sans for everything else, with tabular numerals wherever
an amount or a countdown appears.

Motion is short and soft, and every animation is switched off under `prefers-reduced-motion`.

## Deliberately not included

Accounts, cloud sync, AI, budgets, savings goals, charts, notifications, social features, streak
rewards, coins, badges.
