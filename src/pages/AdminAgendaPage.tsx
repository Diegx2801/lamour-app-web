import AgendaFilters from "../components/admin/agenda/AgendaFilters"
import AgendaHeader from "../components/admin/agenda/AgendaHeader"
import AgendaScheduleGrid from "../components/admin/agenda/AgendaScheduleGrid"
import AgendaSummary from "../components/admin/agenda/AgendaSummary"
import AgendaWeekSummary from "../components/admin/agenda/AgendaWeekSummary"
import FullDayBlockedAlert from "../components/admin/agenda/FullDayBlockedAlert"
import { useAdminAgenda } from "../features/admin-agenda/hooks/useAdminAgenda"

function AdminAgendaPage() {
  const agenda = useAdminAgenda()

  return (
    <div>
      <AgendaHeader
        isFullDayBlocked={agenda.isFullDayBlocked}
        canManageBlocks={agenda.canManageBlocks}
        selectedLashistName={agenda.selectedLashist?.name ?? null}
        onBlockFullDay={agenda.handleBlockFullDay}
        onUnblockFullDay={agenda.handleUnblockFullDay}
      />

      <AgendaFilters
        selectedDate={agenda.selectedDate}
        selectedLashistId={agenda.selectedLashistId}
        selectedLashistName={agenda.selectedLashist?.name ?? null}
        lashists={agenda.lashists}
        loadingLashists={agenda.loadingLashists}
        onDateChange={agenda.setSelectedDate}
        onLashistChange={agenda.setSelectedLashistId}
        noticeState={agenda.lashistNoticeState}
        onSendWeek={agenda.sendWeeklyWhatsappToLashist}
      />

      <AgendaSummary reservations={agenda.filteredReservations} />

      <AgendaWeekSummary
        selectedDate={agenda.selectedDate}
        weekReservations={agenda.weekReservations}
        weekStart={agenda.weekRange.start}
        onDateChange={agenda.setSelectedDate}
      />

      {agenda.isFullDayBlocked && (
        <FullDayBlockedAlert reason={agenda.fullDayBlock?.reason} />
      )}

      {agenda.overdueOpenReservations.length > 0 && (
        <section className="mb-5 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm md:rounded-3xl md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
                Atención
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                {agenda.overdueOpenReservations.length} cita
                {agenda.overdueOpenReservations.length === 1 ? "" : "s"} por cerrar
              </h2>
              <p className="mt-1 text-sm leading-6 text-red-700">
                Ya pasó la duración estimada y siguen como pendiente o confirmada.
                Revisa pago, completada, cancelada o no show.
              </p>
            </div>

            <div className="grid gap-2 text-sm md:min-w-72">
              {agenda.overdueOpenReservations.slice(0, 3).map((reservation) => (
                <div
                  key={reservation.id}
                  className="rounded-2xl bg-white/80 px-3 py-2 font-medium"
                >
                  {reservation.time.slice(0, 5)} ·{" "}
                  {Array.isArray(reservation.clients)
                    ? reservation.clients[0]?.full_name
                    : reservation.clients?.full_name ?? "Sin nombre"}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {agenda.loading && (
        <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-600 shadow-sm">
          Cargando agenda...
        </div>
      )}

      {agenda.error && (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {agenda.error}
        </div>
      )}

      {!agenda.loading && (
        <AgendaScheduleGrid
          reservationsByTime={agenda.reservationsByTime}
          timeSlots={agenda.scheduleSlots}
          blockedTimes={agenda.blockedTimes}
          isFullDayBlocked={agenda.isFullDayBlocked}
          lashCapacity={agenda.lashCapacity}
          lashists={agenda.lashists}
          selectedLashistId={agenda.selectedLashistId}
          canManageBlocks={agenda.canManageBlocks}
          getLashOccupancy={agenda.getLashOccupancy}
          onBlock={agenda.handleBlock}
          onUnblock={agenda.handleUnblock}
          onUpdateStatus={agenda.updateStatus}
          onPaymentRegistered={agenda.refreshAgenda}
        />
      )}
    </div>
  )
}

export default AdminAgendaPage
