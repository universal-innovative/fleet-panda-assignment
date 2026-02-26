import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import DriverLayout from "./components/driver/DriverLayout";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import ToastContainer from "./components/common/ToastContainer";
import { DashboardSkeleton } from "./components/common/Skeleton";

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const HubsPage = lazy(() => import("./components/admin/HubsPage"));
const DriversPage = lazy(() => import("./components/admin/DriversPage"));
const ProductsPage = lazy(() => import("./components/admin/ProductsPage"));
const VehiclesPage = lazy(() => import("./components/admin/VehiclesPage"));
const OrdersPage = lazy(() => import("./components/admin/OrdersPage"));
const AllocationsPage = lazy(
  () => import("./components/admin/AllocationsPage"),
);
const FleetMapPage = lazy(() => import("./components/admin/FleetMapPage"));
const InventoryPage = lazy(() => import("./components/admin/InventoryPage"));

// Lazy-loaded driver pages
const DriverShiftView = lazy(
  () => import("./components/driver/DriverShiftView"),
);
const DriverLiveMap = lazy(() => import("./components/driver/DriverLiveMap"));
const DriverDeliveries = lazy(
  () => import("./components/driver/DriverDeliveries"),
);
const DriverHistory = lazy(() => import("./components/driver/DriverHistory"));

function PageLoader() {
  return <DashboardSkeleton />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="hubs" element={<HubsPage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="allocations" element={<AllocationsPage />} />
            <Route path="fleet-map" element={<FleetMapPage />} />
            <Route path="inventory" element={<InventoryPage />} />
          </Route>

          {/* Driver Routes */}
          <Route path="/driver" element={<DriverLayout />}>
            <Route index element={<DriverShiftView />} />
            <Route path="map" element={<DriverLiveMap />} />
            <Route path="deliveries" element={<DriverDeliveries />} />
            <Route path="history" element={<DriverHistory />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/admin/hubs" replace />} />
          <Route path="*" element={<Navigate to="/admin/hubs" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </ErrorBoundary>
  );
}
