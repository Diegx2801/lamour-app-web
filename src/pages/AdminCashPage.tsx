import { Link } from "react-router"
import {
  formatMoney,
  formatPaymentTime,
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
            Revisa ingresos, pagos, abonos, saldos pendientes y cierre del día.
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
        <CashCard label="Pagos restantes" value={formatMoney(cash.summary.remainingIncome)} />
        <CashCard label="Pagos completos" value={formatMoney(cash.summary.fullIncome)} />
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
          <PaymentsPanel cash={cash} />

          <div className="space-y-6">
            <CashClosurePanel cash={cash} />
            <DebtReviewPanel cash={cash} />
          </div>
        </div>
      )}
    </div>
  )
}

function PaymentsPanel({ cash }: { cash: ReturnType<typeof useAdminCash> }) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-950">Pagos recibidos</h2>

      <div className="mt-4 space-y-3">
        {cash.payments.length === 0 ? (
          <p className="text-sm text-stone-500">
            No hay pagos registrados este día.
          </p>
        ) : (
          cash.payments.map((payment) => {
            const appointment = getSingle(payment.appointments)
            const client = getSingle(appointment?.clients)
            const service = getSingle(appointment?.services)

            return (
              <div
                key={payment.id}
                className="rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-950">
                      {formatMoney(payment.amount)}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {payment.payment_method ?? "Sin método"} ·{" "}
                      {getPaymentTypeLabel(payment.payment_type)}
                    </p>
                  </div>
                  <p className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600">
                    {formatPaymentTime(payment.created_at)}
                  </p>
                </div>

                {(client || service) && (
                  <div className="mt-3 grid gap-2 rounded-xl bg-white px-3 py-2 text-xs text-stone-600 sm:grid-cols-2">
                    <p>
                      <span className="font-medium text-stone-900">Cliente:</span>{" "}
                      {client?.full_name ?? "Sin cliente"}
                    </p>
                    <p>
                      <span className="font-medium text-stone-900">Servicio:</span>{" "}
                      {service?.name ?? "Sin servicio"}
                    </p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

function CashClosurePanel({ cash }: { cash: ReturnType<typeof useAdminCash> }) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">
            Cierre de caja
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Monto esperado, contado, diferencia y responsable.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            cash.closure?.is_closed
              ? "bg-green-100 text-green-700"
              : "bg-stone-100 text-stone-600"
          }`}
        >
          {cash.closure?.is_closed ? "Cerrada" : "Abierta"}
        </span>
      </div>

      <form onSubmit={cash.handleCloseCash} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs text-stone-500">Esperado</p>
            <p className="mt-1 text-xl font-semibold text-stone-950">
              {formatMoney(cash.summary.dailyIncome)}
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-stone-600">
              Monto contado
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cash.countedAmount}
              onChange={(event) => cash.setCountedAmount(event.target.value)}
              disabled={cash.closure?.is_closed}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-600 disabled:bg-stone-100"
              placeholder="S/ 0.00"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-stone-600">
            Observación
          </span>
          <textarea
            rows={3}
            value={cash.closureNotes}
            onChange={(event) => cash.setClosureNotes(event.target.value)}
            disabled={cash.closure?.is_closed}
            className="w-full resize-none rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-600 disabled:bg-stone-100"
            placeholder="Ej. Todo conforme"
          />
        </label>

        {cash.closure?.is_closed && (
          <div className="rounded-2xl bg-green-50 px-4 py-3 text-xs leading-5 text-green-800">
            Cerrada por {cash.closure.closed_by_email ?? "usuario"}. Diferencia:{" "}
            {formatMoney(cash.closure.difference_amount)}.
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="submit"
            disabled={cash.closing || cash.closure?.is_closed}
            className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {cash.closing ? "Procesando..." : "Cerrar caja"}
          </button>
          <button
            type="button"
            onClick={cash.handleReopenCash}
            disabled={cash.closing || !cash.closure?.is_closed}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
          >
            Reabrir
          </button>
        </div>
      </form>
    </section>
  )
}

function DebtReviewPanel({ cash }: { cash: ReturnType<typeof useAdminCash> }) {
  return (
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
