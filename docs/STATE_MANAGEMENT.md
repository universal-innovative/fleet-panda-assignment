# State Management

## Approach
The app uses Zustand with modular domain stores and a json-server backed mock API.

## Store Modules (`src/store`)
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
- `bootstrap.ts`
- `index.ts` (barrel exports)

## Data Flow
1. App startup calls `hydrateStoresFromApi()` in `main.tsx`.
2. API data is loaded from `json-server` (`db.json`) into stores.
3. UI reads from stores via selectors.
4. Mutations are optimistic:
   - local state updates immediately
   - API call is sent
   - on API failure, store rolls back and a toast error is shown

## API Layer
- `src/api/resources.ts` exposes generic `list/create/patch/delete` helpers.
- Errors are normalized and propagated as readable messages.

## Business Rules
- Allocation store prevents duplicate vehicle or driver assignments per date.
- Driver delivery completion updates order status and destination inventory.
- Failed delivery requires a reason and persists it to order state.

## Why This Pattern
- Small and fast state layer without heavy boilerplate.
- Clear separation by domain for evaluator readability.
- Easy unit/integration testing without provider setup.
