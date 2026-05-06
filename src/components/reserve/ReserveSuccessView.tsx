import { Link } from "react-router"
import qrPago from "../../assets/qr-yape.png"

type SubmittedReservation = {
  serviceName: string
  category: string | null
  date: string
  time: string
  fullName: string
  phone: string
  totalPrice: number
  depositAmount: number
  remainingAmount: number
}

type ReserveSuccessViewProps = {
  reservation: SubmittedReservation
  whatsappUrl: string
  onNewReservation: () => void
  formatDateForMessage: (date: string) => string
}

function ReserveSuccessView({
  reservation,
  whatsappUrl,
  onNewReservation,
  formatDateForMessage,
}: ReserveSuccessViewProps) {
  const confirmationDeadlineHours = 2

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Reserva registrada
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-stone-950">
            Solicitud enviada con éxito
          </h1>

          <p className="mt-4 leading-7 text-stone-600">
            Tu reserva quedó registrada correctamente. El siguiente paso es
            enviar tu comprobante de abono por WhatsApp para completar la
            confirmación.
          </p>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700">
            <p className="mb-3 text-base font-semibold text-stone-950">
              Resumen de tu reserva
            </p>

            <p>
              <span className="font-medium">Servicio:</span>{" "}
              {reservation.serviceName}
            </p>
            <p>
              <span className="font-medium">Categoría:</span>{" "}
              {reservation.category ?? "Sin categoría"}
            </p>
            <p>
              <span className="font-medium">Fecha:</span>{" "}
              {formatDateForMessage(reservation.date)}
            </p>
            <p>
              <span className="font-medium">Hora:</span>{" "}
              {reservation.time}
            </p>
            <p>
              <span className="font-medium">Nombre:</span>{" "}
              {reservation.fullName}
            </p>
            <p>
              <span className="font-medium">Teléfono:</span>{" "}
              {reservation.phone}
            </p>
            <p className="mt-3">
              <span className="font-medium">Precio total:</span> S/{" "}
              {reservation.totalPrice.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Abono:</span> S/{" "}
              {reservation.depositAmount.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Saldo:</span> S/{" "}
              {reservation.remainingAmount.toFixed(2)}
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                Paso siguiente
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                Realiza tu abono de S/ 10.00
              </h2>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                Escanea el código QR y realiza el abono para confirmar tu cita.
                Luego envía tu comprobante por WhatsApp para completar la
                validación.
              </p>

              <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-stone-700">
                <p>
                  <span className="font-medium">Monto a abonar:</span> S/{" "}
                  {reservation.depositAmount.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Saldo restante:</span> S/{" "}
                  {reservation.remainingAmount.toFixed(2)}
                </p>
              </div>

              <div className="mt-5 space-y-2 text-sm text-stone-600">
                <p>1. Escanea el QR desde tu app de pago.</p>
                <p>2. Realiza el abono de S/ 10.00.</p>
                <p>3. Envía tu comprobante por WhatsApp.</p>
                <p>4. Espera la confirmación final de tu cita.</p>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Importante para confirmar tu cita</p>
                <p className="mt-1 leading-6">
                  Tu solicitud quedará en estado <strong>pendiente</strong> hasta
                  recibir el comprobante. Te recomendamos enviarlo dentro de{" "}
                  <strong>{confirmationDeadlineHours} horas</strong> para asegurar
                  el horario elegido.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
              <p className="text-sm font-semibold text-stone-950">
                Código QR de pago
              </p>

              <div className="mt-4 flex justify-center rounded-2xl bg-stone-50 p-4">
                <img
                  src={qrPago}
                  alt="Código QR para abono de reserva"
                  className="h-auto w-full max-w-[280px] rounded-2xl object-contain"
                />
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-stone-950 px-6 py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
                >
                  Enviar comprobante por WhatsApp
                </a>

                <button
                  type="button"
                  onClick={onNewReservation}
                  className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800"
                >
                  Nueva reserva
                </button>

                <Link
                  to="/"
                  className="rounded-full border border-stone-300 px-6 py-3 text-center text-sm font-medium text-stone-800"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReserveSuccessView
