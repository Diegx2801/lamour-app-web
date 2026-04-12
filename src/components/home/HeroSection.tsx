import { motion } from "framer-motion"
import { Link } from "react-router"

function HeroSection() {
  return (
    <motion.section
      id="inicio"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2"
    >
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">
          Cejas · Pestañas · Faciales
        </p>

        <h1 className="mt-5 text-5xl font-semibold leading-tight md:text-6xl">
          Belleza simple, elegante y lista para reservar.
        </h1>

        <p className="mt-6 text-stone-600">
          L’AMOUR Beauty Studio ofrece una experiencia visual limpia y moderna
          para descubrir servicios, reservar fácilmente y vivir una atención premium.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/reservar"
            className="rounded-full bg-black px-6 py-3 text-white transition hover:opacity-90"
          >
            Reservar ahora
          </Link>

          <Link
            to="/servicios"
            className="rounded-full border border-stone-300 px-6 py-3 text-stone-900 transition hover:bg-white"
          >
            Ver servicios
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-[2rem] bg-[#e7ddd1]" />

        <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-white/40 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between rounded-[2rem] p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-600">
              Experiencia
            </p>

            <h3 className="mt-3 text-2xl font-semibold text-stone-950">
              Resultados que elevan tu imagen
            </h3>

            <p className="mt-3 text-sm text-stone-600">
              Técnicas modernas, acabados naturales y atención personalizada en cada sesión.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="rounded-xl bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-stone-500">Clientes felices</p>
              <p className="mt-1 text-xl font-semibold">+500</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="rounded-xl bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-stone-500">Servicios</p>
              <p className="mt-1 text-xl font-semibold">Premium</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}

export default HeroSection