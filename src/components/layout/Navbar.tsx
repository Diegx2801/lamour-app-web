import { useState } from "react"
import { Link } from "react-router"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#f6f1e9]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.45em] text-stone-500">
            Trujillo
          </p>

          <Link
            to="/"
            onClick={closeMenu}
            className="mt-1 text-2xl font-semibold tracking-[0.18em] text-stone-950 transition hover:opacity-80"
          >
            L’AMOUR
          </Link>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
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

        <div className="flex items-center gap-3">
          <Link
            to="/reservar"
            className="hidden rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:shadow-sm md:inline-block"
          >
            Reservar ahora
          </Link>

          <button
            type="button"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-900 transition hover:bg-stone-100 md:hidden"
          >
            <span className="text-xl leading-none">{isOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-stone-200 bg-[#f6f1e9] px-6 py-5 md:hidden">
          <nav className="flex flex-col gap-4 text-sm font-medium text-stone-800">
            <Link to="/" onClick={closeMenu} className="transition hover:text-stone-500">
              Inicio
            </Link>

            <Link
              to="/servicios"
              onClick={closeMenu}
              className="transition hover:text-stone-500"
            >
              Servicios
            </Link>

            <Link
              to="/reservar"
              onClick={closeMenu}
              className="transition hover:text-stone-500"
            >
              Reservas
            </Link>

            <a
              href="#contacto"
              onClick={closeMenu}
              className="transition hover:text-stone-500"
            >
              Contacto
            </a>

            <Link
              to="/admin/login"
              onClick={closeMenu}
              className="transition hover:text-stone-500"
            >
              Admin
            </Link>

            <Link
              to="/reservar"
              onClick={closeMenu}
              className="mt-2 inline-block rounded-full bg-stone-950 px-5 py-3 text-center text-sm font-medium text-white"
            >
              Reservar ahora
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar