import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  createSiteContentItem,
  deleteSiteContentItem,
  fetchAdminSiteContent,
  toggleSiteContentItem,
  updateSiteContentItem,
  uploadSiteContentImage,
  type SiteContentFormValues,
  type SiteContentItem,
} from "../api/siteContentService"

const initialForm: SiteContentFormValues = {
  section: "hero",
  title: "",
  subtitle: "",
  category: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
}

export function useAdminSiteContent() {
  const [items, setItems] = useState<SiteContentItem[]>([])
  const [form, setForm] = useState<SiteContentFormValues>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const loadItems = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await fetchAdminSiteContent()
      setItems(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar contenido."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const summary = useMemo(() => {
    return {
      total: items.length,
      hero: items.filter((item) => item.section === "hero").length,
      gallery: items.filter((item) => item.section === "gallery").length,
      active: items.filter((item) => item.is_active).length,
    }
  }, [items])

  const resetForm = () => {
    setEditingId(null)
    setForm(initialForm)
  }

  const startEdit = (item: SiteContentItem) => {
    setEditingId(item.id)
    setForm({
      section: item.section,
      title: item.title,
      subtitle: item.subtitle ?? "",
      category: item.category ?? "",
      image_url: item.image_url,
      is_active: item.is_active,
      sort_order: item.sort_order ?? 0,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const updateForm = <Field extends keyof SiteContentFormValues>(
    field: Field,
    value: SiteContentFormValues[Field]
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const imageUrl = await uploadSiteContentImage(file)
      updateForm("image_url", imageUrl)
      toast.success("Imagen subida.")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo subir la imagen."
      toast.error(message)
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.title.trim() || !form.image_url.trim()) {
      toast.error("Completa título e imagen.")
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        await updateSiteContentItem(editingId, form)
        toast.success("Contenido actualizado.")
      } else {
        await createSiteContentItem(form)
        toast.success("Contenido creado.")
      }

      resetForm()
      await loadItems()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar el contenido."
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (item: SiteContentItem) => {
    try {
      await toggleSiteContentItem(item.id, !item.is_active)
      await loadItems()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cambiar el estado."
      toast.error(message)
    }
  }

  const deleteItem = async (item: SiteContentItem) => {
    if (!window.confirm(`¿Eliminar "${item.title}"?`)) return

    try {
      await deleteSiteContentItem(item.id)
      await loadItems()
      toast.success("Contenido eliminado.")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar."
      toast.error(message)
    }
  }

  return {
    items,
    form,
    editingId,
    loading,
    saving,
    uploading,
    error,
    summary,
    reload: loadItems,
    resetForm,
    startEdit,
    updateForm,
    handleImageChange,
    handleSubmit,
    toggleStatus,
    deleteItem,
  }
}
