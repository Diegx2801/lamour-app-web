import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router"
import { supabase } from "../lib/supabase"

type ClientRelation =
  | {
      full_name: string | null
      phone: string | null
    }
  | {
      full_name: string | null
      phone: string | null
    }[]
  | null

type ServiceRelation =
  | {
      name: string | null
      category: string | null
    }
  | {
      name: string | null
      category: string | null
    }[]
  | null

type ClientHistoryRow = {
  id: string
  date: string
  time: string
  status: string
  notes: string | null
  lashista: string | null
  total_price: number | null
  deposit_amount: number | null
  remaining_amount: number | null
  clients: ClientRelation
  services: ServiceRelation
}

function getClientData(clients: ClientRelation) {
  if (!clients) return null
  return Array.isArray(clients) ? clients[0] ?? null : clients
}

function getServiceData(services: ServiceRelation) {
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
    case "no_show":
      return "bg-stone-200 text-stone-700"
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
    case "no_show":
      return "No show"
    default:
      return status
  }
}

function formatTime(time: string) {
  return String(time).slice(0, 5)
}

function AdminClientHistoryPage() {
  const { phone } = useParams()

  const [history, setHistory] = useState<ClientHistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHistory = async () => {
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
            notes,
            lashista,
            total_price,
            deposit_amount,
            remaining_amount,
            clients (
              full_name,
              phone
            ),
            services (
              name,
              category
            )
          `)
          .eq("clients.phone", phone)
          .order("date", { ascending: false })
          .order("time", { ascending: false })

        if (error) {
          throw new Error("No se pudo cargar el historial del cliente.")
        }

        setHistory((data ?? []) as ClientHistoryRow[])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error inesperado."
        )
      } finally {
        setLoading(false)
      }
    }

    if (phone) {
      fetchHistory()
    }
  }, [phone])

  const clientInfo = useMemo(() => {
    if (history.length === 0) return null
    return getClientData(history[0].clients)
  }, [history])

  const totalVisits = history.length

  const completedVisits = useMemo(() => {
    return history.filter((item) => item.status === "completed").length
  }, [history])

  const totalSpent = useMemo(() => {
    return history
      .filter((item) => item.status === "completed")
      .reduce((acc, item) => acc + Number(item.total_price ?? 0), 0)
  }, [history])

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/admin/reservas"
          className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
        >
          ← Volver a reservas
        </Link>

        <div className="mt-6 rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Cliente
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-stone-950">
            Historial del cliente
          </h1>

          {!loading && !error && clientInfo && (
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Nombre
                </p>
                <p className="mt-2 font-medium text-stone-900">
                  {clientInfo.full_name ?? "Sin nombre"}
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Teléfono
                </p>
                <p className="mt-2 font-medium text-stone-900">
                  {clientInfo.phone ?? "Sin teléfono"}
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Total de visitas
                </p>
                <p className="mt-2 font-medium text-stone-900">
                  {totalVisits}
                </p>
              </div>

              <div className="rounded-2xl bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-wide text-stone-500">
                  Total gastado
                </p>
                <p className="mt-2 font-medium text-stone-900">
                  S/ {totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-6 rounded-2xl bg-stone-50 p-6 text-sm text-stone-600">
              Cargando historial...
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="mt-6 rounded-2xl bg-stone-50 p-6 text-sm text-stone-600">
              No se encontraron reservas para este cliente.
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <>
              <div className="mt-8 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                Reservas completadas: <strong>{completedVisits}</strong>
              </div>

              <div className="mt-6 overflow-x-auto rounded-[2rem] border border-stone-200">
                <table className="min-w-full bg-white text-left text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-stone-900">Fecha</th>
                      <th className="px-5 py-4 font-semibold text-stone-900">Hora</th>
                      <th className="px-5 py-4 font-semibold text-stone-900">Servicio</th>
                      <th className="px-5 py-4 font-semibold text-stone-900">Lashista</th>
                      <th className="px-5 py-4 font-semibold text-stone-900">Estado</th>
                      <th className="px-5 py-4 font-semibold text-stone-900">Total</th>
                      <th className="px-5 py-4 font-semibold text-stone-900">Abono</th>
                      <th className="px-5 py-4 font-semibold text-stone-900">Saldo</th>
                      <th className="px-5 py-4 font-semibold text-stone-900">Notas</th>
                      <th className="px-5 py-4 font-semibold text-stone-900">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.map((item) => {
                      const service = getServiceData(item.services)

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-stone-100 align-top"
                        >
                          <td className="px-5 py-4 text-stone-700">{item.date}</td>
                          <td className="px-5 py-4 text-stone-700">
                            {formatTime(item.time)}
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
                            {item.lashista ?? "Sin asignar"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                                item.status
                              )}`}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-stone-700">
                            S/ {Number(item.total_price ?? 0).toFixed(2)}
                          </td>

                          <td className="px-5 py-4 text-stone-700">
                            S/ {Number(item.deposit_amount ?? 0).toFixed(2)}
                          </td>

                          <td className="px-5 py-4 text-stone-700">
                            S/ {Number(item.remaining_amount ?? 0).toFixed(2)}
                          </td>

                          <td className="px-5 py-4 text-stone-700">
                            {item.notes ?? "-"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={`/admin/reservas/${item.id}`}
                                className="rounded-full border border-stone-300 px-3 py-1 text-xs"
                              >
                                Ver / Editar
                              </Link>

                              <Link
                                to={`/admin/pagos/${item.id}`}
                                className="rounded-full border border-stone-300 px-3 py-1 text-xs"
                              >
                                Pagos
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminClientHistoryPage