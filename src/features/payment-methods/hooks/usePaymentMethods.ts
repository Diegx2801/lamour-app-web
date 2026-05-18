import { useEffect, useState } from "react"
import {
  fallbackPaymentMethods,
  fetchActivePaymentMethods,
  type PaymentMethodRow,
} from "../api/paymentMethodsService"

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethodRow[]>(fallbackPaymentMethods)
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true)

  useEffect(() => {
    let active = true

    fetchActivePaymentMethods()
      .then((methods) => {
        if (!active) return
        setPaymentMethods(methods)
      })
      .finally(() => {
        if (!active) return
        setLoadingPaymentMethods(false)
      })

    return () => {
      active = false
    }
  }, [])

  return {
    paymentMethods,
    loadingPaymentMethods,
  }
}
