import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import "./App.css";

const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const SourcesPage = lazy(() => import("./pages/SourcesPage.jsx"));
const GridPage = lazy(() => import("./pages/GridPage.jsx"));
const BatteryPage = lazy(() => import("./pages/BatteryPage.jsx"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage.jsx"));
const MaintenancePage = lazy(() => import("./pages/MaintenancePage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

function RouteFallback() {
  return <div className="route-fallback">Loading dashboard view…</div>;
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="sources" element={<SourcesPage />} />
          <Route path="grid" element={<GridPage />} />
          <Route path="battery" element={<BatteryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
