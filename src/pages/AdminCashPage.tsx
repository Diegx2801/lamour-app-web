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
    <div className="pb-8">
      <section className="mb-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Control diario
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              Caja
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Revisa ingresos, pagos, abonos, saldos pendientes y cierre del dia.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[360px]">
            <input
              type="date"
              value={cash.selectedDate}
              onChange={(event) => cash.setSelectedDate(event.target.value)}
              className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-700 focus:ring-4 focus:ring-stone-100"
            />

            <button
              type="button"
              onClick={cash.downloadPdfReport}
              disabled={cash.loading}
              className="rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-50"
            >
              Descargar PDF
            </button>
          </div>
        </div>
      </section>

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-6">
        <CashCard label="Ingresos" value={formatMoney(cash.summary.dailyIncome)} />
        <CashCard label="Abonos" value={formatMoney(cash.summary.depositIncome)} />
        <CashCard
          label="Restantes"
          value={formatMoney(cash.summary.remainingIncome)}
        />
        <CashCard
          label="Completos"
          value={formatMoney(cash.summary.fullIncome)}
          tone="green"
        />
        <CashCard
          label="Saldo pendiente"
          value={formatMoney(cash.summary.pendingBalance)}
          tone={cash.summary.pendingBalance > 0 ? "red" : "green"}
        />
        <CashCard
          label="Por revisar"
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
        <StateBox text="Cargando caja..." />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <PaymentsPanel cash={cash} />

          <div className="space-y-5">
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
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">
            Pagos recibidos
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Movimientos registrados en la fecha seleccionada.
          </p>
        </div>
        <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
          {cash.payments.length} pagos
        </span>
      </div>

      <div className="space-y-3">
        {cash.payments.length === 0 ? (
          <StateBox text="No hay pagos registrados este dia." compact />
        ) : (
          cash.payments.map((payment) => {
            const appointment = getSingle(payment.appointments)
            const client = getSingle(appointment?.clients)
            const service = getSingle(appointment?.services)

            return (
              <article
                key={payment.id}
                className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xl font-semibold tracking-tight text-stone-950">
                      {formatMoney(payment.amount)}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {payment.payment_method ?? "Sin metodo"} ·{" "}
                      {getPaymentTypeLabel(payment.payment_type)}
                    </p>
                  </div>
                  <p className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600 ring-1 ring-stone-200">
                    {formatPaymentTime(payment.created_at)}
                  </p>
                </div>

                <div className="mt-3 grid gap-2 rounded-2xl bg-white px-3 py-3 text-sm text-stone-600 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-stone-900">Cliente:</span>{" "}
                    {client?.full_name ?? "Sin cliente"}
                  </p>
                  <p>
                    <span className="font-semibold text-stone-900">Servicio:</span>{" "}
                    {service?.name ?? "Sin servicio"}
                  </p>
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}

function CashClosurePanel({ cash }: { cash: ReturnType<typeof useAdminCash> }) {
  const countedAmount = Number(cash.countedAmount || 0)
  const difference = countedAmount - Number(cash.summary.dailyIncome || 0)

  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">
            Cierre de caja
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Controla monto esperado, contado y diferencia.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            cash.closure?.is_closed
              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-stone-100 text-stone-600 ring-1 ring-stone-200"
          }`}
        >
          {cash.closure?.is_closed ? "Cerrada" : "Abierta"}
        </span>
      </div>

      <form onSubmit={cash.handleCloseCash} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricBox label="Esperado" value={formatMoney(cash.summary.dailyIncome)} />
          <MetricBox label="Contado" value={formatMoney(countedAmount)} />
          <MetricBox
            label="Diferencia"
            value={formatMoney(difference)}
            tone={difference === 0 ? "stone" : difference > 0 ? "green" : "red"}
          />
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            Monto contado
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={cash.countedAmount}
            onChange={(event) => cash.setCountedAmount(event.target.value)}
            disabled={cash.closure?.is_closed}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-700 focus:ring-4 focus:ring-stone-100 disabled:bg-stone-100"
            placeholder="S/ 0.00"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
            Observacion
          </span>
          <textarea
            rows={3}
            value={cash.closureNotes}
            onChange={(event) => cash.setClosureNotes(event.target.value)}
            disabled={cash.closure?.is_closed}
            className="w-full resize-none rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-700 focus:ring-4 focus:ring-stone-100 disabled:bg-stone-100"
            placeholder="Ej. Todo conforme"
          />
        </label>

        {cash.closure?.is_closed && (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800 ring-1 ring-emerald-100">
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
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
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
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">
            Saldos por revisar
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Citas completadas que aun tienen saldo pendiente.
          </p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
          {cash.summary.completedWithDebt.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {cash.summary.completedWithDebt.length === 0 ? (
          <StateBox text="No hay citas completadas con saldo pendiente." compact />
        ) : (
          cash.summary.completedWithDebt.map((appointment) => {
            const client = getSingle(appointment.clients)
            const service = getSingle(appointment.services)

            return (
              <Link
                key={appointment.id}
                to={`/admin/pagos/${appointment.id}`}
                className="block rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 transition hover:bg-amber-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {client?.full_name ?? "Sin nombre"}
                    </p>
                    <p className="mt-1 text-xs">
                      {appointment.time?.slice(0, 5)} ·{" "}
                      {service?.name ?? "Sin servicio"}
                    </p>
                  </div>
                  <p className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                    {formatMoney(appointment.remaining_amount)}
                  </p>
                </div>
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
    green: "border-emerald-200 bg-emerald-50 text-emerald-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    red: "border-red-200 bg-red-50 text-red-950",
  }

  return (
    <article className={`rounded-[1.35rem] border p-4 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </article>
  )
}

function MetricBox({
  label,
  value,
  tone = "stone",
}: {
  label: string
  value: string
  tone?: "stone" | "green" | "red"
}) {
  const classes = {
    stone: "bg-stone-50 text-stone-950",
    green: "bg-emerald-50 text-emerald-900",
    red: "bg-red-50 text-red-900",
  }

  return (
    <div className={`rounded-2xl p-4 ${classes[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}

function StateBox({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-stone-300 px-4 text-center text-sm text-stone-500 ${
        compact ? "py-5" : "py-8"
      }`}
    >
      {text}
    </div>
  )
}

export default AdminCashPage
