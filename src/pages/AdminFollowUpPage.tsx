import { Link } from "react-router"
import {
  formatDate,
  type FollowUpItem,
  useAdminFollowUp,
} from "../features/admin-follow-up/hooks/useAdminFollowUp"

function AdminFollowUpPage() {
  const followUp = useAdminFollowUp()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Fidelización
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Seguimiento de retoques
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Clientes con retoque sugerido cada 15 días después de su última
            atención completada.
          </p>
        </div>

        <button
          type="button"
          onClick={followUp.reload}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700"
        >
          Actualizar
        </button>
      </div>

      {!followUp.loading && !followUp.error && (
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Pendientes" value={followUp.pendingFollowUps.length} />
          <SummaryCard label="Vencidos" value={followUp.overdueCount} />
          <SummaryCard label="Para hoy" value={followUp.todayCount} />
        </div>
      )}

      {followUp.loading && (
        <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-500 shadow-sm">
          Cargando seguimiento...
        </div>
      )}

      {followUp.error && (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {followUp.error}
        </div>
      )}

      {!followUp.loading &&
        !followUp.error &&
        followUp.followUps.length === 0 && (
          <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-500 shadow-sm">
            No hay clientes pendientes de seguimiento.
          </div>
        )}

      {!followUp.loading &&
        !followUp.error &&
        followUp.followUps.length > 0 && (
          <div className="grid gap-6">
            {followUp.pendingFollowUps.length > 0 && (
              <FollowUpSection title="Pendientes de contactar">
                {followUp.pendingFollowUps.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    updating={followUp.updatingId === item.id}
                    onMarkContacted={followUp.markAsContacted}
                    onClearContacted={followUp.clearContacted}
                  />
                ))}
              </FollowUpSection>
            )}

            {followUp.contactedFollowUps.length > 0 && (
              <FollowUpSection title="Ya contactados">
                {followUp.contactedFollowUps.map((item) => (
                  <FollowUpCard
                    key={item.id}
                    item={item}
                    updating={followUp.updatingId === item.id}
                    onMarkContacted={followUp.markAsContacted}
                    onClearContacted={followUp.clearContacted}
                  />
                ))}
              </FollowUpSection>
            )}
          </div>
        )}
    </div>
  )
}

function FollowUpSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
        {title}
      </h2>

      <div className="grid gap-3">{children}</div>
    </section>
  )
}

function FollowUpCard({
  item,
  updating,
  onMarkContacted,
  onClearContacted,
}: {
  item: FollowUpItem
  updating: boolean
  onMarkContacted: (appointmentId: string) => void
  onClearContacted: (appointmentId: string) => void
}) {
  return (
    <article
      className={`rounded-[1.5rem] border bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5 ${
        item.contacted ? "border-green-200" : "border-stone-200"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-stone-950">
              {item.clientName}
            </h3>

            <StatusBadge status={item.status} days={item.daysRemaining} />

            {item.contacted && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Contactado
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-stone-500">
            {item.phone || "Sin teléfono"}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Info label="Último servicio" value={item.serviceName} />
            <Info label="Última cita" value={formatDate(item.lastDate)} />
            <Info
              label="Retoque sugerido"
              value={formatDate(item.suggestedDate)}
            />
          </div>

          {item.contactedAt && (
            <p className="mt-3 text-xs text-green-700">
              Contactado por {item.contactedChannel ?? "seguimiento"} el{" "}
              {formatDate(item.contactedAt.slice(0, 10))}
            </p>
          )}
        </div>

        <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
          {item.phone && !item.contacted && (
            <a
              href={item.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => onMarkContacted(item.id)}
              className="rounded-xl bg-green-600 px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              WhatsApp
            </a>
          )}

          {!item.contacted ? (
            <button
              type="button"
              disabled={updating}
              onClick={() => onMarkContacted(item.id)}
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 disabled:opacity-60"
            >
              {updating ? "Marcando..." : "Marcar contactado"}
            </button>
          ) : (
            <button
              type="button"
              disabled={updating}
              onClick={() => onClearContacted(item.id)}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 disabled:opacity-60"
            >
              {updating ? "Revirtiendo..." : "Revertir"}
            </button>
          )}

          <Link
            to="/admin/crear"
            className="rounded-xl bg-stone-950 px-4 py-2.5 text-center text-sm font-medium text-white"
          >
            Agendar retoque
          </Link>

          <Link
            to={`/admin/clientes/${item.clientId}/historial`}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-stone-700"
          >
            Historial
          </Link>
        </div>
      </div>
    </article>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-stone-900">{value}</p>
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