import { useEffect, useMemo, useState } from "react"
import {
  fetchDashboardAppointments,
  fetchDashboardPayments,
  type DashboardAppointmentRow,
  type DashboardPaymentRow,
} from "../api/adminDashboardService"

export type Stats = {
  totalReservations: number
  rangeReservations: number
  todayReservations: number
  todayPending: number
  todayConfirmed: number
  todayCompleted: number
  todayNoShow: number
  monthCancelled: number
  monthNoShow: number
  todayIncome: number
  monthIncome: number
  rangeIncome: number
  totalPendingAmount: number
  averageTicket: number
  completionRate: number
  noShowRate: number
}

export type TopService = {
  name: string
  count: number
}

export type UpcomingReservation = {
  id: string
  time: string
  clientName: string
  serviceName: string
  status: string
}

export type DailyIncome = {
  date: string
  label: string
  amount: number
}

export type StatusCount = {
  status: string
  label: string
  count: number
}

const initialStats: Stats = {
  totalReservations: 0,
  rangeReservations: 0,
  todayReservations: 0,
  todayPending: 0,
  todayConfirmed: 0,
  todayCompleted: 0,
  todayNoShow: 0,
  monthCancelled: 0,
  monthNoShow: 0,
  todayIncome: 0,
  monthIncome: 0,
  rangeIncome: 0,
  totalPendingAmount: 0,
  averageTicket: 0,
  completionRate: 0,
  noShowRate: 0,
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getClientData(clients: DashboardAppointmentRow["clients"]) {
  if (!clients) return null
  return Array.isArray(clients) ? clients[0] ?? null : clients
}

function getServiceData(services: DashboardAppointmentRow["services"]) {
  if (!services) return null
  return Array.isArray(services) ? services[0] ?? null : services
}

function normalizeTime(time: string | null | undefined) {
  return String(time ?? "").slice(0, 5)
}

function timeToMinutes(time: string) {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number)
  return hours * 60 + minutes
}

function isTodayFutureReservation(row: DashboardAppointmentRow, today: string) {
  if (row.date !== today) return false
  if (row.status === "cancelled" || row.status === "completed") return false

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  return timeToMinutes(row.time) >= currentMinutes
}

export function getStatusLabel(status: string) {
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

function getLastNDates(days: number) {
  const dates: string[] = []
  const base = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(base)
    date.setDate(base.getDate() - i)
    dates.push(getLocalDateString(date))
  }

  return dates
}

function formatShortDate(date: string) {
  const [, month, day] = date.split("-")
  return `${day}/${month}`
}

function buildDateRange(start: string, end: string) {
  const list: string[] = []
  const current = new Date(`${start}T12:00:00`)
  const limit = new Date(`${end}T12:00:00`)

  while (current <= limit) {
    list.push(getLocalDateString(current))
    current.setDate(current.getDate() + 1)
  }

  return list
}

function calculateRate(value: number, total: number) {
  if (total <= 0) return 0
  return Number(((value / total) * 100).toFixed(1))
}

