import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"
import { supabase } from "../lib/supabase"

type ReservationRelationClient =
  | {
      full_name: string | null
      phone: string | null
    }
  | {
      full_name: string | null
      phone: string | null
    }[]
  | null

type ReservationRelationService =
  | {
      name: string | null
      category: string | null
    }
  | {
      name: string | null
      category: string | null
    }[]
  | null

type ReservationRow = {
  id: string
  date: string
  time: string
  status: string
  total_price: number
  deposit_amount: number
  remaining_amount: number
  notes: string | null
  lashista: string | null
  clients: ReservationRelationClient
  services: ReservationRelationService
}

type TabKey = "active" | "completed" | "cancelled"

function getClientData(clients: ReservationRelationClient) {
  if (!clients) return null
  return Array.isArray(clients) ? clients[0] ?? null : clients
}

function getServiceData(services: ReservationRelationService) {
  if (!services) return null
  return Array.isArray(services) ? services[0] ?? null : services
}

function getStatusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700"
    case "completed":
      return "bg-blue-100 text-blue-700"
    case "cancelled":
      return "bg-red-100 text-red-700"
    case "pending":
      return "bg-amber-100 text-amber-700"
    default:
      return "bg-stone-100 text-stone-700"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "confirmed":
      return "Confirmada"
    case "completed":
      return "Completada"
    case "cancelled":
      return "Cancelada"
    case "pending":
      return "Pendiente"
    default:
      return status
  }
}

function formatTime(time: string) {
  return String(time).slice(0, 5)
}

function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<TabKey>("active")
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
            lashista,
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

        setReservations((data ?? []) as ReservationRow[])
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

  const filteredByDate = useMemo(() => {
    if (!selectedDate) return reservations
    return reservations.filter((reservation) => reservation.date === selectedDate)
  }, [reservations, selectedDate])

  const filteredBySearch = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    if (!normalizedSearch) return filteredByDate

    return filteredByDate.filter((reservation) => {
      const client = getClientData(reservation.clients)
      const fullName = client?.full_name?.toLowerCase() ?? ""
      const phone = client?.phone?.toLowerCase() ?? ""

      return (
        fullName.includes(normalizedSearch) ||
        phone.includes(normalizedSearch)
      )
    })
  }, [filteredByDate, searchTerm])

  const activeReservations = useMemo(() => {
    return filteredBySearch.filter(
      (reservation) =>
        reservation.status === "pending" || reservation.status === "confirmed"
    )
  }, [filteredBySearch])

  const completedReservations = useMemo(() => {
    return filteredBySearch.filter(
      (reservation) => reservation.status === "completed"
    )
  }, [filteredBySearch])

  const cancelledReservations = useMemo(() => {
    return filteredBySearch.filter(
      (reservation) => reservation.status === "cancelled"
    )
  }, [filteredBySearch])

  const visibleReservations = useMemo(() => {
    if (activeTab === "active") return activeReservations
    if (activeTab === "completed") return completedReservations
    return cancelledReservations
  }, [activeTab, activeReservations, completedReservations, cancelledReservations])

  const renderTable = (rows: ReservationRow[]) => {
    if (rows.length === 0) {
      return (
        <div className="rounded-[2rem] bg-white p-8 text-sm text-stone-600 shadow-sm">
          No hay reservas para este filtro.
        </div>
      )
    }

    return (
      <div className="overflow-x-auto rounded-[2rem] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="px-5 py-4 font-semibold text-stone-900">Cliente</th>
              <th className="px-5 py-4 font-semibold text-stone-900">Servicio</th>
              <th className="px-5 py-4 font-semibold text-stone-900">Lashista</th>
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
            {rows.map((reservation) => {
              const client = getClientData(reservation.clients)
              const service = getServiceData(reservation.services)
              const clientPhone = client?.phone ?? ""

              return (
                <tr
                  key={reservation.id}
                  className="border-b border-stone-100 align-top"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-900">
                      {client?.full_name ?? "Sin nombre"}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {client?.phone ?? "Sin teléfono"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-900">
                      {service?.name ?? "Sin servicio"}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {service?.category ?? ""}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-stone-700">
                    {reservation.lashista ?? "Sin asignar"}
                  </td>

                  <td className="px-5 py-4 text-stone-700">{reservation.date}</td>

                  <td className="px-5 py-4 text-stone-700">
                    {formatTime(reservation.time)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                        reservation.status
                      )}`}
                    >
                      {getStatusLabel(reservation.status)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/reservas/${reservation.id}`}
                        className="rounded-full border border-stone-300 px-3 py-1 text-xs"
                      >
                        Editar
                      </Link>

                      <Link
                        to={`/admin/pagos/${reservation.id}`}
                        className="rounded-full border border-stone-300 px-3 py-1 text-xs"
                      >
                        Pagos
                      </Link>

                      {clientPhone ? (
                        <Link
                          to={`/admin/clientes/${encodeURIComponent(clientPhone)}/historial`}
                          className="rounded-full border border-stone-300 px-3 py-1 text-xs"
                        >
                          Historial
                        </Link>
                      ) : null}

                      {reservation.status !== "confirmed" &&
                        reservation.status !== "cancelled" && (
                          <button
                            onClick={() =>
                              updateStatus(reservation.id, "confirmed")
                            }
                            className="rounded-full bg-green-600 px-3 py-1 text-xs text-white"
                          >
                            Confirmar
                          </button>
                        )}

                      {reservation.status !== "completed" &&
                        reservation.status !== "cancelled" && (
                          <button
                            onClick={() =>
                              updateStatus(reservation.id, "completed")
                            }
                            className="rounded-full bg-blue-600 px-3 py-1 text-xs text-white"
                          >
                            Completar
                          </button>
                        )}

                      {reservation.status !== "cancelled" && (
                        <button
                          onClick={() =>
                            updateStatus(reservation.id, "cancelled")
                          }
                          className="rounded-full bg-red-600 px-3 py-1 text-xs text-white"
                        >
                          Cancelar
                        </button>
                      )}
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
              )
            })}
          </tbody>
        </table>
      </div>
    )
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
              Aquí podrás revisar solicitudes de reserva, estado, abono, saldo pendiente y lashista asignada.
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

        <div className="mb-6 grid gap-4 rounded-[2rem] bg-white p-6 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-800">
              Filtrar por fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-800">
              Buscar cliente o teléfono
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ejemplo: María o 957230015"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
            />
          </div>

          <button
            onClick={() => {
              setSelectedDate("")
              setSearchTerm("")
            }}
            className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("active")}
            className={`rounded-full px-5 py-3 text-sm font-medium ${
              activeTab === "active"
                ? "bg-stone-950 text-white"
                : "border border-stone-300 bg-white text-stone-800"
            }`}
          >
            Activas ({activeReservations.length})
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`rounded-full px-5 py-3 text-sm font-medium ${
              activeTab === "completed"
                ? "bg-stone-950 text-white"
                : "border border-stone-300 bg-white text-stone-800"
            }`}
          >
            Completadas ({completedReservations.length})
          </button>

          <button
            onClick={() => setActiveTab("cancelled")}
            className={`rounded-full px-5 py-3 text-sm font-medium ${
              activeTab === "cancelled"
                ? "bg-stone-950 text-white"
                : "border border-stone-300 bg-white text-stone-800"
            }`}
          >
            Canceladas ({cancelledReservations.length})
          </button>
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

        {!loading && !error && renderTable(visibleReservations)}
      </div>
    </div>
  )
}

export default AdminReservationsPage