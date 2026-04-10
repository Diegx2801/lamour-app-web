import { Link } from "react-router"

function HeroSection() {
  return (
    <section
      id="inicio"
      className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2"
    >
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">
          Cejas · Pestañas · Faciales
        </p>

        <h1 className="mt-5 text-5xl font-semibold leading-tight md:text-6xl">
          Belleza simple, elegante y lista para reservar.
        </h1>

        <p className="mt-6 text-stone-600">
          L’AMOUR Beauty Studio ofrece una experiencia visual limpia y
          moderna para ver servicios, precios y reservar fácilmente.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            to="/reservar"
            className="rounded-full bg-black px-6 py-3 text-white"
          >
            Reservar ahora
          </Link>

          <a
            href="#servicios"
            className="rounded-full border px-6 py-3"
          >
            Ver servicios
          </a>
        </div>
      </div>

      <div className="flex items-end rounded-3xl bg-[#e7ddd1] p-10">
        <p className="text-xl font-medium">
          Estética premium minimalista tipo Fresha
        </p>
      </div>
    </section>
  )
}

export default HeroSection