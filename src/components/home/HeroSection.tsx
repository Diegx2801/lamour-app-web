function HeroSection() {
  return (
    <section
      id="inicio"
      className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 gap-10"
    >
      <div>
        <p className="uppercase text-sm tracking-[0.3em] text-stone-500">
          Cejas · Pestañas · Faciales
        </p>

        <h1 className="mt-5 text-5xl md:text-6xl font-semibold leading-tight">
          Belleza simple, elegante y lista para reservar.
        </h1>

        <p className="mt-6 text-stone-600">
          L’AMOUR Beauty Studio ofrece una experiencia visual limpia y
          moderna para ver servicios, precios y reservar fácilmente.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="https://wa.me/51957230015"
            className="bg-black text-white px-6 py-3 rounded-full"
          >
            Reservar ahora
          </a>

          <a
            href="#servicios"
            className="border px-6 py-3 rounded-full"
          >
            Ver servicios
          </a>
        </div>
      </div>

      <div className="bg-[#e7ddd1] rounded-3xl p-10 flex items-end">
        <p className="text-xl font-medium">
          Estética premium minimalista tipo Fresha
        </p>
      </div>
    </section>
  )
}

export default HeroSection