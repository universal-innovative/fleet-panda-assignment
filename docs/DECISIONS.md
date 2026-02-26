# Technical Decisions

## Mock Backend
**Chosen:** `json-server` with `db.json`.

Why:
- Fastest path to realistic REST-like behavior.
- Supports persistence across refresh without building a real backend.
- Easy to inspect/reset data.

## State Management
**Chosen:** Zustand modular stores.

Why:
- Minimal boilerplate.
- Selective subscriptions for performant renders.
- Easy to split by domain for maintainability.

## API Interaction Strategy
**Chosen:** optimistic UI + rollback.

Why:
- Feels responsive like a modern app.
- Handles transient API errors safely.
- User gets immediate feedback via toasts.

## Routing & Loading
**Chosen:** React Router + lazy pages + skeleton fallback.

Why:
- Smaller initial bundle.
- Better perceived performance.
- Clear loading behavior during route transitions/startup hydration.

## Mapping
**Chosen:** Leaflet + react-leaflet.

Why:
- Open-source, no paid map SDK requirements.
- Good enough for simulated real-time fleet tracking.

## Testing Strategy
- Unit: utility helpers.
- Component: modal/empty/toast and integrity checks.
- Store integration: CRUD, business rules, rollback behavior.
- API tests: mocked fetch for list/create/patch/delete and error parsing.

## Tradeoffs
- No real backend/auth implemented (intentionally mocked per assignment).
- Dark mode and full accessibility audit are not fully implemented.
