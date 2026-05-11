import { useEffect, useReducer } from "react"
import type { ChangeEvent, FormEvent } from "react"
import PromoForm from "../../components/admin/promos/PromoForm"
import PromoList from "../../components/admin/promos/PromoList"
import PromoPageHeader from "../../components/admin/promos/PromoPageHeader"
import {
  createPromo,
  deletePromo,
  fetchAdminPromos,
  fetchPromoServiceOptions,
  togglePromoStatus,
  updatePromo,
  uploadPromoImage,
  type PromoFormValues,
  type PromoRow,
  type PromoServiceOption,
} from "../../features/promos/api/promoService"

const emptyForm: PromoFormValues = {
  title: "",
  description: "",
  price: "",
  tag: "Promo",
  image_url: "",
  is_active: true,
  sort_order: 0,
  start_date: "",
  end_date: "",
  service_id: "",
}

type PromosState = {
  promos: PromoRow[]
  services: PromoServiceOption[]
  form: PromoFormValues
  editingId: string | null
  loading: boolean
  saving: boolean
  errorMessage: string
  uploadingImage: boolean
}

type PromosAction =
  | { type: "set_promos"; promos: PromoRow[] }
  | { type: "set_services"; services: PromoServiceOption[] }
  | { type: "set_form"; form: PromoFormValues }
  | { type: "update_form"; values: Partial<PromoFormValues> }
  | { type: "set_editing_id"; editingId: string | null }
  | { type: "set_loading"; loading: boolean }
  | { type: "set_saving"; saving: boolean }
  | { type: "set_error"; errorMessage: string }
  | { type: "set_uploading_image"; uploadingImage: boolean }
  | { type: "reset_form" }

const initialState: PromosState = {
  promos: [],
  services: [],
  form: emptyForm,
  editingId: null,
  loading: true,
  saving: false,
  errorMessage: "",
  uploadingImage: false,
}

function promosReducer(
  state: PromosState,
  action: PromosAction
): PromosState {
  switch (action.type) {
    case "set_promos":
      return { ...state, promos: action.promos }
    case "set_services":
      return { ...state, services: action.services }
    case "set_form":
      return { ...state, form: action.form }
    case "update_form":
      return { ...state, form: { ...state.form, ...action.values } }
    case "set_editing_id":
      return { ...state, editingId: action.editingId }
    case "set_loading":
      return { ...state, loading: action.loading }
    case "set_saving":
      return { ...state, saving: action.saving }
    case "set_error":
      return { ...state, errorMessage: action.errorMessage }
    case "set_uploading_image":
      return { ...state, uploadingImage: action.uploadingImage }
    case "reset_form":
      return { ...state, form: emptyForm, editingId: null }
    default:
      return state
  }
}

function AdminPromosPage() {
  const [state, dispatch] = useReducer(promosReducer, initialState)
  const {
    promos,
    services,
    form,
    editingId,
    loading,
    saving,
    errorMessage,
    uploadingImage,
  } = state

  const loadPromos = async () => {
    try {
      dispatch({ type: "set_loading", loading: true })
      const data = await fetchAdminPromos()
      dispatch({ type: "set_promos", promos: data })
    } catch (error) {
      console.error(error)
      dispatch({
        type: "set_error",
        errorMessage: "No se pudieron cargar las promociones.",
      })
    } finally {
      dispatch({ type: "set_loading", loading: false })
    }
  }

  useEffect(() => {
    loadPromos()
  }, [])

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchPromoServiceOptions()
        dispatch({ type: "set_services", services: data })
      } catch (error) {
        console.error(error)
      }
    }

    loadServices()
  }, [])

  const handleFieldChange = <Field extends keyof PromoFormValues>(
    field: Field,
    value: PromoFormValues[Field]
  ) => {
    dispatch({ type: "update_form", values: { [field]: value } })
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      dispatch({ type: "set_uploading_image", uploadingImage: true })
      const imageUrl = await uploadPromoImage(file)
      handleFieldChange("image_url", imageUrl)
    } catch (error) {
      console.error(error)
      alert("No se pudo subir la imagen.")
    } finally {
      dispatch({ type: "set_uploading_image", uploadingImage: false })
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch({ type: "set_error", errorMessage: "" })

    if (!form.title.trim() || !form.description.trim() || !form.price.trim()) {
      dispatch({
        type: "set_error",
        errorMessage: "Completa título, descripción y precio.",
      })
      return
    }

    try {
      dispatch({ type: "set_saving", saving: true })

      if (editingId) {
        await updatePromo(editingId, form)
      } else {
        await createPromo(form)
      }

      dispatch({ type: "reset_form" })
      await loadPromos()
    } catch (error) {
      console.error(error)
      dispatch({
        type: "set_error",
        errorMessage: "No se pudo guardar la promoción.",
      })
    } finally {
      dispatch({ type: "set_saving", saving: false })
    }
  }

  const handleEdit = (promo: PromoRow) => {
    dispatch({ type: "set_editing_id", editingId: promo.id })
    dispatch({
      type: "set_form",
      form: {
      title: promo.title,
      description: promo.description,
      price: promo.price,
      tag: promo.tag ?? "Promo",
      image_url: promo.image_url ?? "",
      is_active: promo.is_active,
      sort_order: promo.sort_order ?? 0,
      start_date: promo.start_date ?? "",
      end_date: promo.end_date ?? "",
      service_id: promo.service_id ?? "",
      },
    })

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    dispatch({ type: "reset_form" })
    dispatch({ type: "set_error", errorMessage: "" })
  }

  const handleToggle = async (promo: PromoRow) => {
    try {
      await togglePromoStatus(promo.id, !promo.is_active)
      await loadPromos()
    } catch (error) {
      console.error(error)
      dispatch({
        type: "set_error",
        errorMessage: "No se pudo cambiar el estado.",
      })
    }
  }

  const handleDelete = async (promo: PromoRow) => {
    const confirmDelete = window.confirm(
      `¿Eliminar la promoción "${promo.title}"?`
    )

    if (!confirmDelete) return

    try {
      await deletePromo(promo.id)
      await loadPromos()
    } catch (error) {
      console.error(error)
      dispatch({
        type: "set_error",
        errorMessage: "No se pudo eliminar la promoción.",
      })
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PromoPageHeader />

      <PromoForm
        form={form}
        editingId={editingId}
        errorMessage={errorMessage}
        saving={saving}
        uploadingImage={uploadingImage}
        services={services}
        onSubmit={handleSubmit}
        onCancelEdit={handleCancelEdit}
        onFieldChange={handleFieldChange}
        onImageChange={handleImageChange}
      />

      <PromoList
        promos={promos}
        loading={loading}
        onEdit={handleEdit}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default AdminPromosPage
