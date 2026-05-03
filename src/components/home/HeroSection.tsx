import { motion } from "framer-motion"
import { Link } from "react-router"

function HeroSection() {
  return (
    <motion.section
      id="inicio"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:items-center md:py-20"
    >
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-xl"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-stone-500 md:text-sm">
          Cejas · Pestañas · Faciales
        </p>

        <h1 className="mt-4 text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl md:text-6xl">
          Belleza elegante, lista para reservar.
        </h1>

        <p className="mt-4 max-w-md text-base leading-7 text-stone-600 md:mt-6">
          Agenda tu cita en L’AMOUR Beauty Studio y elige el servicio ideal para
          realzar tu imagen con una atención personalizada.
        </p>

        <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
          <Link
            to="/reservar"
            className="rounded-full bg-stone-950 px-6 py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
          >
            Reservar cita
          </Link>

          <Link
            to="/servicios"
            className="rounded-full border border-stone-300 bg-white/50 px-6 py-3 text-center text-sm font-medium text-stone-900 transition hover:bg-white"
          >
            Ver servicios
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative overflow-hidden rounded-[1.75rem] bg-[#e7ddd1] p-5 md:rounded-[2rem] md:p-8"
      >
        <div className="absolute right-4 top-4 h-32 w-32 rounded-full bg-white/40 blur-3xl md:right-10 md:top-10 md:h-40 md:w-40" />

        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-600">
            Experiencia
          </p>

          <h2 className="mt-3 text-2xl font-semibold leading-snug text-stone-950 md:text-3xl">
            Resultados naturales y atención cuidada.
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-stone-600">
            Servicios de belleza pensados para que reserves rápido, confirmes tu
            cita y recibas una atención ordenada.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-stone-500">Reserva</p>
              <p className="mt-1 text-lg font-semibold text-stone-950">
                Online
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs text-stone-500">Atención</p>
              <p className="mt-1 text-lg font-semibold text-stone-950">
                Personalizada
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}

export default HeroSection