type TabKey = "active" | "completed" | "cancelled"

type Props = {
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
  activeCount: number
  completedCount: number
  cancelledCount: number
}

function AdminReservationsTabs({
  activeTab,
  setActiveTab,
  activeCount,
  completedCount,
  cancelledCount,
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => setActiveTab("active")}
        className={`rounded-full px-5 py-3 text-sm font-medium ${
          activeTab === "active"
            ? "bg-stone-950 text-white"
            : "border border-stone-300 bg-white text-stone-800"
        }`}
      >
        Activas ({activeCount})
      </button>

      <button
        type="button"
        onClick={() => setActiveTab("completed")}
        className={`rounded-full px-5 py-3 text-sm font-medium ${
          activeTab === "completed"
            ? "bg-stone-950 text-white"
            : "border border-stone-300 bg-white text-stone-800"
        }`}
      >
        Completadas ({completedCount})
      </button>

      <button
        type="button"
        onClick={() => setActiveTab("cancelled")}
        className={`rounded-full px-5 py-3 text-sm font-medium ${
          activeTab === "cancelled"
            ? "bg-stone-950 text-white"
            : "border border-stone-300 bg-white text-stone-800"
        }`}
      >
        Canceladas ({cancelledCount})
      </button>
    </div>
  )
}

export default AdminReservationsTabs