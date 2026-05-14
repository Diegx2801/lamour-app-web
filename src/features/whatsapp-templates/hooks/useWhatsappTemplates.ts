import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  fetchWhatsappTemplates,
  updateWhatsappTemplate,
  type WhatsappTemplateRow,
} from "../api/whatsappTemplatesService"

export function useWhatsappTemplates() {
  const [templates, setTemplates] = useState<WhatsappTemplateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError("")
      setTemplates(await fetchWhatsappTemplates())
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar plantillas."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const updateLocalTemplate = (
    id: string,
    patch: Partial<Pick<WhatsappTemplateRow, "title" | "message" | "is_active">>
  ) => {
    setTemplates((current) =>
      current.map((template) =>
        template.id === id ? { ...template, ...patch } : template
      )
    )
  }

  const saveTemplate = async (template: WhatsappTemplateRow) => {
    try {
      setSavingId(template.id)
      await updateWhatsappTemplate({
        id: template.id,
        title: template.title,
        message: template.message,
        isActive: template.is_active,
      })
      toast.success("Plantilla guardada.")
      await loadTemplates()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar la plantilla."
      toast.error(message)
    } finally {
      setSavingId(null)
    }
  }

  return {
    templates,
    loading,
    savingId,
    error,
    reload: loadTemplates,
    updateLocalTemplate,
    saveTemplate,
  }
}
