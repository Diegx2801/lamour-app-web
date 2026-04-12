import { Link } from "react-router"

function ContactSection() {
  return (
    <section
      id="contacto"
      className="mx-auto max-w-7xl px-6 pb-20 pt-10"
    >
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
          Contacto
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-stone-950 md:text-5xl">
          Agenda tu experiencia L’AMOUR
        </h2>

        <p className="mt-4 text-sm text-stone-600">
          Estamos listas para atenderte y ayudarte a elegir el servicio ideal.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#eadfd3] blur-2xl" />

          <div className="relative z-10">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-stone-500">
              Información
            </p>

            <div className="mt-8 space-y-5 text-sm leading-7 text-stone-700">
              <div>
                <p className="font-semibold text-stone-900">Dirección</p>
                <p>Av. Los Ángeles 329, Trujillo</p>
              </div>

              <div>
                <p className="font-semibold text-stone-900">WhatsApp</p>
                <p>957 230 015</p>
              </div>

              <div>
                <p className="font-semibold text-stone-900">Instagram</p>
                <p>@lamour.bs</p>
              </div>

              <div>
                <p className="font-semibold text-stone-900">Atención</p>
                <p>Previa reserva o coordinación</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://wa.me/51957230015"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Escribir por WhatsApp
              </a>

              <a
                href="https://instagram.com/lamour.bs"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
              >
                Ver Instagram
              </a>

              <Link
                to="/reservar"
                className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
              >
                Reservar online
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <iframe
            src="https://www.google.com/maps?q=Av.+Los+Ángeles+329+Trujillo&output=embed"
            width="100%"
            height="100%"
            className="min-h-[380px] w-full border-0"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  )
}

export default ContactSection