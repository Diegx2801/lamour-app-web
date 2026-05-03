function AboutSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <div className="rounded-[2rem] bg-white/60 p-6 shadow-sm md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
          Sobre L’AMOUR
        </p>

        <div className="mt-4 grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-stone-950 md:text-4xl">
              Cuidado estético personalizado en Trujillo.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
              En L’AMOUR Beauty Studio realizamos servicios de pestañas, cejas y
              faciales con acabados naturales, atención ordenada y reserva online.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-2xl bg-[#e7ddd1] px-4 py-3 text-sm font-medium text-stone-800">
              Atención personalizada
            </div>

            <div className="rounded-2xl bg-[#e7ddd1] px-4 py-3 text-sm font-medium text-stone-800">
              Resultados naturales
            </div>

            <div className="rounded-2xl bg-[#e7ddd1] px-4 py-3 text-sm font-medium text-stone-800">
              Reserva online
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection