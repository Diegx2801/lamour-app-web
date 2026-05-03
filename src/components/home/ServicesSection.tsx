import { motion } from "framer-motion"
import { useState } from "react"
import SectionTitle from "../common/SectionTitle"
import ServiceCard from "../common/ServiceCard"
import { categories } from "../../data/services"

function ServicesSection() {
  const [activeCategory, setActiveCategory] = useState(0)

  const handleCategoryClick = (index: number) => {
    setActiveCategory(index)

    const element = document.getElementById(`category-${index}`)
    element?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return (
    <section
      id="servicios"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <SectionTitle
          eyebrow="Servicios"
          title="Catálogo"
          description="Elige el servicio ideal según el resultado que buscas."
        />
      </motion.div>

      <div className="mt-6 rounded-[2rem] border border-stone-200 bg-white/60 p-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto md:grid md:grid-cols-5 md:gap-3 md:overflow-visible">
          {categories.map((category, index) => {
            const isActive = activeCategory === index

            return (
              <button
                key={category.title}
                type="button"
                onClick={() => handleCategoryClick(index)}
                className={`flex min-w-fit items-center justify-center rounded-full px-5 py-2.5 text-center text-xs font-medium transition md:min-w-0 ${
                  isActive
                    ? "bg-[#e7ddd1] text-stone-950 shadow-sm"
                    : "bg-white text-stone-700 hover:bg-[#f3ece4] hover:text-stone-950"
                }`}
              >
                {category.title}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-10 space-y-12 md:space-y-16">
        {categories.map((category, index) => (
          <div
  id={`category-${index}`}
  key={category.title}
  className="scroll-mt-24"
>
            <div className="mb-6 flex flex-col gap-2 border-b border-stone-200 pb-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                  Categoría
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-stone-950 md:text-3xl">
                  {category.title}
                </h3>
              </div>

              <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-medium text-stone-500">
                {category.services.length} servicios
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {category.services.map((service, serviceIndex) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: serviceIndex * 0.03 }}
                  viewport={{ once: true }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))}
            </div>
       </div>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection