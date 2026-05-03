import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router"
import { supabase } from "../../lib/supabase"

export type AdminRole = "owner" | "staff"

type ProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles?: AdminRole[]
}

function normalizeRole(role: string | null | undefined): AdminRole | null {
  if (role === "admin") return "owner"
  if (role === "owner") return "owner"
  if (role === "staff") return "staff"

  return null
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState<AdminRole | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadAccess = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!isMounted) return

      if (!sessionData.session?.user) {
        setIsAuthenticated(false)
        setRole(null)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionData.session.user.id)
        .single()

      if (!isMounted) return

      setIsAuthenticated(true)
      setRole(normalizeRole(profile?.role))
      setLoading(false)
    }

    loadAccess()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadAccess()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e9]">
        <p className="text-stone-600">Verificando sesión...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (!role) {
    return <Navigate to="/admin/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/admin/agenda" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute