import { useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { supabase } from "../lib/supabase"

type PaymentRow = {
  id: string
  amount: number
  payment_method: string | null
  created_at?: string
}

function AdminPaymentsPage() {
  const { id } = useParams()

  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("yape")
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchPayments = async () => {
    if (!id) return

    const { data, error } = await supabase
      .from("payments")
      .select("id, amount, payment_method, created_at")
      .eq("appointment_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      setError("No se pudo cargar el historial de pagos.")
      return
    }

    setPayments((data ?? []) as PaymentRow[])
  }

  useEffect(() => {
    fetchPayments()
  }, [id])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!id) {
      setError("Reserva no válida.")
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError("Ingresa un monto válido.")
      return
    }

    try {
      setLoading(true)

      const paymentAmount = Number(amount)

      const { error: insertError } = await supabase.from("payments").insert([
        {
          appointment_id: id,
          amount: paymentAmount,
          payment_method: method,
          payment_type: "deposit",
          status: "completed",
        },
      ])

      if (insertError) throw insertError

      const { data: allPayments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount")
        .eq("appointment_id", id)

      if (paymentsError) throw paymentsError

      const totalPaid = (allPayments ?? []).reduce(
        (acc, p) => acc + Number(p.amount || 0),
        0
      )

      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .select("total_price")
        .eq("id", id)
        .single()

      if (appointmentError) throw appointmentError

      const total = Number(appointment?.total_price || 0)
      const remaining = total - totalPaid

      const { error: updateError } = await supabase
        .from("appointments")
        .update({
          deposit_amount: totalPaid,
          remaining_amount: remaining,
          status: remaining <= 0 ? "completed" : "confirmed",
        })
        .eq("id", id)

      if (updateError) throw updateError

      setAmount("")
      await fetchPayments()
    } catch {
      setError("Error al registrar pago.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link to="/admin/reservas" className="text-sm text-stone-600">
          ← Volver
        </Link>

        <h1 className="mt-4 mb-6 text-3xl font-semibold">
          Registrar pago
        </h1>

        <form
          onSubmit={handlePayment}
          className="space-y-4 rounded-2xl bg-white p-6 shadow"
        >
          <input
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          />

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
            <option value="efectivo">Efectivo</option>
          </select>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 text-white disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Registrar pago"}
          </button>
        </form>

        <div className="mt-8">
          <h2 className="mb-3 text-xl font-semibold">
            Historial de pagos
          </h2>

          {payments.length === 0 && (
            <p className="text-sm text-stone-500">
              No hay pagos registrados
            </p>
          )}

          {payments.map((p) => (
            <div
              key={p.id}
              className="mb-2 rounded-xl bg-white p-4 shadow"
            >
              <p className="font-semibold">
                S/ {Number(p.amount).toFixed(2)}
              </p>
              <p className="text-sm text-stone-500">
                {p.payment_method ?? "Sin método"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminPaymentsPage