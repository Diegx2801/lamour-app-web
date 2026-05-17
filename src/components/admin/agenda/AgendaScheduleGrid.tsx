import type {
  AgendaLashistRow,
  AgendaReservation,
} from "../../../features/admin-agenda/hooks/useAdminAgenda"
import { BlockedBox } from "./AgendaShared"
import AgendaReservationCard from "./AgendaReservationCard"
import { getOccupancyBadgeClasses } from "./agendaUtils"

type AgendaScheduleGridProps = {
  reservationsByTime: Record<string, AgendaReservation[]>
  timeSlots: string[]
  blockedTimes: string[]
  isFullDayBlocked: boolean
  lashCapacity: number
  lashists: AgendaLashistRow[]
  selectedLashistId: string
  canManageBlocks: boolean
  getLashOccupancy: (slot: string) => number
  onBlock: (slot: string) => void
  onUnblock: (slot: string) => void
  onUpdateStatus: (id: string, status: string) => void
}

function AgendaScheduleGrid({
  reservationsByTime,
  timeSlots,
  blockedTimes,
  isFullDayBlocked,
  lashCapacity,
  lashists,
  selectedLashistId,
  canManageBlocks,
  getLashOccupancy,
  onBlock,
  onUnblock,
  onUpdateStatus,
}: AgendaScheduleGridProps) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm md:rounded-3xl">
      <div className="grid grid-cols-[68px_1fr] border-b border-stone-200 bg-stone-50 sm:grid-cols-[82px_1fr] md:grid-cols-[110px_1fr]">
        <div className="border-r border-stone-200 px-2 py-3 text-xs font-semibold text-stone-600 md:px-4 md:text-sm">
          Hora
        </div>

        <div className="px-2 py-3 text-xs font-semibold text-stone-600 md:px-4 md:text-sm">
          Reservas / disponibilidad
        </div>
      </div>

      <div>
        {timeSlots.map((slot) => {
          const slotReservations = reservationsByTime[slot] ?? []
          const isBlocked = blockedTimes.includes(slot)
          const lashOccupied = getLashOccupancy(slot)

          return (
            <div
              key={slot}
              className="grid grid-cols-[68px_1fr] border-b border-stone-100 last:border-b-0 sm:grid-cols-[82px_1fr] md:grid-cols-[110px_1fr]"
            >
              <div className="border-r border-stone-100 bg-stone-50/70 px-2 py-4 md:px-4 md:py-5">
                <p className="text-sm font-semibold text-stone-900 md:text-base">
                  {slot}
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-medium md:text-[11px] ${getOccupancyBadgeClasses(
                    lashOccupied,
                    lashCapacity
                  )}`}
                >
                  {lashOccupied >= lashCapacity
                    ? "FULL"
                    : `${lashOccupied}/${lashCapacity}`}
                </span>
              </div>

              <div className="min-w-0 px-2 py-3 md:min-h-[110px] md:px-4 md:py-4">
                {isFullDayBlocked ? (
                  <BlockedBox label="Día bloqueado" />
                ) : isBlocked ? (
                  <BlockedTimeSlot
                    canManageBlocks={canManageBlocks}
                    onUnblock={() => onUnblock(slot)}
                  />
                ) : slotReservations.length > 0 ? (
                  selectedLashistId ? (
                    <ReservationGrid
                      reservations={slotReservations}
                      onUpdateStatus={onUpdateStatus}
                    />
                  ) : (
                    <LashistColumns
                      lashists={lashists}
                      reservations={slotReservations}
                      onUpdateStatus={onUpdateStatus}
                    />
                  )
                ) : (
                  <AvailableTimeSlot
                    canManageBlocks={canManageBlocks}
                    onBlock={() => onBlock(slot)}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReservationGrid({
  reservations,
  onUpdateStatus,
}: {
  reservations: AgendaReservation[]
  onUpdateStatus: (id: string, status: string) => void
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {reservations.map((reservation) => (
        <AgendaReservationCard
          key={reservation.id}
          reservation={reservation}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  )
}

function LashistColumns({
  lashists,
  reservations,
  onUpdateStatus,
}: {
  lashists: AgendaLashistRow[]
  reservations: AgendaReservation[]
  onUpdateStatus: (id: string, status: string) => void
}) {
  const columns = [
    { id: "__unassigned", name: "Sin asignar" },
    ...lashists.map((lashist) => ({ id: lashist.id, name: lashist.name })),
  ]

  return (
    <div className="grid gap-2 md:gap-3 xl:grid-cols-3">
      {columns.map((column) => {
        const columnReservations = reservations.filter((reservation) =>
          column.id === "__unassigned"
            ? !reservation.lashist_id
            : reservation.lashist_id === column.id
        )

        return (
          <div
            key={column.id}
            className="min-h-24 rounded-2xl border border-stone-200 bg-stone-50/70 p-2"
          >
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <p className="text-xs font-semibold text-stone-700">
                {column.name}
              </p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-stone-500">
                {columnReservations.length}
              </span>
            </div>

            {columnReservations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-200 bg-white/70 px-3 py-3 text-center text-xs text-stone-400 md:py-4">
                Libre
              </div>
            ) : (
              <div className="grid gap-2">
                {columnReservations.map((reservation) => (
                  <AgendaReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onUpdateStatus={onUpdateStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function BlockedTimeSlot({
  canManageBlocks,
  onUnblock,
}: {
  canManageBlocks: boolean
  onUnblock: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-medium text-red-700">
        Horario bloqueado manualmente
      </p>

      {canManageBlocks && (
        <button
          type="button"
          onClick={onUnblock}
          className="w-full rounded-lg bg-white px-3 py-2 text-xs font-medium text-green-700 md:w-auto"
        >
          Desbloquear
        </button>
      )}
    </div>
  )
}

function AvailableTimeSlot({
  canManageBlocks,
  onBlock,
}: {
  canManageBlocks: boolean
  onBlock: () => void
}) {
  return (
    <div className="flex min-h-[72px] flex-col gap-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 px-4 py-3 md:min-h-[80px] md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-medium text-stone-400">Disponible</p>

      {canManageBlocks && (
        <button
          type="button"
          onClick={onBlock}
          className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 md:w-auto"
        >
          Bloquear
        </button>
      )}
    </div>
  )
}

export default AgendaScheduleGrid
