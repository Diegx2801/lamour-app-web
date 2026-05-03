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
  const tabs = [
    { key: "active" as const, label: "Activas", count: activeCount },
    { key: "completed" as const, label: "Completadas", count: completedCount },
    { key: "cancelled" as const, label: "Canceladas", count: cancelledCount },
  ]

  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1 md:mb-6 md:flex-wrap md:overflow-visible">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`min-w-fit rounded-full px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-stone-950 text-white"
                : "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        )
      })}
    </div>
  )
}

export default AdminReservationsTabs