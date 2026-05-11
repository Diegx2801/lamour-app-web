import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router"
import { toast } from "sonner"
import { createAppointmentAuditLog } from "../../appointment-audit/api/appointmentAuditService"
import {
  createAppointmentPayment,
  fetchAppointmentPaymentSummary,
  fetchAppointmentPayments,
  updateAppointmentPaymentTotals,
  type AppointmentPaymentSummary,
  type PaymentRow,
} from "../api/adminPaymentsService"

type PaymentMethod = "yape" | "plin" | "efectivo"
type PaymentType = "deposit" | "remaining" | "full" | "adjustment"

export function useAdminPayments() {
  const { id } = useParams()

  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("yape")
  const [paymentType, setPaymentType] = useState<PaymentType>("remaining")
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

  const getPaymentAmount = () => {
    if (paymentType === "full") return remainingAmount
    return Number(amount)
  }

  const validatePayment = () => {
    if (!appointmentId) return "Reserva no válida."

    const numericAmount = getPaymentAmount()

    if (paymentType === "full" && remainingAmount <= 0) {
      return "La reserva ya está pagada."
    }

    if (
      paymentType !== "full" &&
      (!amount || Number.isNaN(numericAmount) || numericAmount === 0)
    ) {
      return "Ingresa un monto válido."
    }

    if (paymentType !== "adjustment" && numericAmount <= 0) {
      return "El monto debe ser mayor a cero."
    }

    const nextTotalPaid = totalPaid + numericAmount

    if (paymentType === "adjustment" && nextTotalPaid < 0) {
      return "El ajuste no puede dejar el total pagado en negativo."
    }

    if (nextTotalPaid > totalPrice) {
      return `El pago no puede superar el saldo pendiente de S/ ${remainingAmount.toFixed(
        2
      )}.`
    }

    if (remainingAmount <= 0 && paymentType !== "adjustment") {
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

      const paymentAmount = getPaymentAmount()
      const newTotalPaid = totalPaid + paymentAmount
      const newRemainingAmount = Math.max(totalPrice - newTotalPaid, 0)

      await createAppointmentPayment({
        appointmentId,
        amount: paymentAmount,
        paymentMethod: method,
        paymentType,
      })

      await updateAppointmentPaymentTotals({
        appointmentId,
        totalPaid: newTotalPaid,
        remainingAmount: newRemainingAmount,
      })

      await createAppointmentAuditLog({
        appointmentId,
        action: "payment_registered",
        details: {
          paymentAmount,
          paymentMethod: method,
          paymentType,
          totalPaid: newTotalPaid,
          remainingAmount: newRemainingAmount,
        },
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

    paymentType,
    setPaymentType,

    payments,
    summary,

    totalPaid,
    totalPrice,
    remainingAmount,
    effectiveAmount: getPaymentAmount(),

    error,
    loading,
    loadingData,

    handlePayment,
  }
}
