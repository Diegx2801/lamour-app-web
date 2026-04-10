function AboutSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        
        {/* TEXTO */}
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Sobre L’AMOUR
          </p>

          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-stone-950">
            Más que un servicio, una experiencia de cuidado personal.
          </h2>

          <p className="mt-6 text-stone-600 leading-7">
            En L’AMOUR Beauty Studio nos enfocamos en resaltar la belleza natural 
            de cada clienta a través de técnicas modernas en pestañas, cejas, 
            faciales y depilación. Cada atención está pensada para brindar un 
            resultado limpio, elegante y personalizado.
          </p>

          <p className="mt-4 text-stone-600 leading-7">
            Nuestro enfoque combina estética, precisión y una experiencia cómoda, 
            donde cada detalle está cuidado para que te sientas segura y satisfecha 
            con el resultado.
          </p>

          <div className="mt-8 flex gap-4">
            <a
              href="https://wa.me/51957230015"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white"
            >
              Reservar cita
            </a>

            <a
              href="#servicios"
              className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800"
            >
              Ver servicios
            </a>
          </div>
        </div>

        {/* VISUAL */}
        <div className="grid gap-4">
          <div className="rounded-[2rem] bg-[#e7ddd1] p-10 flex items-end">
            <p className="text-xl font-medium text-stone-800">
              Estética minimalista, moderna y femenina.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-stone-500">
              Valores
            </p>

            <ul className="mt-4 space-y-3 text-sm text-stone-700">
              <li>• Atención personalizada</li>
              <li>• Resultados naturales y elegantes</li>
              <li>• Técnicas modernas</li>
              <li>• Experiencia cómoda y profesional</li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  )
}

export default AboutSection