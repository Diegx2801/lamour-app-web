import { Link } from "react-router"
import { useAdminPayments } from "../features/admin-payments/hooks/useAdminPayments"

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:bg-stone-100 disabled:text-stone-500"

function AdminPaymentsPage() {
  const payments = useAdminPayments()

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/reservas"
          className="text-sm font-medium text-stone-600 hover:text-stone-950"
        >
          ← Volver a reservas
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-stone-950 md:text-4xl">
          Registrar pago
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Registra abonos, pagos restantes, pagos completos o ajustes.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] md:p-6">
          <p className="mb-3 text-sm font-medium text-stone-600">
            Resumen de reserva
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryItem
              label="Total"
              value={`S/ ${payments.totalPrice.toFixed(2)}`}
            />
            <SummaryItem
              label="Pagado"
              value={`S/ ${payments.totalPaid.toFixed(2)}`}
            />
            <SummaryItem
              label="Restante"
              value={`S/ ${payments.remainingAmount.toFixed(2)}`}
            />
          </div>
        </div>

        <form
          onSubmit={payments.handlePayment}
          className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] md:p-6"
        >
          {payments.cashClosed && (
            <AlertMessage message="La caja de esta fecha está cerrada. Solo la dueña puede reabrirla desde Caja para registrar cambios." />
          )}

          <Field label="Tipo de pago">
            <select
              value={payments.paymentType}
              onChange={(e) =>
                payments.setPaymentType(
                  e.target.value as
                    | "deposit"
                    | "remaining"
                    | "full"
                    | "adjustment"
                )
              }
              className={inputClass}
            >
              <option value="deposit">Abono</option>
              <option value="remaining">Pago restante</option>
              <option value="full">Pago completo</option>
              <option value="adjustment">Ajuste / corrección</option>
            </select>
          </Field>

          <Field label="Monto">
            <input
              type="number"
              min={payments.paymentType === "adjustment" ? undefined : "0"}
              step="0.01"
              placeholder={
                payments.paymentType === "full"
                  ? `S/ ${payments.remainingAmount.toFixed(2)}`
                  : "Ejemplo: 20"
              }
              value={payments.paymentType === "full" ? "" : payments.amount}
              onChange={(e) => payments.setAmount(e.target.value)}
              disabled={payments.paymentType === "full"}
              className={inputClass}
            />
          </Field>

          <Field label="Método de pago">
            <select
              value={payments.method}
              onChange={(e) => payments.setMethod(e.target.value)}
              disabled={payments.loadingPaymentMethods}
              className={inputClass}
            >
              {payments.paymentMethods.map((method) => (
                <option key={method.id} value={method.code}>
                  {method.name}
                </option>
              ))}
            </select>
          </Field>

          {payments.error && <AlertMessage message={payments.error} />}

          <button
            type="submit"
            disabled={
              payments.loading ||
              payments.cashClosed ||
              (payments.remainingAmount <= 0 &&
                payments.paymentType !== "adjustment")
            }
            className="w-full rounded-xl bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {payments.loading
              ? "Guardando..."
              : payments.remainingAmount <= 0 &&
                  payments.paymentType !== "adjustment"
                ? "Reserva pagada"
                : payments.paymentType === "full"
                  ? `Registrar pago completo S/ ${payments.remainingAmount.toFixed(2)}`
                  : "Registrar pago"}
          </button>
        </form>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-stone-950 md:text-xl">
            Historial de pagos
          </h2>

          {payments.loadingData ? (
            <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-500 shadow-sm">
              Cargando pagos...
            </div>
          ) : payments.payments.length === 0 ? (
            <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-500 shadow-sm">
              No hay pagos registrados.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.payments.map((payment) => (
                <article
                  key={payment.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-stone-950">
                      S/ {Number(payment.amount).toFixed(2)}
                    </p>

                    <p className="text-xs text-stone-500">
                      {payment.payment_method ?? "Sin método"} ·{" "}
                      {getPaymentTypeLabel(payment.payment_type)}
                    </p>

                    {payment.created_at && (
                      <p className="mt-1 text-xs text-stone-400">
                        {new Date(payment.created_at).toLocaleString("es-PE")}
                      </p>
                    )}
                  </div>

                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                    {getPaymentTypeLabel(payment.payment_type)}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-800">
        {label}
      </span>
      {children}
    </label>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-3 md:p-4">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-stone-950 md:text-lg">
        {value}
      </p>
    </div>
  )
}

function AlertMessage({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </p>
  )
}

function getPaymentTypeLabel(type: string | null) {
  switch (type) {
    case "deposit":
      return "Abono"
    case "remaining":
      return "Pago restante"
    case "full":
      return "Pago completo"
    case "adjustment":
      return "Ajuste"
    default:
      return "Pago"
  }
}

export default AdminPaymentsPage
