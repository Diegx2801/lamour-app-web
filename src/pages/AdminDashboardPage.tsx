import { useEffect, useState } from "react"
import { Link } from "react-router"
import { supabase } from "../lib/supabase"

type Stats = {
  totalReservations: number
  totalIncome: number
  totalDeposits: number
  totalPending: number
}

function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    totalIncome: 0,
    totalDeposits: 0,
    totalPending: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError("")

        const { data, error } = await supabase
          .from("appointments")
          .select("*")

        if (error) {
          throw new Error("No se pudieron cargar los datos del dashboard.")
        }

        const rows = data ?? []

        const totalReservations = rows.length

        const totalIncome = rows
          .filter((r) => r.status === "completed")
          .reduce((acc, r) => acc + Number(r.total_price || 0), 0)

        const totalDeposits = rows
          .filter((r) => r.status === "confirmed")
          .reduce((acc, r) => acc + Number(r.deposit_amount || 0), 0)

        const totalPending = rows
          .filter((r) => r.status === "pending")
          .reduce((acc, r) => acc + Number(r.total_price || 0), 0)

        setStats({
          totalReservations,
          totalIncome,
          totalDeposits,
          totalPending,
        })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Ocurrió un error inesperado."
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Panel admin
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-stone-950">
              Dashboard
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Resumen general de reservas, abonos e ingresos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
  <Link
    to="/admin/agenda"
    className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800"
  >
    Agenda
  </Link>

  <Link
    to="/admin/reservas"
    className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800"
  >
    Ver reservas
  </Link>

  <Link
    to="/"
    className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white"
  >
    Inicio
  </Link>
</div>
        </div>

        {loading && (
          <div className="rounded-[2rem] bg-white p-8 text-sm text-stone-600 shadow-sm">
            Cargando dashboard...
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm text-stone-500">Reservas registradas</p>
              <h2 className="mt-3 text-3xl font-semibold text-stone-950">
                {stats.totalReservations}
              </h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm text-stone-500">Ingresos completados</p>
              <h2 className="mt-3 text-3xl font-semibold text-stone-950">
                S/ {stats.totalIncome.toFixed(2)}
              </h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm text-stone-500">Abonos confirmados</p>
              <h2 className="mt-3 text-3xl font-semibold text-stone-950">
                S/ {stats.totalDeposits.toFixed(2)}
              </h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-sm text-stone-500">Pendiente por cobrar</p>
              <h2 className="mt-3 text-3xl font-semibold text-stone-950">
                S/ {stats.totalPending.toFixed(2)}
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage