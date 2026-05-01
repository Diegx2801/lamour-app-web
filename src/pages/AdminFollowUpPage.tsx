import { Link } from "react-router"
import {
  buildWhatsAppLink,
  formatDate,
  useAdminFollowUp,
} from "../features/admin-follow-up/hooks/useAdminFollowUp"

function AdminFollowUpPage() {
  const followUp = useAdminFollowUp()

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Fidelización
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-stone-950">
              Seguimiento de retoques
            </h1>

            <p className="mt-2 text-sm text-stone-600">
              Clientes con retoque sugerido cada 15 días después de su última atención completada.
            </p>
          </div>

          <Link
            to="/admin/dashboard"
            className="text-sm font-medium text-stone-600 hover:text-stone-950"
          >
            ← Volver al dashboard
          </Link>
        </div>

        {followUp.loading && (
          <div className="rounded-2xl bg-white p-6 text-sm text-stone-500">
            Cargando seguimiento...
          </div>
        )}

        {followUp.error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {followUp.error}
          </div>
        )}

        {!followUp.loading && !followUp.error && followUp.followUps.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-sm text-stone-500">
            No hay clientes con servicios completados para seguimiento.
          </div>
        )}

        {!followUp.loading && !followUp.error && followUp.followUps.length > 0 && (
          <div className="space-y-4">
            {followUp.followUps.map((item) => (
              <div
                key={item.clientId}
                className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-stone-950">
                        {item.clientName}
                      </h2>

                      <StatusBadge status={item.status} days={item.daysRemaining} />
                    </div>

                    <p className="mt-1 text-sm text-stone-500">
                      {item.phone || "Sin teléfono"}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                      <Info label="Último servicio" value={item.serviceName} />
                      <Info label="Última cita" value={formatDate(item.lastDate)} />
                      <Info
                        label="Retoque sugerido"
                        value={formatDate(item.suggestedDate)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.phone && (
                      <a
                        href={buildWhatsAppLink(
                          item.phone,
                          item.clientName,
                          item.suggestedDate
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white"
                      >
                        WhatsApp
                      </a>
                    )}

                    <Link
                      to="/admin/crear"
                      className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white"
                    >
                      Agendar retoque
                    </Link>

                    <Link
                      to={`/admin/clientes/${item.clientId}/historial`}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700"
                    >
                      Historial
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 font-medium text-stone-900">{value}</p>
    </div>
  )
}

function StatusBadge({
  status,
  days,
}: {
  status: "upcoming" | "today" | "overdue"
  days: number
}) {
  if (status === "overdue") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
        Vencido hace {Math.abs(days)} días
      </span>
    )
  }

  if (status === "today") {
    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
        Contactar hoy
      </span>
    )
  }

  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
      Faltan {days} días
    </span>
  )
}

export default AdminFollowUpPage