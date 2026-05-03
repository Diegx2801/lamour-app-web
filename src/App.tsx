import { Navigate, Route, Routes } from "react-router"
import { Toaster } from "sonner"

import HomePage from "./pages/HomePage"
import ReservePage from "./pages/ReservePage"
import ServicesPage from "./pages/ServicesPage"

import AdminLayout from "./components/layout/AdminLayout"
import ProtectedRoute from "./components/auth/ProtectedRoute"

import AdminLoginPage from "./pages/AdminLoginPage"
import AdminDashboardPage from "./pages/AdminDashboardPage"
import AdminReservationsPage from "./pages/AdminReservationsPage"
import AdminCreateReservationPage from "./pages/AdminCreateReservationPage"
import AdminEditReservationPage from "./pages/AdminEditReservationPage"
import AdminAgendaPage from "./pages/AdminAgendaPage"
import AdminPaymentsPage from "./pages/AdminPaymentsPage"
import AdminClientHistoryPage from "./pages/AdminClientHistoryPage"
import AdminServicesPage from "./pages/AdminServicesPage"
import AdminClientsPage from "./pages/AdminClientsPage"
import AdminFollowUpPage from "./pages/AdminFollowUpPage"
import AdminLashistsPage from "./pages/AdminLashistsPage"

function App() {
  return (
    <>
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
            path="seguimiento"
            element={
              <ProtectedRoute allowedRoles={["owner", "staff"]}>
                <AdminFollowUpPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>

      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

export default App