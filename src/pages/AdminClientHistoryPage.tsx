import { Link } from "react-router"
import {
  useAdminClientHistory,
  getServiceData,
  getStatusClasses,
  getStatusLabel,
  formatTime,
  formatMoney,
} from "../features/admin-clients/hooks/useAdminClientHistory"

function AdminClientHistoryPage() {
  const clientHistory = useAdminClientHistory()

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/admin/reservas"
            className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
          >
            ← Volver a reservas
          </Link>

          <button
            type="button"
            onClick={clientHistory.downloadPdfReport}
            disabled={clientHistory.history.length === 0}
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            Descargar PDF
          </button>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Cliente
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-stone-950 sm:text-4xl">
            Historial del cliente
          </h1>

          {!clientHistory.loading && clientHistory.clientInfo && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <InfoCard
                label="Nombre"
                value={clientHistory.clientInfo.full_name ?? "Sin nombre"}
              />

              <InfoCard
                label="Teléfono"
                value={clientHistory.clientInfo.phone ?? "Sin teléfono"}
              />

              <InfoCard
                label="Visitas"
                value={clientHistory.totalVisits}
              />

              <InfoCard
                label="Completadas"
                value={clientHistory.completedVisits}
              />

              <InfoCard
                label="Total gastado"
                value={formatMoney(clientHistory.totalSpent)}
              />

              <InfoCard
                label="Saldo pendiente"
                value={formatMoney(clientHistory.pendingBalance)}
              />
            </div>
          )}

          {clientHistory.loading && (
            <StateBox text="Cargando historial..." />
          )}

          {clientHistory.error && (
            <StateBox text={clientHistory.error} error />
          )}

          {!clientHistory.loading &&
            !clientHistory.error &&
            clientHistory.history.length === 0 && (
              <StateBox text="No se encontraron reservas para este cliente." />
            )}

          {!clientHistory.loading &&
            !clientHistory.error &&
            clientHistory.history.length > 0 && (
              <>
                <div className="mt-8 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                  Reservas completadas:{" "}
                  <strong>{clientHistory.completedVisits}</strong>
                </div>

                <div className="mt-6 grid gap-4 md:hidden">
                  {clientHistory.history.map((item) => {
                    const service = getServiceData(item.services)

                    return (
                      <div
                        key={item.id}
                        className="rounded-[2rem] border border-stone-200 bg-white p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-stone-950">
                              {service?.name ?? "Sin servicio"}
                            </p>

                            <p className="mt-1 text-sm text-stone-500">
                              {service?.category ?? "Sin categoría"}
                            </p>
                          </div>

                          <StatusBadge status={item.status} />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <InfoItem label="Fecha" value={item.date} />
                          <InfoItem label="Hora" value={formatTime(item.time)} />
                          <InfoItem
                            label="Lashista"
                            value={item.lashista ?? "Sin asignar"}
                          />
                          <InfoItem
                            label="Saldo"
                            value={formatMoney(item.remaining_amount)}
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <PaymentBox
                            label="Total"
                            value={item.total_price}
                          />
                          <PaymentBox
                            label="Abono"
                            value={item.deposit_amount}
                          />
                          <PaymentBox
                            label="Saldo"
                            value={item.remaining_amount}
                          />
                        </div>

                        {item.notes && (
                          <div className="mt-4 rounded-2xl bg-stone-50 p-3 text-sm text-stone-600">
                            Nota: {item.notes}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <ActionLink
                            to={`/admin/reservas/${item.id}`}
                            label="Editar"
                          />

                          <ActionLink
                            to={`/admin/pagos/${item.id}`}
                            label="Pagos"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 hidden overflow-x-auto rounded-[2rem] border border-stone-200 md:block">
                  <table className="min-w-full bg-white text-left text-sm">
                    <thead className="border-b border-stone-200 bg-stone-50">
                      <tr>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Servicio</TableHead>
                        <TableHead>Lashista</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Abono</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>Notas</TableHead>
                        <TableHead>Acciones</TableHead>
                      </tr>
                    </thead>

                    <tbody>
                      {clientHistory.history.map((item) => {
                        const service = getServiceData(item.services)

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-stone-100 align-top transition hover:bg-stone-50"
                          >
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{formatTime(item.time)}</TableCell>

                            <TableCell>
                              <p className="font-medium text-stone-900">
                                {service?.name ?? "Sin servicio"}
                              </p>
                              <p className="mt-1 text-xs text-stone-500">
                                {service?.category ?? "Sin categoría"}
                              </p>
                            </TableCell>

                            <TableCell>
                              {item.lashista ?? "Sin asignar"}
                            </TableCell>

                            <TableCell>
                              <StatusBadge status={item.status} />
                            </TableCell>

                            <TableCell>
                              {formatMoney(item.total_price)}
                            </TableCell>

                            <TableCell>
                              {formatMoney(item.deposit_amount)}
                            </TableCell>

                            <TableCell>
                              {formatMoney(item.remaining_amount)}
                            </TableCell>

                            <TableCell>
                              {item.notes ?? "-"}
                            </TableCell>

                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                <ActionLink
                                  to={`/admin/reservas/${item.id}`}
                                  label="Editar"
                                />

                                <ActionLink
                                  to={`/admin/pagos/${item.id}`}
                                  label="Pagos"
                                />
                              </div>
                            </TableCell>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 font-semibold text-stone-900">{value}</p>
    </div>
  )
}

function StateBox({ text, error }: { text: string; error?: boolean }) {
  return (
    <div
      className={`mt-6 rounded-2xl p-6 text-sm ${
        error
          ? "border border-red-200 bg-red-50 text-red-700"
          : "bg-stone-50 text-stone-600"
      }`}
    >
      {text}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 font-medium text-stone-900">{value}</p>
    </div>
  )
}

function PaymentBox({
  label,
  value,
}: {
  label: string
  value: number | null | undefined
}) {
  return (
    <div className="rounded-2xl bg-stone-50 p-3 text-center">
      <p className="text-[11px] uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-stone-950">
        {formatMoney(value)}
      </p>
    </div>
  )
}

function ActionLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-500"
    >
      {label}
    </Link>
  )
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 font-semibold text-stone-900">{children}</th>
  )
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-4 text-stone-700">{children}</td>
}

export default AdminClientHistoryPage