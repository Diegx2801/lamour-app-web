import { useEffect, useState } from "react"
import { useParams, Link } from "react-router"
import { supabase } from "../lib/supabase"

function AdminPaymentsPage() {
  const { id } = useParams()

  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("yape")
  const [payments, setPayments] = useState<any[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("appointment_id", id)
      .order("created_at", { ascending: false })

    setPayments(data || [])
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handlePayment = async (e: any) => {
    e.preventDefault()
    setError("")

    if (!amount) {
      setError("Ingresa monto")
      return
    }

    try {
      setLoading(true)

      const paymentAmount = Number(amount)

      // 1. Insertar pago
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

      // 2. Obtener todos los pagos
      const { data: allPayments } = await supabase
        .from("payments")
        .select("amount")
        .eq("appointment_id", id)

      const totalPaid = (allPayments ?? []).reduce(
        (acc, p) => acc + Number(p.amount || 0),
        0
      )

      // 3. Obtener total de la reserva
      const { data: appointment } = await supabase
        .from("appointments")
        .select("total_price")
        .eq("id", id)
        .single()

      const total = Number(appointment?.total_price || 0)
      const remaining = total - totalPaid

      // 4. Actualizar reserva
      await supabase
        .from("appointments")
        .update({
          deposit_amount: totalPaid,
          remaining_amount: remaining,
          status: remaining <= 0 ? "completed" : "confirmed",
        })
        .eq("id", id)

      setAmount("")
      fetchPayments()
    } catch (err) {
      setError("Error al registrar pago")
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

        <h1 className="text-3xl font-semibold mt-4 mb-6">
          Registrar pago
        </h1>

        <form
          onSubmit={handlePayment}
          className="bg-white p-6 rounded-2xl shadow space-y-4"
        >
          <input
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border px-4 py-3 rounded-xl"
          />

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full border px-4 py-3 rounded-xl"
          >
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
            <option value="efectivo">Efectivo</option>
          </select>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button className="w-full bg-black text-white py-3 rounded-xl">
            {loading ? "Guardando..." : "Registrar pago"}
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">
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
              className="bg-white p-4 rounded-xl shadow mb-2"
            >
              <p className="font-semibold">
                S/ {Number(p.amount).toFixed(2)}
              </p>
              <p className="text-sm text-stone-500">
                {p.payment_method}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default AdminPaymentsPage