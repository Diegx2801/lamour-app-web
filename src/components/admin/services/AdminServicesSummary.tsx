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
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5 md:mb-6">
      <SummaryCard title="Total" value={total} hint="catalogo admin" />
      <SummaryCard title="Activos" value={active} hint="visibles" tone="green" />
      <SummaryCard
        title="Inactivos"
        value={inactive}
        hint="ocultos"
        tone={inactive > 0 ? "amber" : "stone"}
      />
      <SummaryCard title="Retoque" value={retouch} hint="permiten retoque" tone="blue" />
      <SummaryCard title="Paquetes" value={packages} hint="combos" />
    </div>
  )
}

export default AdminServicesSummary
