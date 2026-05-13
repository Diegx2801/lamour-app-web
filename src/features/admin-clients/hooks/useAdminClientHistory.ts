import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import {
  fetchClientHistory,
  type ClientHistoryRow,
  type ClientRelation,
  type ServiceRelation,
} from "../api/adminClientHistoryService"

function getClientData(clients: ClientRelation) {
  if (!clients) return null
  return Array.isArray(clients) ? clients[0] ?? null : clients
}

export function getServiceData(services: ServiceRelation) {
  if (!services) return null
  return Array.isArray(services) ? services[0] ?? null : services
}

export function getStatusClasses(status: string) {
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

export function formatTime(time: string) {
  return String(time).slice(0, 5)
}

export function formatMoney(value: number | null | undefined) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`
}

export function useAdminClientHistory() {
  const { clientId } = useParams()

  const [history, setHistory] = useState<ClientHistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      if (!clientId) {
        throw new Error("Cliente no encontrado.")
      }

      const data = await fetchClientHistory(clientId)
      setHistory(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado."
      )
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

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

  const pendingBalance = useMemo(() => {
    return history
      .filter((item) => item.status !== "cancelled")
      .reduce((acc, item) => acc + Number(item.remaining_amount ?? 0), 0)
  }, [history])

  const downloadPdfReport = () => {
    const reportWindow = window.open("", "_blank")
    if (!reportWindow) return

    const clientName = clientInfo?.full_name ?? "Sin nombre"
    const clientPhone = clientInfo?.phone ?? "Sin teléfono"

    const rows = history
      .map((item) => {
        const service = getServiceData(item.services)

        return `
          <tr>
            <td>${item.date}</td>
            <td>${formatTime(item.time)}</td>
            <td>${service?.name ?? "Sin servicio"}</td>
            <td>${item.lashista ?? "Sin asignar"}</td>
            <td>${getStatusLabel(item.status)}</td>
            <td>${formatMoney(item.total_price)}</td>
            <td>${formatMoney(item.deposit_amount)}</td>
            <td>${formatMoney(item.remaining_amount)}</td>
            <td>${item.notes ?? "-"}</td>
          </tr>
        `
      })
      .join("")

    const html = `
      <html>
        <head>
          <title>Historial del cliente</title>
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
              font-size: 18px;
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
              font-size: 22px;
              font-weight: bold;
              margin-top: 8px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }

            th, td {
              border-bottom: 1px solid #e7e5e4;
              padding: 9px;
              text-align: left;
              font-size: 12px;
              vertical-align: top;
            }

            th {
              background: #f5f5f4;
            }
          </style>
        </head>

        <body>
          <h1>Historial del cliente</h1>
          <p class="muted">Reporte generado desde el panel administrativo.</p>

          <div class="grid">
            <div class="card">
              <div class="label">Cliente</div>
              <div class="value">${clientName}</div>
            </div>

            <div class="card">
              <div class="label">Teléfono</div>
              <div class="value">${clientPhone}</div>
            </div>

            <div class="card">
              <div class="label">Total de visitas</div>
              <div class="value">${totalVisits}</div>
            </div>

            <div class="card">
              <div class="label">Reservas completadas</div>
              <div class="value">${completedVisits}</div>
            </div>

            <div class="card">
              <div class="label">Total gastado</div>
              <div class="value">${formatMoney(totalSpent)}</div>
            </div>

            <div class="card">
              <div class="label">Saldo pendiente</div>
              <div class="value">${formatMoney(pendingBalance)}</div>
            </div>
          </div>

          <h2>Detalle de reservas</h2>

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Lashista</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Abono</th>
                <th>Saldo</th>
                <th>Notas</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
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
    history,
    loading,
    error,

    clientInfo,
    totalVisits,
    completedVisits,
    totalSpent,
    pendingBalance,

    downloadPdfReport,
  }
}
