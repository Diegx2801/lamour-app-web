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
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="agenda" element={<AdminAgendaPage />} />
          <Route path="reservas" element={<AdminReservationsPage />} />
          <Route path="reservas/:id" element={<AdminEditReservationPage />} />
          <Route path="crear" element={<AdminCreateReservationPage />} />
          <Route path="clientes" element={<AdminClientsPage />} />
          <Route
            path="clientes/:clientId/historial"
            element={<AdminClientHistoryPage />}
          />
          <Route path="pagos/:id" element={<AdminPaymentsPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="seguimiento" element={<AdminFollowUpPage />} />
        </Route>
      </Routes>

      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

export default App