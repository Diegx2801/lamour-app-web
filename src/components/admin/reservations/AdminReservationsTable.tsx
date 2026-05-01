
import { Link } from "react-router"

export type ReservationRelationClient =
  | {
      full_name: string | null
      phone: string | null
    }
  | {
      full_name: string | null
      phone: string | null
    }[]
  | null

export type ReservationRelationService =
  | {
      name: string | null
      category: string | null
    }
  | {
      name: string | null
      category: string | null
    }[]
  | null

export type ReservationRow = {
  id: string
  client_id: string
  date: string
  time: string
  status: string
  total_price: number
  deposit_amount: number
  remaining_amount: number
  notes: string | null
  lashista: string | null
  clients: ReservationRelationClient
  services: ReservationRelationService
}

type AdminReservationsTableProps = {
  rows: ReservationRow[]
  onUpdateStatus: (id: string, status: string) => void
}

function getClientData(clients: ReservationRelationClient) {
  if (!clients) return null
  return Array.isArray(clients) ? clients[0] ?? null : clients
}

function getServiceData(services: ReservationRelationService) {
  if (!services) return null
  return Array.isArray(services) ? services[0] ?? null : services
}

function getStatusClasses(status: string) {
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

function getStatusLabel(status: string) {
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

function formatTime(time: string) {
  return String(time).slice(0, 5)
}

function formatMoney(value: number | null | undefined) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`
}

function AdminReservationsTable({
  rows,
  onUpdateStatus,
}: AdminReservationsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-sm text-stone-600 shadow-sm">
        No hay reservas para este filtro.
      </div>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-[2rem] bg-white shadow-sm lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <TableHead>Cliente</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Acciones</TableHead>
            </tr>
          </thead>

          <tbody>
            {rows.map((reservation) => {
              const client = getClientData(reservation.clients)
              const service = getServiceData(reservation.services)

              return (
                <tr
                  key={reservation.id}
                  className="border-b border-stone-100 align-top transition hover:bg-stone-50"
                >
                  <TableCell>
                    <p className="font-medium text-stone-950">
                      {client?.full_name ?? "Sin nombre"}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {client?.phone ?? "Sin teléfono"}
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium text-stone-950">
                      {service?.name ?? "Sin servicio"}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {service?.category ?? "Sin categoría"}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Lashista: {reservation.lashista ?? "Sin asignar"}
                    </p>
                  </TableCell>

                  <TableCell>{reservation.date}</TableCell>
                  <TableCell>{formatTime(reservation.time)}</TableCell>

                  <TableCell>
                    <StatusBadge status={reservation.status} />
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 text-xs text-stone-600">
                      <p>Total: {formatMoney(reservation.total_price)}</p>
                      <p>Abono: {formatMoney(reservation.deposit_amount)}</p>
                      <p>Saldo: {formatMoney(reservation.remaining_amount)}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <ReservationActions
                      reservation={reservation}
                      onUpdateStatus={onUpdateStatus}
                    />
                  </TableCell>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {rows.map((reservation) => {
          const client = getClientData(reservation.clients)
          const service = getServiceData(reservation.services)

          return (
            <div
              key={reservation.id}
              className="rounded-[2rem] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-stone-950">
                    {client?.full_name ?? "Sin nombre"}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {client?.phone ?? "Sin teléfono"}
                  </p>
                </div>

                <StatusBadge status={reservation.status} />
              </div>

              <div className="mt-4 rounded-2xl bg-stone-50 p-4">
                <p className="font-medium text-stone-950">
                  {service?.name ?? "Sin servicio"}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {service?.category ?? "Sin categoría"}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <InfoItem label="Fecha" value={reservation.date} />
                  <InfoItem label="Hora" value={formatTime(reservation.time)} />
                  <InfoItem
                    label="Lashista"
                    value={reservation.lashista ?? "Sin asignar"}
                  />
                  <InfoItem
                    label="Saldo"
                    value={formatMoney(reservation.remaining_amount)}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <PaymentBox label="Total" value={reservation.total_price} />
                <PaymentBox label="Abono" value={reservation.deposit_amount} />
                <PaymentBox label="Saldo" value={reservation.remaining_amount} />
              </div>

              <div className="mt-4">
                <ReservationActions
                  reservation={reservation}
                  onUpdateStatus={onUpdateStatus}
                />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function ReservationActions({
  reservation,
  onUpdateStatus,
}: {
  reservation: ReservationRow
  onUpdateStatus: (id: string, status: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ActionLink to={`/admin/reservas/${reservation.id}`} label="Editar" />

      <ActionLink to={`/admin/pagos/${reservation.id}`} label="Pagos" />

      {reservation.client_id && (
        <ActionLink
          to={`/admin/clientes/${reservation.client_id}/historial`}
          label="Historial"
        />
      )}

      {reservation.status === "pending" && (
        <ActionButton
          label="Confirmar"
          className="bg-green-600 text-white"
          onClick={() => onUpdateStatus(reservation.id, "confirmed")}
        />
      )}

      {reservation.status === "confirmed" && (
        <ActionButton
          label="Completar"
          className="bg-blue-600 text-white"
          onClick={() => onUpdateStatus(reservation.id, "completed")}
        />
      )}

      {(reservation.status === "pending" ||
        reservation.status === "confirmed") && (
        <ActionButton
          label="Cancelar"
          className="bg-red-600 text-white"
          onClick={() => onUpdateStatus(reservation.id, "cancelled")}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}

function ActionLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-500"
    >
      {label}
    </Link>
  )
}

function ActionButton({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition hover:opacity-90 ${className}`}
    >
      {label}
    </button>
  )
}

function PaymentBox({
  label,
  value,
}: {
  label: string
  value: number | null | undefined
}) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-stone-950">
        {formatMoney(value)}
      </p>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 font-medium text-stone-900">{value}</p>
    </div>
  )
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 font-semibold text-stone-900">{children}</th>
  )
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-4 text-stone-700">{children}</td>
}

export default AdminReservationsTable