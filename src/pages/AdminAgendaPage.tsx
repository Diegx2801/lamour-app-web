import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { supabase } from "../lib/supabase"
import { timeSlots } from "../data/timeSlots"

type AgendaReservation = {
  id: string
  date: string
  time: string
  status: string
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

function AdminAgendaPage() {
  const today = new Date().toISOString().split("T")[0]

  const [selectedDate, setSelectedDate] = useState(today)
  const [reservations, setReservations] = useState<AgendaReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAgenda = async () => {
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
            clients (
              full_name,
              phone
            ),
            services (
              name,
              category
            )
          `)
          .eq("date", selectedDate)
          .order("time", { ascending: true })

        if (error) {
          throw new Error("No se pudo cargar la agenda.")
        }

        setReservations((data as any) ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.")
      } finally {
        setLoading(false)
      }
    }

    fetchAgenda()
  }, [selectedDate])

  const reservationsByTime = useMemo(() => {
    const grouped: Record<string, AgendaReservation | undefined> = {}

    reservations.forEach((reservation) => {
      const normalizedTime = String(reservation.time).slice(0, 5)
      grouped[normalizedTime] = reservation
    })

    return grouped
  }, [reservations])

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-stone-100 text-stone-700"
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Panel admin
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-stone-950">
              Agenda del día
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Visualiza las reservas por horario y organiza mejor la atención.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/dashboard"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/reservas"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800"
            >
              Ver reservas
            </Link>
          </div>
        </div>

        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-stone-800">
            Seleccionar fecha
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full max-w-xs rounded-xl border border-stone-300 px-4 py-3 outline-none"
          />
        </div>

        {loading && (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-stone-600 shadow-sm">
            Cargando agenda...
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {timeSlots.map((slot) => {
              const reservation = reservationsByTime[slot]

              return (
                <div
                  key={slot}
                  className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm md:grid-cols-[120px_1fr]"
                >
                  <div className="flex items-center text-lg font-semibold text-stone-950">
                    {slot}
                  </div>

                  {reservation ? (
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-stone-950">
                          {reservation.clients?.full_name ?? "Sin nombre"}
                        </p>
                        <p className="text-sm text-stone-600">
                          {reservation.services?.name ?? "Sin servicio"}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          {reservation.clients?.phone ?? "Sin teléfono"}
                        </p>
                        {reservation.notes ? (
                          <p className="mt-2 text-sm text-stone-500">
                            Nota: {reservation.notes}
                          </p>
                        ) : null}
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(
                          reservation.status
                        )}`}
                      >
                        {reservation.status}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center rounded-xl border border-dashed border-stone-200 px-4 py-4 text-sm text-stone-500">
                      Disponible
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAgendaPage