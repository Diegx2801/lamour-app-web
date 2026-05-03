import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { supabase } from "../lib/supabase"

type AdminRole = "owner" | "staff"

function normalizeRole(role: string | null | undefined): AdminRole | null {
  if (role === "admin") return "owner"
  if (role === "owner") return "owner"
  if (role === "staff") return "staff"

  return null
}

export function useAdminAuth(allowedRoles?: AdminRole[]) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<AdminRole | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        navigate("/admin/login", { replace: true })
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single()

      if (error) {
        navigate("/admin/login", { replace: true })
        return
      }

      const normalizedRole = normalizeRole(data?.role)

      if (!normalizedRole) {
        navigate("/admin/login", { replace: true })
        return
      }

      if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
        navigate("/admin/agenda", { replace: true })
        return
      }

      setRole(normalizedRole)
      setLoading(false)
    }

    checkAdmin()
  }, [allowedRoles, navigate])

  return {
    loading,
    role,
    isOwner: role === "owner",
    isStaff: role === "staff",
  }
}