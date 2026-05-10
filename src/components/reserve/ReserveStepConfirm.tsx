type SelectedServiceData = {
  name: string
} | null

type ReserveStepConfirmProps = {
  selectedServiceData: SelectedServiceData
  date: string
  time: string
  fullName: string
  phone: string
  phonePreview: string | null
  formatDateForMessage: (date: string) => string
}

function ReserveStepConfirm({
  selectedServiceData,
  date,
  time,
  fullName,
  phone,
  phonePreview,
  formatDateForMessage,
}: ReserveStepConfirmProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700">
      <p className="text-base font-semibold text-stone-950">
        Revisa tu reserva
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoItem label="Servicio" value={selectedServiceData?.name ?? "-"} />
        <InfoItem label="Fecha" value={formatDateForMessage(date)} />
        <InfoItem label="Hora" value={time || "-"} />
        <InfoItem label="Cliente" value={fullName || "-"} />
        <InfoItem label="Teléfono" value={phonePreview ?? phone ?? "-"} />
        <InfoItem label="Abono requerido" value="S/ 10.00" />
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 text-stone-600">
        Al finalizar, podrás tocar un botón para ir a WhatsApp y enviar tu
        comprobante de abono.
      </div>

      <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-4 text-xs leading-6 text-stone-600">
        <p className="font-semibold text-stone-800">Política de reserva</p>
        <p className="mt-1">
          El horario se confirma al recibir el comprobante del abono. Si
          necesitas reprogramar, avísanos por WhatsApp con anticipación.
        </p>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 font-semibold text-stone-950">{value}</p>
    </div>
  )
}

export default ReserveStepConfirm
