import { useState } from "react"
import { Link } from "react-router"

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#f6f1e9]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Trujillo
          </p>

          <a
            href="#inicio"
            className="text-2xl font-semibold tracking-tight text-stone-950"
            onClick={closeMenu}
          >
            L’AMOUR.
          </a>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#inicio" className="transition hover:text-stone-500">
            Inicio
          </a>
          <a href="#servicios" className="transition hover:text-stone-500">
            Servicios
          </a>
          <a href="#promos" className="transition hover:text-stone-500">
            Promos
          </a>
          <a href="#resenas" className="transition hover:text-stone-500">
            Reseñas
          </a>
          <a href="#contacto" className="transition hover:text-stone-500">
            Contacto
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/reservar"
            className="hidden rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 md:inline-block"
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
            <a href="#inicio" onClick={closeMenu} className="transition hover:text-stone-500">
              Inicio
            </a>
            <a href="#servicios" onClick={closeMenu} className="transition hover:text-stone-500">
              Servicios
            </a>
            <a href="#promos" onClick={closeMenu} className="transition hover:text-stone-500">
              Promos
            </a>
            <a href="#resenas" onClick={closeMenu} className="transition hover:text-stone-500">
              Reseñas
            </a>
            <a href="#contacto" onClick={closeMenu} className="transition hover:text-stone-500">
              Contacto
            </a>

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