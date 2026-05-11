import { Link } from "react-router"
import {
  buildWhatsappPhone,
  isNoShowCandidate,
  isReminderCandidate,
} from "../../../features/reservations/utils/appointmentStatus"
import type { AgendaReservation } from "../../../features/admin-agenda/hooks/useAdminAgenda"
import { AgendaActionButton } from "./AgendaShared"
import {
  formatMoney,
  getClientData,
  getDisplayDuration,
  getPaymentBadge,
  getServiceData,
  getStatusBadge,
  getStatusClasses,
  normalizeTime,
} from "./agendaUtils"

type AgendaReservationCardProps = {
  reservation: AgendaReservation
  onUpdateStatus: (id: string, status: string) => void
}

function AgendaReservationCard({
  reservation,
  onUpdateStatus,
}: AgendaReservationCardProps) {
  const client = getClientData(reservation.clients)
  const service = getServiceData(reservation.services)

  const showNoShowButton = isNoShowCandidate(
    reservation.date,
    reservation.time,
    reservation.status
  )

  const showReminderButton = isReminderCandidate(
    reservation.date,
    reservation.time,
    reservation.status
  )
  const hasPendingBalance = Number(reservation.remaining_amount ?? 0) > 0

  const openWhatsapp = (message: string) => {
    const phone = buildWhatsappPhone(client?.phone ?? "")
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    window.open(url, "_blank")
  }

  const openReminder = () => {
    openWhatsapp(`Hola ${client?.full_name ?? ""}, te recordamos tu cita en L'AMOUR Beauty Studio.

Servicio: ${service?.name ?? "Servicio reservado"}
Fecha: ${reservation.date}
Hora: ${normalizeTime(reservation.time)}

Por favor confirma tu asistencia.`)
  }

  const openConfirmation = () => {
    openWhatsapp(`Hola ${client?.full_name ?? ""}, tu cita en L'AMOUR Beauty Studio queda confirmada.

Servicio: ${service?.name ?? "Servicio reservado"}
Fecha: ${reservation.date}
Hora: ${normalizeTime(reservation.time)}

Te esperamos.`)
  }

  return (
    <div
      className={`rounded-2xl border p-3 shadow-sm md:p-4 ${getStatusClasses(
        reservation.status
      )}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold">{client?.full_name ?? "Sin nombre"}</p>

          <p className="mt-1 text-sm">{service?.name ?? "Sin servicio"}</p>

          <p className="mt-1 text-xs opacity-80">
            {service?.category ?? "Sin categoría"} ·{" "}
            {getDisplayDuration(reservation)}
          </p>
        </div>

        <span className="w-fit rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold">
          {getStatusBadge(reservation.status)}
        </span>
      </div>

      <div className="mt-3 grid gap-1 text-xs opacity-80 sm:grid-cols-2">
        <p>Tel: {client?.phone ?? "Sin teléfono"}</p>

        <p>Lashista: {reservation.lashista ?? "Sin asignar"}</p>

        <p>Hora: {normalizeTime(reservation.time)}</p>
      </div>

      <PaymentSummary reservation={reservation} />

      {reservation.notes ? (
        <p className="mt-3 text-xs opacity-80">Nota: {reservation.notes}</p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {reservation.status !== "confirmed" && (
          <AgendaActionButton
            label="Confirmar"
            onClick={() => onUpdateStatus(reservation.id, "confirmed")}
            className="text-green-700"
          />
        )}

        {reservation.status !== "completed" && (
          hasPendingBalance ? (
            <Link
              to={`/admin/pagos/${reservation.id}`}
              className="rounded-lg bg-white/80 px-3 py-2 text-center text-xs font-medium text-red-700"
            >
              Pagar saldo
            </Link>
          ) : (
            <AgendaActionButton
              label="Completar"
              onClick={() => onUpdateStatus(reservation.id, "completed")}
              className="text-blue-700"
            />
          )
        )}

        {showNoShowButton && (
          <AgendaActionButton
            label="No asistió"
            onClick={() => onUpdateStatus(reservation.id, "no_show")}
            className="text-stone-700"
          />
        )}

        {showReminderButton && client?.phone ? (
          <AgendaActionButton
            label="Recordar"
            onClick={openReminder}
            className="text-purple-700"
          />
        ) : null}

        {client?.phone ? (
          <AgendaActionButton
            label="WhatsApp"
            onClick={openConfirmation}
            className="text-green-800"
          />
        ) : null}

        {reservation.status !== "cancelled" && (
          <AgendaActionButton
            label="Cancelar"
            onClick={() => onUpdateStatus(reservation.id, "cancelled")}
            className="text-red-700"
          />
        )}

        <Link
          to={`/admin/pagos/${reservation.id}`}
          className="rounded-lg bg-white/80 px-3 py-2 text-center text-xs font-medium text-stone-700"
        >
          Pago
        </Link>

        <Link
          to={`/admin/reservas/${reservation.id}`}
          className="rounded-lg bg-white/80 px-3 py-2 text-center text-xs font-medium text-stone-700"
        >
          Editar
        </Link>
      </div>
    </div>
  )
}

function PaymentSummary({ reservation }: { reservation: AgendaReservation }) {
  const badge = getPaymentBadge(reservation)

  return (
    <div className="mt-3 rounded-2xl bg-white/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
          Pago
        </p>

        <span
          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="opacity-60">Total</p>
          <p className="mt-0.5 font-semibold">
            {formatMoney(reservation.total_price)}
          </p>
        </div>

        <div>
          <p className="opacity-60">Abono</p>
          <p className="mt-0.5 font-semibold">
            {formatMoney(reservation.deposit_amount)}
          </p>
        </div>

        <div>
          <p className="opacity-60">Saldo</p>
          <p className="mt-0.5 font-semibold">
            {formatMoney(reservation.remaining_amount)}
          </p>
        </div>
      </div>

      {reservation.appointment_type === "retouch" && (
        <p className="mt-2 w-fit rounded-full bg-purple-100 px-2 py-1 text-[11px] font-semibold text-purple-700">
          Retoque
        </p>
      )}
    </div>
  )
}

export default AgendaReservationCard
