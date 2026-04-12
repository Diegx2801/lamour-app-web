import { motion } from "framer-motion"
import { Link } from "react-router"

const featuredServices = [
  {
    title: "Clásicas Rimel",
    price: "S/ 75",
    category: "Pestañas",
    description:
      "Efecto definido y elegante para realzar tu mirada con un acabado natural.",
  },
  {
    title: "Volumen Glow",
    price: "S/ 100",
    category: "Pestañas",
    description:
      "Mayor densidad, presencia y un look más impactante sin perder delicadeza.",
  },
  {
    title: "Pack Cejas Lamour",
    price: "S/ 35",
    category: "Cejas",
    description:
      "Diseño, depilación y planchado para una ceja limpia, prolija y estilizada.",
  },
  {
    title: "Facial Profundo",
    price: "S/ 100",
    category: "Faciales",
    description:
      "Limpieza profunda, extracción e hidratación para revitalizar el rostro.",
  },
]

function ServicesPreviewSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Servicios destacados
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 md:text-5xl">
            Lo más pedido en L’AMOUR
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
            Una selección pensada para que la clienta vea rápido lo más atractivo,
            conecte con la marca y luego explore el catálogo completo.
          </p>
        </div>

        <Link
          to="/servicios"
          className="inline-flex w-fit items-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-900 transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          Ver catálogo completo
        </Link>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {featuredServices.map((service, index) => (
          <motion.article
            key={service.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#eadfd3] blur-2xl transition duration-300 group-hover:scale-125" />

            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                {service.category}
              </p>

              <h3 className="mt-3 text-2xl font-semibold text-stone-950">
                {service.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                {service.description}
              </p>

              <div className="mt-6 flex items-center justify-between">
                <span className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white">
                  {service.price}
                </span>

                <Link
                  to="/reservar"
                  className="text-sm font-medium text-stone-900 transition hover:text-stone-500"
                >
                  Reservar →
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export default ServicesPreviewSection