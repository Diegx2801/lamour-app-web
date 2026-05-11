import { useEffect, useMemo, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router"
import { supabase } from "../../lib/supabase"
import type { AdminRole } from "../auth/ProtectedRoute"

type NavItem = {
  label: string
  to: string
  roles: AdminRole[]
  match?: string
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    roles: ["owner"],
  },
  {
    label: "Agenda",
    to: "/admin/agenda",
    roles: ["owner", "staff"],
  },
  {
    label: "Reservas",
    to: "/admin/reservas",
    roles: ["owner", "staff"],
    match: "/admin/reservas",
  },
  {
    label: "Clientes",
    to: "/admin/clientes",
    roles: ["owner"],
  },
  {
    label: "Caja",
    to: "/admin/caja",
    roles: ["owner"],
  },
  {
    label: "Servicios",
    to: "/admin/services",
    roles: ["owner"],
  },
  {
    label: "Lashistas",
    to: "/admin/lashistas",
    roles: ["owner"],
  },
  {
    label: "Seguimiento",
    to: "/admin/seguimiento",
    roles: ["owner", "staff"],
  },
  {
    label: "Promos",
    to: "/admin/promos",
    roles: ["owner"],
  }
]

function normalizeRole(role: string | null | undefined): AdminRole | null {
  if (role === "admin") return "owner"
  if (role === "owner") return "owner"
  if (role === "staff") return "staff"

  return null
}

function isActiveRoute(pathname: string, item: NavItem) {
  if (item.to === "/admin/reservas") {
    return pathname.startsWith("/admin/reservas") || pathname === "/admin/crear"
  }

  if (item.match) {
    return pathname.startsWith(item.match)
  }

  return pathname === item.to
}

function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [checkingAccess, setCheckingAccess] = useState(true)
  const [role, setRole] = useState<AdminRole | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
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

      if (error) {
        await supabase.auth.signOut()
        navigate("/admin/login", { replace: true })
        return
      }

      const normalizedRole = normalizeRole(profile?.role)

      if (!normalizedRole) {
        await supabase.auth.signOut()
        navigate("/admin/login", { replace: true })
        return
      }

      setRole(normalizedRole)
      setCheckingAccess(false)
    }

    checkAccess()
  }, [navigate])

  const visibleNavItems = useMemo(() => {
    if (!role) return []

    return navItems.filter((item) => item.roles.includes(role))
  }, [role])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/admin/login")
  }

  if (checkingAccess) {
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

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-stone-950">
                L’AMOUR
              </h1>

              <span className="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">
                {role === "owner" ? "Owner" : "Staff"}
              </span>
            </div>
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
            {visibleNavItems.map((item) => {
              const isActive = isActiveRoute(pathname, item)

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

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 overflow-x-auto border-t border-stone-200 bg-white px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden">
        {visibleNavItems.map((item) => {
          const isActive = isActiveRoute(pathname, item)

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
