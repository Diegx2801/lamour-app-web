import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router"
import { LazyMotion, domAnimation } from "framer-motion"
import { Toaster } from "sonner"

import AdminLayout from "./components/layout/AdminLayout"
import ProtectedRoute from "./components/auth/ProtectedRoute"

const HomePage = lazy(() => import("./pages/HomePage"))
const ReservePage = lazy(() => import("./pages/ReservePage"))
const ServicesPage = lazy(() => import("./pages/ServicesPage"))
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"))
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"))
const AdminReservationsPage = lazy(() => import("./pages/AdminReservationsPage"))
const AdminCreateReservationPage = lazy(
  () => import("./pages/AdminCreateReservationPage")
)
const AdminEditReservationPage = lazy(
  () => import("./pages/AdminEditReservationPage")
)
const AdminAgendaPage = lazy(() => import("./pages/AdminAgendaPage"))
const AdminPaymentsPage = lazy(() => import("./pages/AdminPaymentsPage"))
const AdminCashPage = lazy(() => import("./pages/AdminCashPage"))
const AdminActivityPage = lazy(() => import("./pages/AdminActivityPage"))
const AdminClientHistoryPage = lazy(
  () => import("./pages/AdminClientHistoryPage")
)
const AdminServicesPage = lazy(() => import("./pages/AdminServicesPage"))
const AdminClientsPage = lazy(() => import("./pages/AdminClientsPage"))
const AdminFollowUpPage = lazy(() => import("./pages/AdminFollowUpPage"))
const AdminLashistsPage = lazy(() => import("./pages/AdminLashistsPage"))
const AdminPromosPage = lazy(() => import("./pages/admin/AdminPromosPage"))

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f1e9] px-4">
      <div className="rounded-[2rem] bg-white px-6 py-4 text-sm font-medium text-stone-600 shadow-sm">
        Cargando...
      </div>
    </div>
  )
}

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/reservar" element={<ReservePage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["owner", "staff"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/agenda" replace />} />

            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="agenda"
              element={
                <ProtectedRoute allowedRoles={["owner", "staff"]}>
                  <AdminAgendaPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="reservas"
              element={
                <ProtectedRoute allowedRoles={["owner", "staff"]}>
                  <AdminReservationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="reservas/:id"
              element={
                <ProtectedRoute allowedRoles={["owner", "staff"]}>
                  <AdminEditReservationPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="crear"
              element={
                <ProtectedRoute allowedRoles={["owner", "staff"]}>
                  <AdminCreateReservationPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="clientes"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <AdminClientsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="clientes/:clientId/historial"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <AdminClientHistoryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="pagos/:id"
              element={
                <ProtectedRoute allowedRoles={["owner", "staff"]}>
                  <AdminPaymentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="caja"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <AdminCashPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="actividad"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <AdminActivityPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="services"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <AdminServicesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="lashistas"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <AdminLashistsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="promos"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <AdminPromosPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="seguimiento"
              element={
                <ProtectedRoute allowedRoles={["owner", "staff"]}>
                  <AdminFollowUpPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>

      <Toaster position="top-right" richColors closeButton />
    </LazyMotion>
  )
}

export default App
