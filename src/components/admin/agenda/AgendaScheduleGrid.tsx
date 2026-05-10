import { timeSlots } from "../../../data/timeSlots"
import type { AgendaReservation } from "../../../features/admin-agenda/hooks/useAdminAgenda"
import { BlockedBox } from "./AgendaShared"
import AgendaReservationCard from "./AgendaReservationCard"
import { getOccupancyBadgeClasses } from "./agendaUtils"

type AgendaScheduleGridProps = {
  reservationsByTime: Record<string, AgendaReservation[]>
  blockedTimes: string[]
  isFullDayBlocked: boolean
  lashCapacity: number
  getLashOccupancy: (slot: string) => number
  onBlock: (slot: string) => void
  onUnblock: (slot: string) => void
  onUpdateStatus: (id: string, status: string) => void
}

function AgendaScheduleGrid({
  reservationsByTime,
  blockedTimes,
  isFullDayBlocked,
  lashCapacity,
  getLashOccupancy,
  onBlock,
  onUnblock,
  onUpdateStatus,
}: AgendaScheduleGridProps) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm md:rounded-3xl">
      <div className="grid grid-cols-[82px_1fr] border-b border-stone-200 bg-stone-50 md:grid-cols-[110px_1fr]">
        <div className="border-r border-stone-200 px-3 py-3 text-xs font-semibold text-stone-600 md:px-4 md:text-sm">
          Hora
        </div>

        <div className="px-3 py-3 text-xs font-semibold text-stone-600 md:px-4 md:text-sm">
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
              className="grid grid-cols-[82px_1fr] border-b border-stone-100 last:border-b-0 md:grid-cols-[110px_1fr]"
            >
              <div className="border-r border-stone-100 bg-stone-50/70 px-3 py-4 md:px-4 md:py-5">
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

              <div className="min-h-[96px] px-3 py-3 md:min-h-[110px] md:px-4 md:py-4">
                {isFullDayBlocked ? (
                  <BlockedBox label="Día bloqueado" />
                ) : isBlocked ? (
                  <BlockedTimeSlot onUnblock={() => onUnblock(slot)} />
                ) : slotReservations.length > 0 ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {slotReservations.map((reservation) => (
                      <AgendaReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onUpdateStatus={onUpdateStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <AvailableTimeSlot onBlock={() => onBlock(slot)} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BlockedTimeSlot({ onUnblock }: { onUnblock: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-medium text-red-700">
        Horario bloqueado manualmente
      </p>

      <button
        type="button"
        onClick={onUnblock}
        className="w-full rounded-lg bg-white px-3 py-2 text-xs font-medium text-green-700 md:w-auto"
      >
        Desbloquear
      </button>
    </div>
  )
}

function AvailableTimeSlot({ onBlock }: { onBlock: () => void }) {
  return (
    <div className="flex min-h-[72px] flex-col gap-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 px-4 py-3 md:min-h-[80px] md:flex-row md:items-center md:justify-between">
      <p className="text-sm font-medium text-stone-400">Disponible</p>

      <button
        type="button"
        onClick={onBlock}
        className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 md:w-auto"
      >
        Bloquear
      </button>
    </div>
  )
}

export default AgendaScheduleGrid
