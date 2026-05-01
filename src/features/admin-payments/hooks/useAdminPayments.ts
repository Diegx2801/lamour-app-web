import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { toast } from "sonner"
import {
  createAppointmentPayment,
  fetchAppointmentPaymentSummary,
  fetchAppointmentPayments,
  updateAppointmentPaymentTotals,
  type AppointmentPaymentSummary,
  type PaymentRow,
} from "../api/adminPaymentsService"

type PaymentMethod = "yape" | "plin" | "efectivo"

export function useAdminPayments() {
  const { id } = useParams()

  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("yape")
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [summary, setSummary] = useState<AppointmentPaymentSummary | null>(null)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  const appointmentId = id ?? ""

  const totalPaid = useMemo(() => {
    return payments.reduce((acc, payment) => acc + Number(payment.amount || 0), 0)
  }, [payments])

  const totalPrice = Number(summary?.total_price ?? 0)
  const remainingAmount = Math.max(totalPrice - totalPaid, 0)

  const loadPaymentsData = async () => {
    if (!appointmentId) return

    try {
      setLoadingData(true)
      setError("")

      const [summaryData, paymentsData] = await Promise.all([
        fetchAppointmentPaymentSummary(appointmentId),
        fetchAppointmentPayments(appointmentId),
      ])

      setSummary(summaryData)
      setPayments(paymentsData)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar pagos."

      setError(message)
      toast.error(message)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    loadPaymentsData()
  }, [appointmentId])

  const validatePayment = () => {
    if (!appointmentId) return "Reserva no válida."

    const numericAmount = Number(amount)

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return "Ingresa un monto válido."
    }

    if (numericAmount > remainingAmount) {
      return `El pago no puede superar el saldo pendiente de S/ ${remainingAmount.toFixed(
        2
      )}.`
    }

    if (remainingAmount <= 0) {
      return "La reserva ya está pagada."
    }

    return ""
  }

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault()

    const loadingToastId = toast.loading("Registrando pago...")

    try {
      setLoading(true)
      setError("")

      const validationMessage = validatePayment()

      if (validationMessage) {
        setError(validationMessage)
        toast.dismiss(loadingToastId)
        toast.error(validationMessage)
        return
      }

      const paymentAmount = Number(amount)
      const newTotalPaid = totalPaid + paymentAmount
      const newRemainingAmount = Math.max(totalPrice - newTotalPaid, 0)

      await createAppointmentPayment({
        appointmentId,
        amount: paymentAmount,
        paymentMethod: method,
      })

      await updateAppointmentPaymentTotals({
        appointmentId,
        totalPaid: newTotalPaid,
        remainingAmount: newRemainingAmount,
      })

      setAmount("")
      toast.dismiss(loadingToastId)
      toast.success("Pago registrado correctamente.")

      await loadPaymentsData()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al registrar pago."

      setError(message)
      toast.dismiss(loadingToastId)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return {
    appointmentId,

    amount,
    setAmount,

    method,
    setMethod,

    payments,
    summary,

    totalPaid,
    totalPrice,
    remainingAmount,

    error,
    loading,
    loadingData,

    handlePayment,
  }
}