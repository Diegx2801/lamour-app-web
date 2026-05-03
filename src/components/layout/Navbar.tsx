import { useState } from "react"
import { Link } from "react-router"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#f6f1e9]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:py-4">
        <Link to="/" onClick={closeMenu} className="flex flex-col">
          <span className="text-[9px] uppercase tracking-[0.35em] text-stone-500">
            Trujillo
          </span>
          <span className="mt-0.5 text-xl font-semibold tracking-[0.16em] text-stone-950 md:text-2xl">
            L’AMOUR
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-stone-800 md:flex">
          <Link to="/" className="transition hover:text-stone-500">
            Inicio
          </Link>
          <Link to="/servicios" className="transition hover:text-stone-500">
            Servicios
          </Link>
          <Link to="/reservar" className="transition hover:text-stone-500">
            Reservas
          </Link>
          <a href="#contacto" className="transition hover:text-stone-500">
            Contacto
          </a>
          <Link
            to="/admin/login"
            className="text-stone-500 transition hover:text-stone-900"
          >
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/reservar"
            className="hidden rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-sm md:inline-block"
          >
            Reservar cita
          </Link>

          <button
            type="button"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-900 transition hover:bg-stone-100 md:hidden"
          >
            <span className="text-lg leading-none">{isOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-stone-200 bg-[#f6f1e9] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-sm font-medium text-stone-800">
            <Link
              to="/"
              onClick={closeMenu}
              className="rounded-2xl px-4 py-3 transition hover:bg-white"
            >
              Inicio
            </Link>

            <Link
              to="/servicios"
              onClick={closeMenu}
              className="rounded-2xl px-4 py-3 transition hover:bg-white"
            >
              Servicios
            </Link>

            <Link
              to="/reservar"
              onClick={closeMenu}
              className="rounded-2xl px-4 py-3 transition hover:bg-white"
            >
              Reservas
            </Link>

            <Link
              to="/admin/login"
              onClick={closeMenu}
              className="rounded-2xl px-4 py-3 text-stone-500 transition hover:bg-white hover:text-stone-900"
            >
              Admin
            </Link>

            <Link
              to="/reservar"
              onClick={closeMenu}
              className="mt-3 rounded-full bg-stone-950 px-5 py-3 text-center text-sm font-medium text-white"
            >
              Reservar cita
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar