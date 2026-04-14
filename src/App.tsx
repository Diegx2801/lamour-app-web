import { Route, Routes } from "react-router"
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
import ProtectedRoute from "./components/auth/ProtectedRoute"

function App() {
  return (
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
        path="/admin/clientes/:phone/historial"
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
    </Routes>
  )
}

export default App