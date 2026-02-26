# Component Hierarchy

## App Shell
- `App` wraps routed pages in `ErrorBoundary` and renders global `ToastContainer`.
- Route pages are lazy-loaded with a skeleton fallback.

## Admin Area (`/admin`)
- `AdminLayout`
  - `AdminDashboard`
  - `HubsPage`
  - `ProductsPage`
  - `DriversPage`
  - `VehiclesPage`
  - `OrdersPage`
  - `AllocationsPage`
  - `FleetMapPage`
  - `InventoryPage`

## Driver Area (`/driver`)
- `DriverLayout`
  - `DriverShiftView`
  - `DriverLiveMap`
  - `DriverDeliveries`
  - `DriverHistory`

## Shared UI
- `components/common/ErrorBoundary.tsx`
- `components/common/Modal.tsx`
- `components/common/ToastContainer.tsx`
- `components/common/EmptyState.tsx`
- `components/common/Skeleton.tsx`
- `components/ui/Icons.tsx`

## Responsibilities

### Admin Pages
- `HubsPage`: hub/terminal CRUD, validation, search/filter.
- `ProductsPage`: product CRUD (used by order and inventory flows).
- `DriversPage`: driver CRUD with license/phone validation.
- `VehiclesPage`: vehicle CRUD with registration/capacity validation.
- `OrdersPage`: create orders, assign drivers, filter statuses.
- `AllocationsPage`: allocation calendar and conflict-safe assignment.
- `FleetMapPage`: vehicle tracking map with driver/vehicle/status filters.
- `InventoryPage`: inventory table with low-stock alert styling.

### Driver Pages
- `DriverShiftView`: shift status and start/end actions.
- `DriverLiveMap`: current position, destinations, route polyline, GPS update simulation.
- `DriverDeliveries`: in-transit/completed/failed delivery actions and inventory updates.
- `DriverHistory`: historical shift and delivery records.

## UX/Error Patterns
- Form-level validation + inline errors.
- Confirmations for destructive actions.
- Toast notifications for success/error states.
- API failures: optimistic rollback + user-facing error toasts.
- Loading: skeletons during route and startup hydration.
