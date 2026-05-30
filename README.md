# Trade Stryke

A dark-themed trading dashboard with a live candlestick/line chart, strategy confluence scoreboard (A/B/C trade grades), and performance widgets.

## Features

- **Ticker search** — type a symbol (e.g. `BTC`, `ETH`, `NVDA`) and press Enter or pick from the dropdown
- **Chart** — real candlestick chart via [Lightweight Charts](https://tradingview.github.io/lightweight-charts/); toggle to line view
- **Confluence scoreboard** — check strategy factors, set weights, see total score and A/B/C grade gauge
- **Stats row** — setups, win rate, P&L, R/R, last trade, streak (demo values)

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- lightweight-charts v5
- lucide-react icons

Chart data is **synthetic** (seeded per ticker) for demo purposes. Wire your own market data API when you are ready for live feeds.
