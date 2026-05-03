type Props = {
  selectedDate: string
  searchTerm: string
  onDateChange: (value: string) => void
  onSearchChange: (value: string) => void
  onClear: () => void
}

function AdminReservationsFilters({
  selectedDate,
  searchTerm,
  onDateChange,
  onSearchChange,
  onClear,
}: Props) {
  return (
    <div className="mb-5 rounded-[1.5rem] bg-white p-4 shadow-sm md:mb-6 md:rounded-[2rem] md:p-6">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label
            htmlFor="reservation-date"
            className="mb-2 block text-sm font-medium text-stone-800"
          >
            Fecha
          </label>

          <input
            id="reservation-date"
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500"
          />
        </div>

        <div>
          <label
            htmlFor="reservation-search"
            className="mb-2 block text-sm font-medium text-stone-800"
          >
            Cliente o teléfono
          </label>

          <input
            id="reservation-search"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="María o 957230015"
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500"
          />
        </div>

        <button
          type="button"
          onClick={onClear}
          className="w-full rounded-xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-50 md:w-auto"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}

export default AdminReservationsFilters