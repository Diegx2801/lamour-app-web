import { useEffect, useMemo, useState } from "react"
import {
  fetchReservations,
  updateReservationStatus,
} from "../api/adminReservationsService"

type TabKey = "active" | "completed" | "cancelled"

export function useAdminReservations() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedDate, setSelectedDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<TabKey>("active")

  const load = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await fetchReservations()
      setReservations(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar las reservas."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const clearFilters = () => {
    setSelectedDate("")
    setSearchTerm("")
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      setError("")

      await updateReservationStatus(id, status)

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? { ...reservation, status } : reservation
        )
      )
    } catch {
      setError("Error al actualizar estado.")
    }
  }

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase().replace(/\s+/g, " ")

    return reservations.filter((reservation) => {
      const client = Array.isArray(reservation.clients)
        ? reservation.clients[0]
        : reservation.clients

      const matchesDate = selectedDate
        ? reservation.date === selectedDate
        : true

      if (!matchesDate) return false
      if (!search) return true

      const fullName = client?.full_name?.toLowerCase() ?? ""
      const phone = client?.phone?.toLowerCase() ?? ""

      return fullName.includes(search) || phone.includes(search)
    })
  }, [reservations, selectedDate, searchTerm])

  const active = useMemo(() => {
    return filtered.filter(
      (reservation) =>
        reservation.status === "pending" || reservation.status === "confirmed"
    )
  }, [filtered])

  const completed = useMemo(() => {
    return filtered.filter((reservation) => reservation.status === "completed")
  }, [filtered])

  const cancelled = useMemo(() => {
    return filtered.filter((reservation) => reservation.status === "cancelled")
  }, [filtered])

  const rows = useMemo(() => {
    if (activeTab === "active") return active
    if (activeTab === "completed") return completed
    return cancelled
  }, [activeTab, active, completed, cancelled])

  return {
    loading,
    error,

    selectedDate,
    setSelectedDate,
    searchTerm,
    setSearchTerm,
    clearFilters,

    activeTab,
    setActiveTab,

    activeCount: active.length,
    completedCount: completed.length,
    cancelledCount: cancelled.length,

    rows,
    updateStatus,
  }
}