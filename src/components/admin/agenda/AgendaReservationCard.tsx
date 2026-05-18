import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { fetchCashClosureByDate } from "../../../features/admin-cash/api/adminCashService"
import { createAppointmentAuditLog } from "../../../features/appointment-audit/api/appointmentAuditService"
import {
  createAppointmentPayment,
  updateAppointmentPaymentTotals,
} from "../../../features/admin-payments/api/adminPaymentsService"
import { usePaymentMethods } from "../../../features/payment-methods/hooks/usePaymentMethods"
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
  onPaymentRegistered: () => void
}

function AgendaReservationCard({
  reservation,
  onUpdateStatus,
  onPaymentRegistered,
}: AgendaReservationCardProps) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [showMoreActions, setShowMoreActions] = useState(false)
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
    const pendingBalance = Number(reservation.remaining_amount ?? 0)

    openWhatsapp(`Hola ${client?.full_name ?? ""}, te recordamos tu cita en L'AMOUR Beauty Studio.

Servicio: ${service?.name ?? "Servicio reservado"}
Fecha: ${reservation.date}
Hora: ${normalizeTime(reservation.time)}
${reservation.lashista ? `Lashista: ${reservation.lashista}` : ""}
${pendingBalance > 0 ? `Saldo pendiente: ${formatMoney(pendingBalance)}` : ""}

Por favor confirma tu asistencia.`)
  }

  const openConfirmation = () => {
    openWhatsapp(`Hola ${client?.full_name ?? ""}, tu cita en L'AMOUR Beauty Studio queda confirmada.

Servicio: ${service?.name ?? "Servicio reservado"}
Fecha: ${reservation.date}
Hora: ${normalizeTime(reservation.time)}
${reservation.lashista ? `Lashista: ${reservation.lashista}` : ""}

Te esperamos.`)
  }

  const openBalanceReminder = () => {
    openWhatsapp(`Hola ${client?.full_name ?? ""}, te escribimos de L'AMOUR Beauty Studio.

Tu cita tiene un saldo pendiente de ${formatMoney(reservation.remaining_amount)}.

Servicio: ${service?.name ?? "Servicio reservado"}
Fecha: ${reservation.date}
Hora: ${normalizeTime(reservation.time)}

Puedes regularizarlo por este medio o al finalizar tu atencion.`)
  }

  const openChangeNotice = () => {
    openWhatsapp(`Hola ${client?.full_name ?? ""}, te contactamos de L'AMOUR Beauty Studio sobre tu cita.

Servicio: ${service?.name ?? "Servicio reservado"}
Fecha actual: ${reservation.date}
Hora actual: ${normalizeTime(reservation.time)}

Necesitamos coordinar un ajuste de horario. Nos confirmas tu disponibilidad, por favor?`)
  }

  return (
    <div
      className={`rounded-2xl border p-3 shadow-sm ${getStatusClasses(
        reservation.status
      )}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold md:text-base">
            {client?.full_name ?? "Sin nombre"}
          </p>
          <p className="mt-1 line-clamp-1 text-xs opacity-90 md:text-sm">
            {service?.name ?? "Sin servicio"}
          </p>
          <p className="mt-1 text-[11px] opacity-70 md:text-xs">
            {service?.category ?? "Sin categoria"} · {getDisplayDuration(reservation)}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold">
          {getStatusBadge(reservation.status)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] opacity-75 md:text-xs">
        <InfoPill label="Tel" value={client?.phone ?? "Sin telefono"} />
        <InfoPill label="Hora" value={normalizeTime(reservation.time)} />
        <InfoPill
          label="Lashista"
          value={reservation.lashista ?? "Sin asignar"}
          className="col-span-2"
        />
      </div>

      <PaymentSummary reservation={reservation} />

      {reservation.notes ? (
        <p className="mt-3 rounded-xl bg-white/50 px-3 py-2 text-xs opacity-80">
          Nota: {reservation.notes}
        </p>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-2">
        {reservation.status !== "confirmed" && (
          <AgendaActionButton
            label="Confirmar"
            onClick={() => onUpdateStatus(reservation.id, "confirmed")}
            className="text-green-700"
          />
        )}

        {reservation.status !== "completed" && (
          hasPendingBalance ? (
            <AgendaActionButton
              label="Pagar saldo"
              onClick={() => setIsPaymentOpen(true)}
              className="text-red-700"
            />
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
            label="No asistio"
            onClick={() => onUpdateStatus(reservation.id, "no_show")}
            className="text-stone-700"
          />
        )}

        <AgendaActionButton
          label={showMoreActions ? "Ocultar" : "Mas"}
          onClick={() => setShowMoreActions((current) => !current)}
          className="text-stone-700"
        />
      </div>

      {showMoreActions && (
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-white/45 p-2">
          {showReminderButton && client?.phone ? (
            <AgendaActionButton
              label="Recordar"
              onClick={openReminder}
              className="text-purple-700"
            />
          ) : null}

          {hasPendingBalance && client?.phone ? (
            <AgendaActionButton
              label="Saldo WA"
              onClick={openBalanceReminder}
              className="text-red-700"
            />
          ) : null}

          {client?.phone ? (
            <AgendaActionButton
              label="Confirmar WA"
              onClick={openConfirmation}
              className="text-green-800"
            />
          ) : null}

          {client?.phone ? (
            <AgendaActionButton
              label="Cambiar WA"
              onClick={openChangeNotice}
              className="text-stone-700"
            />
          ) : null}

          {reservation.status !== "cancelled" && (
            <AgendaActionButton
              label="Cancelar"
              onClick={() => onUpdateStatus(reservation.id, "cancelled")}
              className="text-red-700"
            />
          )}

          <AgendaActionButton
            label="Pago"
            onClick={() => setIsPaymentOpen(true)}
            className="text-stone-700"
          />

          <Link
            to={`/admin/reservas/${reservation.id}`}
            className="flex min-h-10 items-center justify-center rounded-lg bg-white/80 px-3 py-2 text-center text-xs font-medium text-stone-700 transition hover:bg-white"
          >
            Editar
          </Link>
        </div>
      )}

      {isPaymentOpen && (
        <AgendaPaymentModal
          reservation={reservation}
          clientName={client?.full_name ?? "Sin nombre"}
          serviceName={service?.name ?? "Sin servicio"}
          onClose={() => setIsPaymentOpen(false)}
          onRegistered={onPaymentRegistered}
        />
      )}
    </div>
  )
}

function InfoPill({
  label,
  value,
  className = "",
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <p className={`min-w-0 rounded-xl bg-white/55 px-2 py-1 ${className}`}>
      <span className="font-semibold opacity-60">{label}:</span>{" "}
      <span className="truncate">{value}</span>
    </p>
  )
}

function PaymentSummary({ reservation }: { reservation: AgendaReservation }) {
  const badge = getPaymentBadge(reservation)

  return (
    <div className="mt-3 rounded-2xl bg-white/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
          Pago
        </p>

        <span
          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <PaymentMetric label="Total" value={reservation.total_price} />
        <PaymentMetric label="Abono" value={reservation.deposit_amount} />
        <PaymentMetric label="Saldo" value={reservation.remaining_amount} />
      </div>

      {reservation.appointment_type === "retouch" && (
        <p className="mt-2 w-fit rounded-full bg-purple-100 px-2 py-1 text-[11px] font-semibold text-purple-700">
          Retoque
        </p>
      )}
    </div>
  )
}

function PaymentMetric({
  label,
  value,
}: {
  label: string
  value: number | null | undefined
}) {
  return (
    <div>
      <p className="opacity-60">{label}</p>
      <p className="mt-0.5 font-semibold">{formatMoney(value)}</p>
    </div>
  )
}

type PaymentType = "deposit" | "remaining" | "full" | "adjustment"

function AgendaPaymentModal({
  reservation,
  clientName,
  serviceName,
  onClose,
  onRegistered,
}: {
  reservation: AgendaReservation
  clientName: string
  serviceName: string
  onClose: () => void
  onRegistered: () => void
}) {
  const { paymentMethods, loadingPaymentMethods } = usePaymentMethods()
  const [paymentType, setPaymentType] = useState<PaymentType>(
    Number(reservation.remaining_amount ?? 0) > 0 ? "remaining" : "adjustment"
  )
  const [method, setMethod] = useState("yape")
  const [amount, setAmount] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const totalPrice = Number(reservation.total_price ?? 0)
  const totalPaid = Number(reservation.deposit_amount ?? 0)
  const remainingAmount = Math.max(totalPrice - totalPaid, 0)

  const effectiveAmount = useMemo(() => {
    if (paymentType === "full") return remainingAmount
    return Number(amount)
  }, [amount, paymentType, remainingAmount])

  useEffect(() => {
    if (paymentMethods.length === 0) return
    if (paymentMethods.some((paymentMethod) => paymentMethod.code === method)) {
      return
    }

    setMethod(paymentMethods[0].code)
  }, [method, paymentMethods])

  const validate = () => {
    if (paymentType === "full" && remainingAmount <= 0) {
      return "La cita ya esta pagada."
    }

    if (
      paymentType !== "full" &&
      (!amount || Number.isNaN(effectiveAmount) || effectiveAmount === 0)
    ) {
      return "Ingresa un monto valido."
    }

    if (paymentType !== "adjustment" && effectiveAmount <= 0) {
      return "El monto debe ser mayor a cero."
    }

    const nextTotalPaid = totalPaid + effectiveAmount

    if (paymentType === "adjustment" && nextTotalPaid < 0) {
      return "El ajuste no puede dejar el total pagado en negativo."
    }

    if (nextTotalPaid > totalPrice) {
      return `El pago no puede superar el saldo pendiente de ${formatMoney(
        remainingAmount
      )}.`
    }

    return ""
  }

  const registerPayment = async () => {
    const validationMessage = validate()

    if (validationMessage) {
      setError(validationMessage)
      toast.error(validationMessage)
      return
    }

    const loadingToastId = toast.loading("Registrando pago...")

    try {
      setSaving(true)
      setError("")

      const closureData = await fetchCashClosureByDate(reservation.date)

      if (closureData?.is_closed) {
        const message =
          "La caja de este dia ya esta cerrada. Reabrela para registrar pagos."
        setError(message)
        toast.dismiss(loadingToastId)
        toast.error(message)
        return
      }

      const newTotalPaid = totalPaid + effectiveAmount
      const newRemainingAmount = Math.max(totalPrice - newTotalPaid, 0)

      await createAppointmentPayment({
        appointmentId: reservation.id,
        amount: effectiveAmount,
        paymentMethod: method,
        paymentType,
      })

      await updateAppointmentPaymentTotals({
        appointmentId: reservation.id,
        totalPaid: newTotalPaid,
        remainingAmount: newRemainingAmount,
      })

      await createAppointmentAuditLog({
        appointmentId: reservation.id,
        action: "payment_registered",
        details: {
          paymentAmount: effectiveAmount,
          paymentMethod: method,
          paymentType,
          totalPaid: newTotalPaid,
          remainingAmount: newRemainingAmount,
          source: "agenda",
        },
      })

      toast.dismiss(loadingToastId)
      toast.success("Pago registrado correctamente.")
      onRegistered()
      onClose()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo registrar el pago."
      setError(message)
      toast.dismiss(loadingToastId)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/40 px-3 py-3 md:items-center">
      <div className="w-full max-w-md rounded-[1.5rem] border border-stone-200 bg-white p-5 text-stone-950 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Registrar pago
            </p>
            <h3 className="mt-1 text-xl font-semibold">{clientName}</h3>
            <p className="mt-1 text-sm text-stone-500">{serviceName}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-stone-50 p-3 text-xs">
          <PaymentValue label="Total" value={totalPrice} />
          <PaymentValue label="Pagado" value={totalPaid} />
          <PaymentValue label="Saldo" value={remainingAmount} />
        </div>

        <div className="mt-4 grid gap-3">
          <label className="text-sm font-medium text-stone-700">
            Tipo de pago
            <select
              value={paymentType}
              onChange={(event) =>
                setPaymentType(event.target.value as PaymentType)
              }
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
            >
              <option value="deposit">Abono</option>
              <option value="remaining">Pago restante</option>
              <option value="full">Pago completo</option>
              <option value="adjustment">Ajuste/correccion</option>
            </select>
          </label>

          <label className="text-sm font-medium text-stone-700">
            Monto
            <input
              type="number"
              min={paymentType === "adjustment" ? undefined : "0"}
              step="0.01"
              value={paymentType === "full" ? remainingAmount.toFixed(2) : amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={paymentType === "full"}
              placeholder="Ejemplo: 50"
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500 disabled:bg-stone-100"
            />
          </label>

          <label className="text-sm font-medium text-stone-700">
            Metodo
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              disabled={loadingPaymentMethods}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
            >
              {paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod.id} value={paymentMethod.code}>
                  {paymentMethod.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={registerPayment}
          disabled={saving}
          className="mt-5 w-full rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {saving ? "Registrando..." : "Registrar pago"}
        </button>
      </div>
    </div>
  )
}

function PaymentValue({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-stone-500">{label}</p>
      <p className="mt-1 font-semibold text-stone-950">{formatMoney(value)}</p>
    </div>
  )
}

export default AgendaReservationCard
