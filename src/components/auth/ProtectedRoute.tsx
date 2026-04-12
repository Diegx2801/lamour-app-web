import { useEffect, useState } from "react"
import { Navigate } from "react-router"
import { supabase } from "../../lib/supabase"

type ProtectedRouteProps = {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
      setLoading(false)
    }

    checkSession()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f1e9]">
        <p className="text-stone-600">Verificando sesión...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute