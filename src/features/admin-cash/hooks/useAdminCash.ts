import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  fetchCashAppointmentsByDate,
  fetchCashPaymentsByDate,
  type CashAppointmentRow,
  type CashPaymentRow,
} from "../api/adminCashService"

function getLocalDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getSingle<T>(value: T | T[] | null) {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export function formatMoney(value: number | null | undefined) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`
}

export function getPaymentTypeLabel(type: string | null | undefined) {
  switch (type) {
    case "deposit":
      return "Abono"
    case "remaining":
      return "Pago restante"
    case "full":
      return "Pago completo"
    case "adjustment":
      return "Ajuste"
    default:
      return "Pago"
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export function useAdminCash() {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString())
  const [payments, setPayments] = useState<CashPaymentRow[]>([])
  const [appointments, setAppointments] = useState<CashAppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadCash = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const [paymentRows, appointmentRows] = await Promise.all([
        fetchCashPaymentsByDate(selectedDate),
        fetchCashAppointmentsByDate(selectedDate),
      ])

      setPayments(paymentRows)
      setAppointments(appointmentRows)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar caja."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    loadCash()
  }, [loadCash])

  const summary = useMemo(() => {
    const dailyIncome = payments.reduce(
      (acc, payment) => acc + Number(payment.amount ?? 0),
      0
    )

    const depositIncome = payments
      .filter((payment) => payment.payment_type === "deposit")
      .reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0)

    const pendingBalance = appointments
      .filter((appointment) => appointment.status !== "cancelled")
      .reduce(
        (acc, appointment) => acc + Number(appointment.remaining_amount ?? 0),
        0
      )

    const completedWithDebt = appointments.filter(
      (appointment) =>
        appointment.status === "completed" &&
        Number(appointment.remaining_amount ?? 0) > 0
    )

    return {
      dailyIncome,
      depositIncome,
      pendingBalance,
      completedWithDebt,
    }
  }, [appointments, payments])

  const downloadPdfReport = () => {
    const reportWindow = window.open("", "_blank")
    if (!reportWindow) return

    const paymentRows =
      payments.length > 0
        ? payments
            .map(
              (payment) => `
                <tr>
                  <td>${payment.created_at?.slice(11, 16) ?? "--:--"}</td>
                  <td>${formatMoney(payment.amount)}</td>
                  <td>${escapeHtml(payment.payment_method ?? "Sin método")}</td>
                  <td>${escapeHtml(getPaymentTypeLabel(payment.payment_type))}</td>
                </tr>
              `
            )
            .join("")
        : `<tr><td colspan="4">No hay pagos registrados.</td></tr>`

    const debtRows =
      summary.completedWithDebt.length > 0
        ? summary.completedWithDebt
            .map((appointment) => {
              const client = getSingle(appointment.clients)
              const service = getSingle(appointment.services)

              return `
                <tr>
                  <td>${appointment.time?.slice(0, 5) ?? "--:--"}</td>
                  <td>${escapeHtml(client?.full_name ?? "Sin nombre")}</td>
                  <td>${escapeHtml(service?.name ?? "Sin servicio")}</td>
                  <td>${formatMoney(appointment.remaining_amount)}</td>
                </tr>
              `
            })
            .join("")
        : `<tr><td colspan="4">No hay citas completadas con saldo.</td></tr>`

    const html = `
      <html>
        <head>
          <title>Reporte de caja</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #1c1917;
            }

            h1 { margin-bottom: 4px; }
            h2 { margin-top: 28px; font-size: 18px; }
            .muted { color: #78716c; font-size: 13px; }
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
            .label { color: #78716c; font-size: 12px; }
            .value {
              font-size: 24px;
              font-weight: bold;
              margin-top: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 14px;
            }
            th, td {
              border-bottom: 1px solid #e7e5e4;
              padding: 9px;
              text-align: left;
              font-size: 12px;
            }
            th { background: #f5f5f4; }
          </style>
        </head>
        <body>
          <h1>Reporte de caja</h1>
          <p class="muted">Fecha: ${selectedDate}</p>

          <div class="grid">
            <div class="card">
              <div class="label">Ingresos del día</div>
              <div class="value">${formatMoney(summary.dailyIncome)}</div>
            </div>
            <div class="card">
              <div class="label">Abonos recibidos</div>
              <div class="value">${formatMoney(summary.depositIncome)}</div>
            </div>
            <div class="card">
              <div class="label">Saldos pendientes</div>
              <div class="value">${formatMoney(summary.pendingBalance)}</div>
            </div>
            <div class="card">
              <div class="label">Completadas con saldo</div>
              <div class="value">${summary.completedWithDebt.length}</div>
            </div>
          </div>

          <h2>Pagos recibidos</h2>
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>${paymentRows}</tbody>
          </table>

          <h2>Citas completadas con saldo</h2>
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>${debtRows}</tbody>
          </table>
        </body>
      </html>
    `

    reportWindow.document.write(html)
    reportWindow.document.close()
    reportWindow.print()
  }

  return {
    selectedDate,
    setSelectedDate,
    payments,
    appointments,
    summary,
    loading,
    error,
    refresh: loadCash,
    downloadPdfReport,
  }
}
