import type { AgendaReservation } from "../../../features/admin-agenda/hooks/useAdminAgenda"
import { formatMoney } from "./agendaUtils"

type AgendaSummaryProps = {
  reservations: AgendaReservation[]
}

function AgendaSummary({ reservations }: AgendaSummaryProps) {
  const activeReservations = reservations.filter(
    (item) => item.status !== "cancelled"
  )
  const pending = reservations.filter((item) => item.status === "pending").length
  const confirmed = reservations.filter(
    (item) => item.status === "confirmed"
  ).length
  const completed = reservations.filter(
    (item) => item.status === "completed"
  ).length
  const pendingBalance = activeReservations.reduce(
    (acc, item) => acc + Number(item.remaining_amount ?? 0),
    0
  )

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 md:mb-5 md:grid-cols-4 md:gap-3">
      <SummaryCard label="Citas" value={String(activeReservations.length)} />
      <SummaryCard label="Confirmadas" value={String(confirmed)} tone="green" />
      <SummaryCard label="Pendientes" value={String(pending)} tone="amber" />
      <SummaryCard
        label="Saldo"
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
    <div className={`rounded-2xl border p-3 shadow-sm md:rounded-3xl md:p-4 ${toneClasses[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60 md:text-xs">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold md:mt-2 md:text-2xl">{value}</p>
      {detail ? <p className="mt-1 text-[11px] opacity-70 md:text-xs">{detail}</p> : null}
    </div>
  )
}

export default AgendaSummary
