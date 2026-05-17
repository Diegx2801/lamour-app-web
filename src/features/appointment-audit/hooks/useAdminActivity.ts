import { useEffect, useMemo, useState } from "react"
import {
  fetchUnifiedAdminActivity,
  type AdminActivityLog,
  type AppointmentAuditActivity,
} from "../api/appointmentAuditService"
import {
  formatAuditDetails,
  getAuditLabel,
} from "../utils/auditFormatters"

export function getSingle<T>(value: T | T[] | null | undefined) {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function getLocalDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function useAdminActivity() {
  const [logs, setLogs] = useState<(AppointmentAuditActivity | AdminActivityLog)[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [search, setSearch] = useState("")

  const loadActivity = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await fetchUnifiedAdminActivity()
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar actividad.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivity()
  }, [])

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return logs.filter((log) => {
      const appointment = getSingle(log.appointments)
      const client = getSingle(appointment?.clients)
      const service = getSingle(appointment?.services)

      const matchesAction =
        actionFilter === "all" ? true : log.action === actionFilter
      const matchesDate = dateFilter
        ? log.created_at.slice(0, 10) === dateFilter
        : true

      const text = [
        log.actor_email,
        log.action,
        getAuditLabel(log.action),
        formatAuditDetails(log.details),
        "entity_type" in log ? log.entity_type : "",
        client?.full_name,
        client?.phone,
        service?.name,
        service?.category,
        appointment?.date,
        appointment?.time,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return (
        matchesAction &&
        matchesDate &&
        (!normalizedSearch || text.includes(normalizedSearch))
      )
    })
  }, [actionFilter, dateFilter, logs, search])

  const clearFilters = () => {
    setSearch("")
    setActionFilter("all")
    setDateFilter("")
  }

  return {
    logs: filteredLogs,
    totalLogs: logs.length,
    loading,
    error,
    actionFilter,
    setActionFilter,
    dateFilter,
    setDateFilter,
    search,
    setSearch,
    clearFilters,
    today: getLocalDateString(),
    refresh: loadActivity,
  }
}
