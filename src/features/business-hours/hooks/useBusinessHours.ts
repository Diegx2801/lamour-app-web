import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  createAdminActivityLog,
} from "../../appointment-audit/api/appointmentAuditService"
import {
  fetchBusinessHours,
  updateBusinessHour,
} from "../api/businessHoursService"
import {
  fallbackBusinessHours,
  type BusinessHour,
} from "../utils/businessHoursUtils"

export function useBusinessHours() {
  const [businessHours, setBusinessHours] =
    useState<BusinessHour[]>(fallbackBusinessHours)
  const [savedBusinessHours, setSavedBusinessHours] =
    useState<BusinessHour[]>(fallbackBusinessHours)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | number | null>(null)

  const loadBusinessHours = async () => {
    try {
      setLoading(true)
      const data = await fetchBusinessHours()
      setBusinessHours(data)
      setSavedBusinessHours(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBusinessHours()
  }, [])

  const updateLocalHour = (
    dayOfWeek: number,
    patch: Partial<BusinessHour>
  ) => {
    setBusinessHours((current) =>
      current.map((hour) =>
        hour.day_of_week === dayOfWeek ? { ...hour, ...patch } : hour
      )
    )
  }

  const saveHour = async (hour: BusinessHour) => {
    try {
      setSavingId(hour.id ?? hour.day_of_week)
      const previousHour =
        savedBusinessHours.find((item) => item.day_of_week === hour.day_of_week) ??
        null

      await updateBusinessHour(hour)
      await createAdminActivityLog({
        entityType: "business_hours",
        entityId: hour.id ?? hour.day_of_week,
        action: "business_hours_updated",
        details: {
          previous: previousHour,
          next: hour,
          source: "business_hours",
        },
      })
      toast.success("Horario guardado.")
      await loadBusinessHours()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar.")
    } finally {
      setSavingId(null)
    }
  }

  return {
    businessHours,
    loading,
    savingId,
    reload: loadBusinessHours,
    updateLocalHour,
    saveHour,
  }
}
