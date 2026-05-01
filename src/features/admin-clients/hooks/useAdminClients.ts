import { useEffect, useMemo, useState } from "react"
import {
  fetchClients,
  updateClient,
  deactivateClient,
  activateClient,
  type ClientRow,
} from "../api/adminClientsService"

export function useAdminClients() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const loadClients = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await fetchClients()
      setClients(data)
    } catch {
      setError("Error cargando clientes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const text = `${c.full_name ?? ""} ${c.phone ?? ""}`.toLowerCase()
      return text.includes(search.toLowerCase())
    })
  }, [clients, search])

  return {
    clients: filteredClients,
    loading,
    error,
    search,
    setSearch,
    reload: loadClients,
    updateClient,
    deactivateClient,
    activateClient,
  }
}