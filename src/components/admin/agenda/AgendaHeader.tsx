type AgendaHeaderProps = {
  isFullDayBlocked: boolean
  canManageBlocks: boolean
  selectedLashistName?: string | null
  onBlockFullDay: () => void
  onUnblockFullDay: () => void
}

function AgendaHeader({
  isFullDayBlocked,
  canManageBlocks,
  selectedLashistName,
  onBlockFullDay,
  onUnblockFullDay,
}: AgendaHeaderProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:mb-5 md:rounded-[2rem] md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Panel administrativo
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              Agenda
            </h1>

            {selectedLashistName ? (
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                {selectedLashistName}
              </span>
            ) : null}
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Reservas, disponibilidad, pagos y bloqueos del dia en una sola vista.
          </p>
        </div>

        {canManageBlocks && !isFullDayBlocked ? (
          <button
            type="button"
            onClick={onBlockFullDay}
            className="min-h-11 w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 md:w-auto"
          >
            {selectedLashistName ? "Bloquear lashista" : "Bloquear dia"}
          </button>
        ) : canManageBlocks ? (
          <button
            type="button"
            onClick={onUnblockFullDay}
            className="min-h-11 w-full rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 md:w-auto"
          >
            {selectedLashistName ? "Desbloquear lashista" : "Desbloquear dia"}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default AgendaHeader
