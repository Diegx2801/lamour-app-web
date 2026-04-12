import { motion } from "framer-motion"
import { Link } from "react-router"

const promos = [
  {
    title: "Pack Makeup no-Makeup",
    price: "S/ 120",
    description:
      "Extensiones clásicas rimel marrón + laminado de cejas para un look natural perfecto.",
  },
  {
    title: "Ojos de Amor",
    price: "S/ 100",
    description:
      "Extensiones clásicas rimel + pack de cejas L’amour para resaltar tu mirada.",
  },
  {
    title: "Pack L’amour is Glow",
    price: "S/ 130",
    description:
      "Extensiones volumen glow + laminado de cejas para un acabado luminoso.",
  },
]

function PromosSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
          Promociones
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-stone-950 md:text-5xl">
          Packs que debes aprovechar
        </h2>

        <p className="mt-4 text-sm text-stone-600">
          Promociones diseñadas para potenciar tu imagen con el mejor precio.
        </p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        {promos.map((promo, index) => (
          <motion.article
            key={promo.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-[2rem] bg-black p-6 text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />

            <span className="relative z-10 inline-block rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-wide">
              Promo
            </span>

            <h3 className="relative z-10 mt-4 text-2xl font-semibold">
              {promo.title}
            </h3>

            <p className="relative z-10 mt-3 text-sm text-white/80">
              {promo.description}
            </p>

            <div className="relative z-10 mt-6 flex items-center justify-between">
              <span className="text-xl font-semibold">{promo.price}</span>

              <Link
                to="/reservar"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
              >
                Reservar
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export default PromosSection