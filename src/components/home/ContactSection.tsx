function ContactSection() {
  return (
    <section id="contacto" className="mx-auto max-w-7xl px-6 pb-20 pt-8">
      <div className="grid gap-6 md:grid-cols-2">

        {/* IZQUIERDA - INFO */}
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Contáctanos
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-stone-950">
            Reserva o consulta directamente
          </h2>

          <div className="mt-8 space-y-4 text-sm leading-7 text-stone-700">
            <p>
              <span className="font-semibold text-stone-900">Dirección:</span>{" "}
              Av. Los Ángeles 329 (al costado de Barbarian)
            </p>

            <p>
              <span className="font-semibold text-stone-900">WhatsApp:</span>{" "}
              957 230 015
            </p>

            <p>
              <span className="font-semibold text-stone-900">Instagram:</span>{" "}
              @lamour.bs
            </p>

            <p>
              <span className="font-semibold text-stone-900">Ciudad:</span>{" "}
              Trujillo
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="https://wa.me/51957230015"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Ir a WhatsApp
            </a>

            <a
              href="https://instagram.com/lamour.bs"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-100"
            >
              Ver Instagram
            </a>

            <a
              href="https://maps.app.goo.gl/D26AhbnPBhXwTqmP9"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-100"
            >
              Cómo llegar
            </a>
          </div>
        </div>

        {/* DERECHA - MAPA */}
        <div className="rounded-[2rem] overflow-hidden shadow-sm">
          <iframe
            src="https://www.google.com/maps?q=Av.+Los+Ángeles+329+Trujillo&output=embed"
            width="100%"
            height="100%"
            className="min-h-[300px] md:min-h-full border-0"
            loading="lazy"
          ></iframe>
        </div>

      </div>
    </section>
  )
}

export default ContactSection