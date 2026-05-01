import { Route, Routes } from "react-router"
import { Toaster } from "sonner"
import AdminFollowUpPage from "./pages/AdminFollowUpPage"
import HomePage from "./pages/HomePage"
import ReservePage from "./pages/ReservePage"
import ServicesPage from "./pages/ServicesPage"
import AdminPaymentsPage from "./pages/AdminPaymentsPage"
import AdminLoginPage from "./pages/AdminLoginPage"
import AdminDashboardPage from "./pages/AdminDashboardPage"
import AdminReservationsPage from "./pages/AdminReservationsPage"
import AdminCreateReservationPage from "./pages/AdminCreateReservationPage"
import AdminAgendaPage from "./pages/AdminAgendaPage"
import AdminEditReservationPage from "./pages/AdminEditReservationPage"
import AdminClientHistoryPage from "./pages/AdminClientHistoryPage"
import AdminServicesPage from "./pages/AdminServicesPage"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import AdminClientsPage from "./pages/AdminClientsPage"
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/reservar" element={<ReservePage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reservas"
          element={
            <ProtectedRoute>
              <AdminReservationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reservas/:id"
          element={
            <ProtectedRoute>
              <AdminEditReservationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/clientes/:clientId/historial"
          element={
            <ProtectedRoute>
              <AdminClientHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/crear"
          element={
            <ProtectedRoute>
              <AdminCreateReservationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/pagos/:id"
          element={
            <ProtectedRoute>
              <AdminPaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/agenda"
          element={
            <ProtectedRoute>
              <AdminAgendaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/services"
          element={
            <ProtectedRoute>
              <AdminServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clientes"
          element={
            <ProtectedRoute>
              <AdminClientsPage />
            </ProtectedRoute>
  }
  
/>
<Route
  path="/admin/seguimiento"
  element={
    <ProtectedRoute>
      <AdminFollowUpPage />
    </ProtectedRoute>
  }
/>
      </Routes>

      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

export default App