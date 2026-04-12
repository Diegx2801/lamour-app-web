import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { supabase } from "../lib/supabase"

type ReservationRow = {
  id: string
  date: string
  time: string
  status: string
  total_price: number
  deposit_amount: number
  remaining_amount: number
  notes: string | null
  clients: {
    full_name: string
    phone: string
  } | null
  services: {
    name: string
    category: string
  } | null
}

function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true)
        setError("")

        const { data, error } = await supabase
          .from("appointments")
          .select(`
            id,
            date,
            time,
            status,
            total_price,
            deposit_amount,
            remaining_amount,
            notes,
            clients (
              full_name,
              phone
            ),
            services (
              name,
              category
            )
          `)
          .order("date", { ascending: true })
          .order("time", { ascending: true })

        if (error) {
          throw new Error("No se pudieron cargar las reservas.")
        }

        setReservations((data as any) ?? [])
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Ocurrió un error inesperado."
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchReservations()
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", id)

      if (error) {
        throw new Error("No se pudo actualizar el estado")
      }

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id
            ? { ...reservation, status: newStatus }
            : reservation
        )
      )
    } catch {
      alert("Error al actualizar estado")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/admin/login")
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Panel admin
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-stone-950">
              Reservas registradas
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Aquí podrás revisar solicitudes de reserva, estado, abono y saldo pendiente.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/crear"
              className="rounded-full bg-black px-5 py-3 text-sm text-white"
            >
              Nueva reserva
            </Link>

            <Link
              to="/admin/agenda"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800"
            >
              Agenda
            </Link>

            <Link
              to="/admin/dashboard"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-stone-600 shadow-sm">
            Cargando reservas...
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && reservations.length === 0 && (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-stone-600 shadow-sm">
            No hay reservas registradas todavía.
          </div>
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="overflow-x-auto rounded-[2rem] bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-stone-900">Cliente</th>
                  <th className="px-5 py-4 font-semibold text-stone-900">Servicio</th>
                  <th className="px-5 py-4 font-semibold text-stone-900">Fecha</th>
                  <th className="px-5 py-4 font-semibold text-stone-900">Hora</th>
                  <th className="px-5 py-4 font-semibold text-stone-900">Estado</th>
                  <th className="px-5 py-4 font-semibold text-stone-900">Acciones</th>
                  <th className="px-5 py-4 font-semibold text-stone-900">Total</th>
                  <th className="px-5 py-4 font-semibold text-stone-900">Abono</th>
                  <th className="px-5 py-4 font-semibold text-stone-900">Saldo</th>
                </tr>
              </thead>

              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b border-stone-100 align-top">
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900">
                        {reservation.clients?.full_name ?? "Sin nombre"}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {reservation.clients?.phone ?? "Sin teléfono"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900">
                        {reservation.services?.name ?? "Sin servicio"}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {reservation.services?.category ?? ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-stone-700">{reservation.date}</td>
                    <td className="px-5 py-4 text-stone-700">{reservation.time}</td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium capitalize text-stone-800">
                        {reservation.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateStatus(reservation.id, "confirmed")}
                          className="rounded-full bg-green-600 px-3 py-1 text-xs text-white"
                        >
                          Confirmar
                        </button>

                        <button
                          onClick={() => updateStatus(reservation.id, "completed")}
                          className="rounded-full bg-blue-600 px-3 py-1 text-xs text-white"
                        >
                          Completar
                        </button>

                        <button
                          onClick={() => updateStatus(reservation.id, "cancelled")}
                          className="rounded-full bg-red-600 px-3 py-1 text-xs text-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-stone-700">
                      S/ {Number(reservation.total_price ?? 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-stone-700">
                      S/ {Number(reservation.deposit_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-stone-700">
                      S/ {Number(reservation.remaining_amount ?? 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReservationsPage