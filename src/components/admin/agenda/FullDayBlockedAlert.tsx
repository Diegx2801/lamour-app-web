type FullDayBlockedAlertProps = {
  reason?: string | null
}

function FullDayBlockedAlert({ reason }: FullDayBlockedAlertProps) {
  return (
    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 md:mb-6">
      <p className="font-semibold">Este día está completamente bloqueado.</p>

      {reason ? <p className="mt-1 text-sm">Motivo: {reason}</p> : null}
    </div>
  )
}

export default FullDayBlockedAlert
