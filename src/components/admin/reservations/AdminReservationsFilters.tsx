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
    <div className="mb-6 grid gap-4 rounded-[2rem] bg-white p-6 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end">
      <div>
        <label
          htmlFor="reservation-date"
          className="mb-2 block text-sm font-medium text-stone-800"
        >
          Filtrar por fecha
        </label>

        <input
          id="reservation-date"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="reservation-search"
          className="mb-2 block text-sm font-medium text-stone-800"
        >
          Buscar cliente o teléfono
        </label>

        <input
          id="reservation-search"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Ejemplo: María o 957230015"
          className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none"
        />
      </div>

      <button
        type="button"
        onClick={onClear}
        className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800"
      >
        Limpiar filtros
      </button>
    </div>
  )
}

export default AdminReservationsFilters