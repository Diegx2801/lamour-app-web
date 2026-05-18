import { useEffect, useReducer } from "react"
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
  if (role === "followup") return "staff"

  return null
}

type AccessState = {
  loading: boolean
  isAuthenticated: boolean
  role: AdminRole | null
}

type AccessAction =
  | { type: "authenticated"; role: AdminRole | null }
  | { type: "unauthenticated" }

const initialAccessState: AccessState = {
  loading: true,
  isAuthenticated: false,
  role: null,
}

function accessReducer(
  state: AccessState,
  action: AccessAction
): AccessState {
  switch (action.type) {
    case "authenticated":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        role: action.role,
      }
    case "unauthenticated":
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        role: null,
      }
    default:
      return state
  }
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const [{ loading, isAuthenticated, role }, dispatch] = useReducer(
    accessReducer,
    initialAccessState
  )

  useEffect(() => {
    let isMounted = true

    const loadAccess = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!isMounted) return

      if (!sessionData.session?.user) {
        dispatch({ type: "unauthenticated" })
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", sessionData.session.user.id)
        .single()

      if (!isMounted) return

      dispatch({
        type: "authenticated",
        role: profile?.is_active === false ? null : normalizeRole(profile?.role),
      })
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
