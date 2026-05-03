import { motion } from "framer-motion"
import { Link } from "react-router"

const featuredServices = [
  { title: "Clásicas Rimel", price: "S/ 75", category: "Pestañas" },
  { title: "Volumen Glow", price: "S/ 100", category: "Pestañas" },
  { title: "Pack Cejas Lamour", price: "S/ 35", category: "Cejas" },
  { title: "Facial Profundo", price: "S/ 100", category: "Faciales" },
]

function ServicesPreviewSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
            Servicios
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 md:text-5xl">
            Lo más pedido
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
            Servicios principales para reservar rápido sin recorrer todo el catálogo.
          </p>
        </div>

        <Link
          to="/servicios"
          className="w-fit rounded-full border border-stone-300 bg-white/70 px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-white"
        >
          Ver catálogo
        </Link>
      </motion.div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {featuredServices.map((service, index) => (
          <motion.article
            key={service.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
                  {service.category}
                </p>

                <h3 className="mt-2 text-lg font-semibold text-stone-950">
                  {service.title}
                </h3>
              </div>

              <span className="shrink-0 rounded-full bg-stone-950 px-3 py-1.5 text-xs font-medium text-white">
                {service.price}
              </span>
            </div>

            <Link
              to="/reservar"
              className="mt-4 inline-flex text-sm font-medium text-stone-900 transition hover:text-stone-500"
            >
              Reservar →
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export default ServicesPreviewSection