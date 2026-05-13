type AgendaHeaderProps = {
  isFullDayBlocked: boolean
  selectedLashistName?: string | null
  onBlockFullDay: () => void
  onUnblockFullDay: () => void
}

function AgendaHeader({
  isFullDayBlocked,
  selectedLashistName,
  onBlockFullDay,
  onUnblockFullDay,
}: AgendaHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">
          Panel administrativo
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
          Agenda
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Visualiza reservas, disponibilidad y bloqueos por horario
          {selectedLashistName ? ` para ${selectedLashistName}` : ""}.
        </p>
      </div>

      {!isFullDayBlocked ? (
        <button
          type="button"
          onClick={onBlockFullDay}
          className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-red-600 md:w-auto"
        >
          {selectedLashistName ? "Bloquear lashista" : "Bloquear día"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onUnblockFullDay}
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 md:w-auto"
        >
          {selectedLashistName ? "Desbloquear lashista" : "Desbloquear día"}
        </button>
      )}
    </div>
  )
}

export default AgendaHeader