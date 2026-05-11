import { SummaryCard } from "./AdminServicesShared"

type AdminServicesSummaryProps = {
  total: number
  active: number
  inactive: number
  retouch: number
  packages: number
}

function AdminServicesSummary({
  total,
  active,
  inactive,
  retouch,
  packages,
}: AdminServicesSummaryProps) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 md:mb-6">
      <SummaryCard title="Total servicios" value={total} />
      <SummaryCard title="Activos" value={active} />
      <SummaryCard title="Inactivos" value={inactive} />
      <SummaryCard title="Con retoque" value={retouch} />
      <SummaryCard title="Paquetes" value={packages} />
    </div>
  )
}

export default AdminServicesSummary
