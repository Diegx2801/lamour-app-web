import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { supabase } from "../lib/supabase"

export function useAdminAuth() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        navigate("/")
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single()

      if (error || data?.role !== "admin") {
        navigate("/")
        return
      }

      setLoading(false)
    }

    checkAdmin()
  }, [])

  return { loading }
}