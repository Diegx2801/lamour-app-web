function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#f6f1e9]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Trujillo
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            L’AMOUR.
          </h1>
        </div>

        <nav className="hidden md:flex gap-8 text-sm">
          <a href="#inicio">Inicio</a>
          <a href="#servicios">Servicios</a>
          <a href="#promos">Promos</a>
          <a href="#resenas">Reseñas</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <a
          href="https://wa.me/51957230015"
          target="_blank"
          className="bg-black text-white px-5 py-2 rounded-full text-sm"
        >
          Reservar
        </a>
      </div>
    </header>
  )
}

export default Navbar