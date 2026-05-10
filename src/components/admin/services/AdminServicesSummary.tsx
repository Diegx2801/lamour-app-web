import { SummaryCard } from "./AdminServicesShared"

type AdminServicesSummaryProps = {
  total: number
  active: number
  inactive: number
  retouch: number
}

function AdminServicesSummary({
  total,
  active,
  inactive,
  retouch,
}: AdminServicesSummaryProps) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-4 md:mb-6">
      <SummaryCard title="Total servicios" value={total} />
      <SummaryCard title="Activos" value={active} />
      <SummaryCard title="Inactivos" value={inactive} />
      <SummaryCard title="Con retoque" value={retouch} />
    </div>
  )
}

export default AdminServicesSummary
