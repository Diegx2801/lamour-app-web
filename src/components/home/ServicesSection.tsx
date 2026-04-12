import { motion } from "framer-motion"
import SectionTitle from "../common/SectionTitle"
import ServiceCard from "../common/ServiceCard"
import { categories } from "../../data/services"

function ServicesSection() {
  return (
    <section id="servicios" className="mx-auto max-w-7xl px-6 py-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <SectionTitle
          eyebrow="Servicios"
          title="Catálogo real de L’AMOUR"
          description="Cada categoría está organizada para que encuentres fácilmente el servicio ideal según el acabado, el estilo o el resultado que buscas."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
        className="mb-12 grid gap-4 md:grid-cols-4"
      >
        {categories.map((category, index) => (
          <a
            key={category.title}
            href={`#category-${index}`}
            className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm font-medium text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
          >
            {category.title}
          </a>
        ))}
      </motion.div>

      <div className="space-y-16">
        {categories.map((category, index) => (
          <motion.div
            id={`category-${index}`}
            key={category.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: index * 0.04 }}
            viewport={{ once: true }}
            className="scroll-mt-28"
          >
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                  Categoría
                </p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
                  {category.title}
                </h3>
                {category.subtitle ? (
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 md:text-base">
                    {category.subtitle}
                  </p>
                ) : null}
              </div>

              <div className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white w-fit">
                {category.services.length} servicios
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {category.services.map((service, serviceIndex) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: serviceIndex * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection