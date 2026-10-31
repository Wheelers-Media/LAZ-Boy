# LAZ-Boy

La-Z-Boy sales-floor assistant and RMS SKU helper built with React and Vite.

## Run locally

```sh
npm ci
npm run dev
```

## Build

```sh
npm run build
```

The static site is generated in `dist/`.

## Deploy

Vercel builds `npm run build` and serves `dist/` (see `vercel.json`: SPA rewrite, `sw.js` always revalidated, hashed assets cached for a year).

## Test

```sh
npm test
```
