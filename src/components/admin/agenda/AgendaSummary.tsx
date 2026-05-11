import type { AgendaReservation } from "../../../features/admin-agenda/hooks/useAdminAgenda"
import { formatMoney } from "./agendaUtils"

type AgendaSummaryProps = {
  reservations: AgendaReservation[]
}

function AgendaSummary({ reservations }: AgendaSummaryProps) {
  const pending = reservations.filter((item) => item.status === "pending").length
  const confirmed = reservations.filter(
    (item) => item.status === "confirmed"
  ).length
  const completed = reservations.filter(
    (item) => item.status === "completed"
  ).length
  const pendingBalance = reservations
    .filter((item) => item.status !== "cancelled")
    .reduce((acc, item) => acc + Number(item.remaining_amount ?? 0), 0)

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Citas del día" value={String(reservations.length)} />
      <SummaryCard label="Confirmadas" value={String(confirmed)} tone="green" />
      <SummaryCard label="Pendientes" value={String(pending)} tone="amber" />
      <SummaryCard
        label="Saldos pendientes"
        value={formatMoney(pendingBalance)}
        tone={pendingBalance > 0 ? "red" : "green"}
        detail={`${completed} completadas`}
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  detail,
  tone = "stone",
}: {
  label: string
  value: string
  detail?: string
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
      {detail ? <p className="mt-1 text-xs opacity-70">{detail}</p> : null}
    </div>
  )
}

export default AgendaSummary
