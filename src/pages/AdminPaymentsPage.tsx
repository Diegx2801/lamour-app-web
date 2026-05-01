import { Link } from "react-router"
import { useAdminPayments } from "../features/admin-payments/hooks/useAdminPayments"

function AdminPaymentsPage() {
  const payments = useAdminPayments()

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/admin/reservas" className="text-sm text-stone-600">
          ← Volver
        </Link>

        <h1 className="mb-6 mt-4 text-3xl font-semibold">Registrar pago</h1>

        <div className="mb-6 grid gap-3 rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-stone-500">Resumen de reserva</p>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryItem label="Total" value={`S/ ${payments.totalPrice.toFixed(2)}`} />
            <SummaryItem label="Pagado" value={`S/ ${payments.totalPaid.toFixed(2)}`} />
            <SummaryItem label="Restante" value={`S/ ${payments.remainingAmount.toFixed(2)}`} />
          </div>
        </div>

        <form
          onSubmit={payments.handlePayment}
          className="space-y-4 rounded-2xl bg-white p-6 shadow"
        >
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Monto"
            value={payments.amount}
            onChange={(e) => payments.setAmount(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />

          <select
            value={payments.method}
            onChange={(e) =>
              payments.setMethod(e.target.value as "yape" | "plin" | "efectivo")
            }
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
            <option value="efectivo">Efectivo</option>
          </select>

          {payments.error && (
            <p className="text-sm text-red-500">{payments.error}</p>
          )}

          <button
            disabled={payments.loading || payments.remainingAmount <= 0}
            className="w-full rounded-xl bg-black py-3 text-white disabled:opacity-60"
          >
            {payments.loading
              ? "Guardando..."
              : payments.remainingAmount <= 0
              ? "Reserva pagada"
              : "Registrar pago"}
          </button>
        </form>

        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">Historial de pagos</h2>

          {payments.loadingData ? (
            <p className="text-sm text-stone-500">Cargando pagos...</p>
          ) : payments.payments.length === 0 ? (
            <p className="text-sm text-stone-500">No hay pagos registrados</p>
          ) : (
            payments.payments.map((payment) => (
              <div
                key={payment.id}
                className="mb-2 rounded-xl bg-white p-4 shadow"
              >
                <p className="font-semibold">
                  S/ {Number(payment.amount).toFixed(2)}
                </p>

                <p className="text-sm text-stone-500">
                  {payment.payment_method ?? "Sin método"}
                </p>

                {payment.created_at && (
                  <p className="mt-1 text-xs text-stone-400">
                    {new Date(payment.created_at).toLocaleString("es-PE")}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 p-4">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-stone-950">{value}</p>
    </div>
  )
}

export default AdminPaymentsPage