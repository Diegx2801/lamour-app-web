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
          blockedTimes={agenda.blockedTimes}
          isFullDayBlocked={agenda.isFullDayBlocked}
          lashCapacity={agenda.lashCapacity}
          lashists={agenda.lashists}
          selectedLashistId={agenda.selectedLashistId}
          getLashOccupancy={agenda.getLashOccupancy}
          onBlock={agenda.handleBlock}
          onUnblock={agenda.handleUnblock}
          onUpdateStatus={agenda.updateStatus}
        />
      )}
    </div>
  )
}

export default AdminAgendaPage
