import { useEffect, useState } from "react"
import { Link } from "react-router"
import { useAdminRetention } from "../features/admin-retention/hooks/useAdminRetention"
import { supabase } from "../lib/supabase"

function formatDate(date: string) {
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

function AdminRetentionPage() {
  const retention = useAdminRetention()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const loadRole = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single()

      setRole(data?.role ?? null)
    }

    loadRole()
  }, [])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Fidelización
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Clientas por recuperar
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Detecta clientas que dejaron de reservar y abre WhatsApp con un
            mensaje amable para invitarlas a volver.
          </p>
        </div>

        <button
          type="button"
          onClick={retention.refresh}
          disabled={retention.loading}
          className="rounded-2xl bg-stone-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          Actualizar
        </button>
      </div>

      <section className="mb-5 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm md:p-5">
        <label className="block max-w-xs">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Mostrar desde
          </span>
          <select
            value={retention.minDays}
            onChange={(event) => retention.setMinDays(Number(event.target.value))}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700"
          >
            <option value={30}>30 días sin volver</option>
            <option value={45}>45 días sin volver</option>
            <option value={60}>60 días sin volver</option>
            <option value={90}>90 días sin volver</option>
          </select>
        </label>
      </section>

      {retention.error && (
        <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {retention.error}
        </p>
      )}

      {retention.loading ? (
        <div className="rounded-3xl bg-white p-5 text-sm text-stone-600 shadow-sm">
          Cargando clientas...
        </div>
      ) : retention.clients.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-sm text-stone-500">
          No hay clientas inactivas con ese filtro.
        </div>
      ) : (
        <div className="grid gap-3">
          {retention.clients.map((client) => (
            <article
              key={client.clientId}
              className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm md:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-stone-950">
                      {client.clientName}
                    </h2>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      {client.daysInactive} días sin volver
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">
                    Última visita: {formatDate(client.lastDate)} ·{" "}
                    {client.lastService}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {client.visits} visitas registradas · {client.phone || "Sin teléfono"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => retention.openWhatsapp(client)}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    WhatsApp
                  </button>
                  {(role === "owner" || role === "admin") && (
                    <Link
                      to={`/admin/clientes/${client.clientId}/historial`}
                      className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
                    >
                      Historial
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminRetentionPage
