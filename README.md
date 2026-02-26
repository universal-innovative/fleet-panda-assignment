# Fleet Tracking Platform

Fleet management frontend built with React, TypeScript, Zustand, Leaflet, and json-server mock APIs.

## Quick Start

```bash
npm install

# terminal 1: mock API
npm run dev:api

# terminal 2: frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Mock API: `http://localhost:3001`

## Scripts

```bash
npm run dev            # Vite dev server
npm run dev:api        # json-server on 3001
npm run build          # Type-check + production build
npm test               # Vitest
npm run test:coverage  # Vitest with coverage
```

## Implemented Features

### Admin
- Master CRUD: hubs/terminals, products, drivers, vehicles
- Orders: create, assign driver, status lifecycle, filters/search
- Allocations: calendar UI, conflict prevention (no double booking)
- Fleet map: active vehicles, driver/vehicle/status filtering, auto-refresh + manual refresh
- Inventory dashboard: per-location stock table, low-stock highlighting, filters/search

### Driver
- Shift card with start/end controls and allocation checks
- Live map with simulated GPS updates + destination markers + route line
- Delivery workflow: in-transit, complete, fail with reason
- Delivery completion updates destination inventory
- Shift history with prior deliveries

## Architecture

### Stack
- React 18 + TypeScript
- Zustand domain stores
- React Router v6
- Leaflet + react-leaflet
- Tailwind CSS
- Vitest + Testing Library
- json-server mock backend (`db.json`)

### Store Structure
Stores are modularized under `src/store/`:
- `hubStore.ts`
- `driverStore.ts`
- `productStore.ts`
- `vehicleStore.ts`
- `orderStore.ts`
- `allocationStore.ts`
- `gpsStore.ts`
- `shiftHistoryStore.ts`
- `toastStore.ts`
- `activeDriverStore.ts`
- `bootstrap.ts` (API hydration on app startup)

### API
- Generic client at `src/api/resources.ts`
- Startup hydration from API in `src/main.tsx`
- Optimistic updates with rollback + toast error handling in stores

## Routes

### Admin
- `/admin`
- `/admin/hubs`
- `/admin/products`
- `/admin/drivers`
- `/admin/vehicles`
- `/admin/orders`
- `/admin/allocations`
- `/admin/fleet-map`
- `/admin/inventory`

### Driver
- `/driver`
- `/driver/map`
- `/driver/deliveries`
- `/driver/history`

## Testing

Current test suites:
- `src/test/helpers.test.ts` (unit)
- `src/test/components.test.tsx` (component)
- `src/test/stores.test.ts` (integration/store logic)
- `src/test/api.test.ts` (API client + mocked fetch)

Generate coverage:

```bash
npm run test:coverage
```

## Documentation

- `docs/COMPONENTS.md`
- `docs/STATE_MANAGEMENT.md`
- `docs/DECISIONS.md`
- `docs/SUBMISSION_CHECKLIST.md`

## Deployment

### API (Render)
- Use included `render.yaml`
- Service runs: `json-server` against `db.json`

### Frontend (Vercel)
- Use included `vercel.json`
- Set env var in Vercel project:
  - `VITE_API_URL=<your-render-api-url>`
