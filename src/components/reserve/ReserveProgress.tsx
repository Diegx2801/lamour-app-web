type ReserveProgressProps = {
  step: number
  totalSteps?: number
  title: string
}

function ReserveProgress({
  step,
  totalSteps = 4,
  title,
}: ReserveProgressProps) {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-stone-500">
        Paso {step} de {totalSteps}
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-stone-950">
        {title}
      </h2>

      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-stone-950 transition-all"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default ReserveProgress