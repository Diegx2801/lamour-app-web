import { useEffect, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import { supabase } from "../../lib/supabase"

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Agenda", to: "/admin/agenda" },
  { label: "Reservas", to: "/admin/reservas" },
  { label: "Clientes", to: "/admin/clientes" },
  { label: "Servicios", to: "/admin/services" },
  { label: "Seguimiento", to: "/admin/seguimiento" },
]

function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        navigate("/admin/login", { replace: true })
        return
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single()

      if (error || profile?.role !== "admin") {
        await supabase.auth.signOut()
        navigate("/admin/login", { replace: true })
        return
      }

      setCheckingAdmin(false)
    }

    checkAdminRole()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/admin/login")
  }

  if (checkingAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e9] px-4">
        <div className="rounded-[2rem] bg-white p-6 text-sm text-stone-600 shadow-sm">
          Verificando acceso administrativo...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] pb-20 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
              Panel admin
            </p>
            <h1 className="text-lg font-semibold text-stone-950">L’AMOUR</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700"
            >
              Ver web
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-stone-950 px-4 py-2 text-xs font-medium text-white"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-24 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.to

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-stone-950 text-white"
                      : "text-stone-700 hover:bg-white"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 overflow-x-auto border-t border-stone-200 bg-white px-3 py-2 md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`min-w-fit rounded-full px-4 py-2 text-xs font-medium ${
                isActive
                  ? "bg-stone-950 text-white"
                  : "bg-stone-100 text-stone-700"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default AdminLayout