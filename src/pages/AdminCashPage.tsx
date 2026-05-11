import { Link } from "react-router"
import {
  formatMoney,
  getPaymentTypeLabel,
  getSingle,
  useAdminCash,
} from "../features/admin-cash/hooks/useAdminCash"

function AdminCashPage() {
  const cash = useAdminCash()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Control diario
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Caja
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Revisa ingresos, abonos y saldos pendientes del día.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="date"
            value={cash.selectedDate}
            onChange={(event) => cash.setSelectedDate(event.target.value)}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-600"
          />

          <button
            type="button"
            onClick={cash.downloadPdfReport}
            disabled={cash.loading}
            className="rounded-2xl bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            Descargar PDF
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CashCard label="Ingresos del día" value={formatMoney(cash.summary.dailyIncome)} />
        <CashCard label="Abonos recibidos" value={formatMoney(cash.summary.depositIncome)} />
        <CashCard
          label="Saldos pendientes"
          value={formatMoney(cash.summary.pendingBalance)}
          tone={cash.summary.pendingBalance > 0 ? "red" : "green"}
        />
        <CashCard
          label="Completadas con saldo"
          value={String(cash.summary.completedWithDebt.length)}
          tone={cash.summary.completedWithDebt.length > 0 ? "amber" : "green"}
        />
      </div>

      {cash.error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {cash.error}
        </div>
      )}

      {cash.loading ? (
        <div className="rounded-3xl bg-white p-5 text-sm text-stone-600 shadow-sm">
          Cargando caja...
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-950">
              Pagos recibidos
            </h2>

            <div className="mt-4 space-y-3">
              {cash.payments.length === 0 ? (
                <p className="text-sm text-stone-500">
                  No hay pagos registrados este día.
                </p>
              ) : (
                cash.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-stone-950">
                        {formatMoney(payment.amount)}
                      </p>
                      <p className="text-xs text-stone-500">
                        {payment.payment_method ?? "Sin método"} ·{" "}
                        {getPaymentTypeLabel(payment.payment_type)}
                      </p>
                    </div>
                    <p className="text-xs text-stone-500">
                      {payment.created_at?.slice(11, 16) ?? "--:--"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-950">
              Saldos por revisar
            </h2>

            <div className="mt-4 space-y-3">
              {cash.summary.completedWithDebt.length === 0 ? (
                <p className="text-sm text-stone-500">
                  No hay citas completadas con saldo pendiente.
                </p>
              ) : (
                cash.summary.completedWithDebt.map((appointment) => {
                  const client = getSingle(appointment.clients)
                  const service = getSingle(appointment.services)

                  return (
                    <Link
                      key={appointment.id}
                      to={`/admin/pagos/${appointment.id}`}
                      className="block rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                    >
                      <p className="font-semibold">
                        {client?.full_name ?? "Sin nombre"}
                      </p>
                      <p className="mt-1 text-xs">
                        {appointment.time?.slice(0, 5)} ·{" "}
                        {service?.name ?? "Sin servicio"}
                      </p>
                      <p className="mt-2 font-semibold">
                        Saldo {formatMoney(appointment.remaining_amount)}
                      </p>
                    </Link>
                  )
                })
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function CashCard({
  label,
  value,
  tone = "stone",
}: {
  label: string
  value: string
  tone?: "stone" | "green" | "amber" | "red"
}) {
  const toneClasses = {
    stone: "border-stone-200 bg-white text-stone-950",
    green: "border-green-200 bg-green-50 text-green-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-900",
  }

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-60">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}

export default AdminCashPage
