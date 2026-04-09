# Nivasa Frontend (Angular)

This frontend uses `.env` values injected via `set-env.js` before serve/build/test.

## Prerequisites

- Node.js v18+ recommended

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

## Development

```bash
npm start
```

This runs `set-env.js` and then starts Angular on `http://localhost:4200`.

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## Note

Use `npm` scripts instead of raw `ng serve/ng build/ng test` so env injection always runs.
