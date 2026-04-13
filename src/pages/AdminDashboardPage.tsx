import { useEffect, useState } from "react"
import { Link } from "react-router"
import { supabase } from "../lib/supabase"

type Stats = {
  totalReservations: number
  todayReservations: number
  todayPending: number
  todayConfirmed: number
  todayCompleted: number
  todayIncome: number
  monthIncome: number
  totalPendingAmount: number
}

function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalReservations: 0,
    todayReservations: 0,
    todayPending: 0,
    todayConfirmed: 0,
    todayCompleted: 0,
    todayIncome: 0,
    monthIncome: 0,
    totalPendingAmount: 0,
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
          throw new Error("Error cargando datos.")
        }

        const rows = data ?? []

        const today = new Date().toISOString().split("T")[0]
        const currentMonth = today.slice(0, 7) // YYYY-MM

        const totalReservations = rows.length

        const todayRows = rows.filter((r) => r.date === today)

        const todayReservations = todayRows.length

        const todayPending = todayRows.filter(
          (r) => r.status === "pending"
        ).length

        const todayConfirmed = todayRows.filter(
          (r) => r.status === "confirmed"
        ).length

        const todayCompleted = todayRows.filter(
          (r) => r.status === "completed"
        ).length

        const todayIncome = todayRows
          .filter((r) => r.status === "completed")
          .reduce((acc, r) => acc + Number(r.total_price || 0), 0)

        const monthIncome = rows
          .filter(
            (r) =>
              r.date?.startsWith(currentMonth) &&
              r.status === "completed"
          )
          .reduce((acc, r) => acc + Number(r.total_price || 0), 0)

        const totalPendingAmount = rows
          .filter((r) => r.status !== "completed")
          .reduce((acc, r) => acc + Number(r.remaining_amount || 0), 0)

        setStats({
          totalReservations,
          todayReservations,
          todayPending,
          todayConfirmed,
          todayCompleted,
          todayIncome,
          monthIncome,
          totalPendingAmount,
        })
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error inesperado."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-semibold text-stone-950">
              Dashboard
            </h1>
            <p className="text-sm text-stone-600 mt-2">
              Métricas del negocio en tiempo real
            </p>
          </div>

          <div className="flex gap-2">
            <Link to="/admin/agenda" className="border px-4 py-2 rounded">
              Agenda
            </Link>

            <Link to="/admin/reservas" className="border px-4 py-2 rounded">
              Reservas
            </Link>
          </div>
        </div>

        {loading && <p>Cargando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <Card title="Reservas totales" value={stats.totalReservations} />

            <Card title="Reservas hoy" value={stats.todayReservations} />

            <Card title="Pendientes hoy" value={stats.todayPending} />

            <Card title="Confirmadas hoy" value={stats.todayConfirmed} />

            <Card title="Completadas hoy" value={stats.todayCompleted} />

            <Card
              title="Ingresos hoy"
              value={`S/ ${stats.todayIncome.toFixed(2)}`}
            />

            <Card
              title="Ingresos del mes"
              value={`S/ ${stats.monthIncome.toFixed(2)}`}
            />

            <Card
              title="Saldo pendiente"
              value={`S/ ${stats.totalPendingAmount.toFixed(2)}`}
            />

          </div>
        )}
      </div>
    </div>
  )
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-stone-500">{title}</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-950">
        {value}
      </h2>
    </div>
  )
}

export default AdminDashboardPage