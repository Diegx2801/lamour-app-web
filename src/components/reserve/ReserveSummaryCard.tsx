type ServiceSummary = {
  name: string
  category: string | null
}

type ReserveSummaryCardProps = {
  service: ServiceSummary | null
  date: string
  time: string
  servicePrice: number
  depositAmount: number
  remainingAmount: number
  formatDateForMessage: (date: string) => string
}

function ReserveSummaryCard({
  service,
  date,
  time,
  servicePrice,
  depositAmount,
  remainingAmount,
  formatDateForMessage,
}: ReserveSummaryCardProps) {
  return (
    <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-stone-950">
        Resumen de reserva
      </p>

      <div className="mt-4 space-y-3 text-sm text-stone-600">
        <div>
          <p className="font-medium text-stone-900">Servicio</p>
          <p>{service?.name ?? "Aún no seleccionado"}</p>
        </div>

        <div>
          <p className="font-medium text-stone-900">Categoría</p>
          <p>{service?.category ?? "Pendiente"}</p>
        </div>

        <div>
          <p className="font-medium text-stone-900">Fecha</p>
          <p>{date ? formatDateForMessage(date) : "Pendiente"}</p>
        </div>

        <div>
          <p className="font-medium text-stone-900">Hora</p>
          <p>{time || "Pendiente"}</p>
        </div>

        <div>
          <p className="font-medium text-stone-900">Precio total</p>
          <p>S/ {servicePrice.toFixed(2)}</p>
        </div>

        <div>
          <p className="font-medium text-stone-900">Abono</p>
          <p>S/ {depositAmount.toFixed(2)}</p>
        </div>

        <div>
          <p className="font-medium text-stone-900">Saldo</p>
          <p>S/ {remainingAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
        Tu cita queda registrada como solicitud. Luego podrás enviar tu
        comprobante por WhatsApp para terminar la confirmación.
      </div>
    </aside>
  )
}

export default ReserveSummaryCard