function calculateDashboardData(params: {
  appointments: DashboardAppointmentRow[]
  payments: DashboardPaymentRow[]
  today: string
  currentMonth: string
  rangeStart: string
  rangeEnd: string
}) {
  const { appointments, payments, today, currentMonth, rangeStart, rangeEnd } =
    params

  const todayRows = appointments.filter((row) => row.date === today)

  const rangeAppointments = appointments.filter(
    (row) => row.date >= rangeStart && row.date <= rangeEnd
  )

  const validPayments = payments.filter(
    (payment) => payment.status === "completed" && payment.created_at
  )

  const todayIncome = validPayments
    .filter((payment) => payment.created_at?.startsWith(today))
    .reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0)

  const monthIncome = validPayments
    .filter((payment) => payment.created_at?.startsWith(currentMonth))
    .reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0)

  const rangeIncome = validPayments
    .filter((payment) => {
      const paymentDate = payment.created_at?.slice(0, 10)
      return Boolean(paymentDate && paymentDate >= rangeStart && paymentDate <= rangeEnd)
    })
    .reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0)

  const totalPendingAmount = appointments
    .filter((row) => row.status === "pending" || row.status === "confirmed")
    .reduce((acc, row) => acc + Number(row.remaining_amount ?? 0), 0)

  const completedAppointments = appointments.filter(
    (row) => row.status === "completed"
  )

  const completedIncomeByAppointments = completedAppointments.reduce(
    (acc, row) => acc + Number(row.total_price ?? 0),
    0
  )

  const averageTicket =
    completedAppointments.length > 0
      ? completedIncomeByAppointments / completedAppointments.length
      : 0

  const serviceCounter = new Map<string, number>()

  appointments
    .filter((row) => row.status !== "cancelled" && row.status !== "no_show")
    .forEach((row) => {
      const service = getServiceData(row.services)
      const serviceName = service?.name?.trim() || "Sin servicio"

      serviceCounter.set(serviceName, (serviceCounter.get(serviceName) ?? 0) + 1)
    })

  const topServices: TopService[] = Array.from(serviceCounter.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const upcomingReservations: UpcomingReservation[] = todayRows
    .filter((row) => isTodayFutureReservation(row, today))
    .sort((a, b) => normalizeTime(a.time).localeCompare(normalizeTime(b.time)))
    .slice(0, 6)
    .map((row) => {
      const client = getClientData(row.clients)
      const service = getServiceData(row.services)

      return {
        id: row.id,
        time: normalizeTime(row.time),
        clientName: client?.full_name?.trim() || "Sin nombre",
        serviceName: service?.name?.trim() || "Sin servicio",
        status: row.status,
      }
    })

  const dateList = buildDateRange(rangeStart, rangeEnd)
  const incomeMap = new Map<string, number>()

  dateList.forEach((date) => incomeMap.set(date, 0))

  validPayments.forEach((payment) => {
    const paymentDate = payment.created_at?.slice(0, 10)

    if (!paymentDate || paymentDate < rangeStart || paymentDate > rangeEnd) {
      return
    }

    incomeMap.set(
      paymentDate,
      Number(incomeMap.get(paymentDate) ?? 0) + Number(payment.amount ?? 0)
    )
  })

  const dailyIncome: DailyIncome[] =
    dateList.length <= 14
      ? dateList.map((date) => ({
          date,
          label: formatShortDate(date),
          amount: Number(incomeMap.get(date) ?? 0),
        }))
      : Array.from({ length: Math.ceil(dateList.length / 7) }).map((_, index) => {
          const weekDates = dateList.slice(index * 7, index * 7 + 7)
          const start = weekDates[0]
          const end = weekDates[weekDates.length - 1]

          const amount = weekDates.reduce(
            (acc, date) => acc + Number(incomeMap.get(date) ?? 0),
            0
          )

          return {
            date: start,
            label: `${formatShortDate(start)} - ${formatShortDate(end)}`,
            amount,
          }
        })

  const statusOrder = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
  ]

  const statusCounts: StatusCount[] = statusOrder.map((status) => ({
    status,
    label: getStatusLabel(status),
    count: rangeAppointments.filter((row) => row.status === status).length,
  }))

  const completedInRange = rangeAppointments.filter(
    (row) => row.status === "completed"
  ).length

  const noShowInRange = rangeAppointments.filter(
    (row) => row.status === "no_show"
  ).length

  const stats: Stats = {
    totalReservations: appointments.length,
    rangeReservations: rangeAppointments.length,
    todayReservations: todayRows.length,
    todayPending: todayRows.filter((row) => row.status === "pending").length,
    todayConfirmed: todayRows.filter((row) => row.status === "confirmed").length,
    todayCompleted: todayRows.filter((row) => row.status === "completed").length,
    todayNoShow: todayRows.filter((row) => row.status === "no_show").length,
    monthCancelled: appointments.filter(
      (row) => row.date?.startsWith(currentMonth) && row.status === "cancelled"
    ).length,
    monthNoShow: appointments.filter(
      (row) => row.date?.startsWith(currentMonth) && row.status === "no_show"
    ).length,
    todayIncome,
    monthIncome,
    rangeIncome,
    totalPendingAmount,
    averageTicket,
    completionRate: calculateRate(completedInRange, rangeAppointments.length),
    noShowRate: calculateRate(noShowInRange, rangeAppointments.length),
  }

  return {
    stats,
    topServices,
    upcomingReservations,
    dailyIncome,
    statusCounts,
  }
}

export function useAdminDashboard() {
  const today = useMemo(() => getLocalDateString(), [])
  const currentMonth = useMemo(() => today.slice(0, 7), [today])

  const [rangeStart, setRangeStart] = useState(getLastNDates(7)[0])
  const [rangeEnd, setRangeEnd] = useState(today)

  const [appointments, setAppointments] = useState<DashboardAppointmentRow[]>([])
  const [payments, setPayments] = useState<DashboardPaymentRow[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError("")

      const [appointmentRows, paymentRows] = await Promise.all([
        fetchDashboardAppointments(),
        fetchDashboardPayments(),
      ])

      setAppointments(appointmentRows)
      setPayments(paymentRows)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el dashboard."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const dashboardData = useMemo(() => {
    return calculateDashboardData({
      appointments,
      payments,
      today,
      currentMonth,
      rangeStart,
      rangeEnd,
    })
  }, [appointments, payments, today, currentMonth, rangeStart, rangeEnd])

  const maxDailyIncome = useMemo(() => {
    return Math.max(...dashboardData.dailyIncome.map((item) => item.amount), 0)
  }, [dashboardData.dailyIncome])

  const maxStatusCount = useMemo(() => {
    return Math.max(...dashboardData.statusCounts.map((item) => item.count), 0)
  }, [dashboardData.statusCounts])

  const setLastDaysRange = (days: number) => {
    const dates = getLastNDates(days)
    setRangeStart(dates[0])
    setRangeEnd(today)
  }

  const downloadPdfReport = () => {
    const reportWindow = window.open("", "_blank")
    if (!reportWindow) return

    const html = `
      <html>
        <head>
          <title>Reporte Dashboard</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #1c1917;
            }

            h1 {
              margin-bottom: 4px;
            }

            h2 {
              margin-top: 28px;
            }

            .muted {
              color: #78716c;
              font-size: 13px;
            }

            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
              margin-top: 24px;
            }

            .card {
              border: 1px solid #ddd6ce;
              border-radius: 12px;
              padding: 16px;
            }

            .label {
              color: #78716c;
              font-size: 12px;
            }

            .value {
              font-size: 24px;
              font-weight: bold;
              margin-top: 8px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border-bottom: 1px solid #e7e5e4;
              padding: 10px;
              text-align: left;
              font-size: 13px;
            }

            th {
              background: #f5f5f4;
            }
          </style>
        </head>
        <body>
          <h1>Reporte administrativo</h1>
          <p class="muted">Rango: ${rangeStart} al ${rangeEnd}</p>

          <div class="grid">
            <div class="card"><div class="label">Reservas del rango</div><div class="value">${dashboardData.stats.rangeReservations}</div></div>
            <div class="card"><div class="label">Ingresos del rango</div><div class="value">S/ ${dashboardData.stats.rangeIncome.toFixed(2)}</div></div>
            <div class="card"><div class="label">Ingresos hoy</div><div class="value">S/ ${dashboardData.stats.todayIncome.toFixed(2)}</div></div>
            <div class="card"><div class="label">Ingresos del mes</div><div class="value">S/ ${dashboardData.stats.monthIncome.toFixed(2)}</div></div>
            <div class="card"><div class="label">Saldo pendiente global</div><div class="value">S/ ${dashboardData.stats.totalPendingAmount.toFixed(2)}</div></div>
            <div class="card"><div class="label">Ticket promedio</div><div class="value">S/ ${dashboardData.stats.averageTicket.toFixed(2)}</div></div>
            <div class="card"><div class="label">Tasa completadas</div><div class="value">${dashboardData.stats.completionRate}%</div></div>
            <div class="card"><div class="label">Tasa no show</div><div class="value">${dashboardData.stats.noShowRate}%</div></div>
          </div>

          <h2>Ingresos por periodo</h2>
          <table>
            <thead>
              <tr>
                <th>Periodo</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${dashboardData.dailyIncome
                .map(
                  (item) =>
                    `<tr><td>${item.label}</td><td>S/ ${item.amount.toFixed(2)}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>

          <h2>Reservas por estado</h2>
          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${dashboardData.statusCounts
                .map(
                  (item) =>
                    `<tr><td>${item.label}</td><td>${item.count}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>

          <h2>Servicios más vendidos</h2>
          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${dashboardData.topServices
                .map(
                  (item) => `<tr><td>${item.name}</td><td>${item.count}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `

    reportWindow.document.write(html)
    reportWindow.document.close()
    reportWindow.print()
  }

  return {
    today,
    rangeStart,
    rangeEnd,
    setRangeStart,
    setRangeEnd,
    setLastDaysRange,
    downloadPdfReport,

    stats: dashboardData.stats ?? initialStats,
    topServices: dashboardData.topServices,
    upcomingReservations: dashboardData.upcomingReservations,
    dailyIncome: dashboardData.dailyIncome,
    statusCounts: dashboardData.statusCounts,

    maxDailyIncome,
    maxStatusCount,

    loading,
    error,
    refresh: loadDashboard,
  }
}
