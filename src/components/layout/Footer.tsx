function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#f3ece3]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              L’AMOUR
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-stone-950">
              Beauty Studio
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-stone-600">
              Cejas, pestañas, faciales y depilación en un espacio pensado para
              una experiencia elegante, simple y cercana.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-stone-900">Enlaces</p>
            <ul className="mt-4 space-y-3 text-sm text-stone-600">
              <li>
                <a href="#inicio" className="transition hover:text-stone-950">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#servicios" className="transition hover:text-stone-950">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#promos" className="transition hover:text-stone-950">
                  Promociones
                </a>
              </li>
              <li>
                <a href="#contacto" className="transition hover:text-stone-950">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-stone-900">Contacto</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-stone-600">
              <p>Av. Los Ángeles 329, Trujillo</p>
              <p>957 230 015</p>
              <p>@lamour.bs</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://wa.me/51957230015"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white"
              >
                WhatsApp
              </a>

              <a
                href="https://instagram.com/lamour.bs"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-stone-200 pt-5 text-center text-sm text-stone-500">
          © 2026 L’AMOUR Beauty Studio. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

export default Footer