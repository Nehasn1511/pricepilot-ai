# PricePilot AI — Frontend

React + Vite + Tailwind + Ant Design. Connects to Spring Boot backend at `:9090`.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Dev server: `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Stack

- React 19 + Vite 8
- Ant Design 6 (components) + Tailwind 3 (utilities, `preflight: false` to avoid antd conflicts)
- `@ant-design/icons` (all emoji replaced)
- recharts (charts)
- axios (HTTP)

## What changed

- Tailwind added (`tailwind.config.js`, `postcss.config.js`)
- All emoji replaced with `@ant-design/icons`
- Dashboard rebuilt with recharts AreaChart, PieChart, BarChart + trend tags
- App layout: clean sidebar gradient, Sun/Moon icon theme toggle (no page reload)
- `vite.config.js` cleaned + `/api` proxy to backend `:9090`
- `.env.example` added
- EmptyState, ProductDetail, AuditLog, MarketplaceAccounts, Recommendations all de-emojified
