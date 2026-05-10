export function getStatusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700"
    case "completed":
      return "bg-blue-100 text-blue-700"
    case "cancelled":
      return "bg-red-100 text-red-700"
    case "pending":
      return "bg-amber-100 text-amber-700"
    case "no_show":
      return "bg-stone-200 text-stone-700"
    default:
      return "bg-stone-100 text-stone-700"
  }
}

export function formatCurrency(value: number) {
  return `S/ ${value.toFixed(2)}`
}
