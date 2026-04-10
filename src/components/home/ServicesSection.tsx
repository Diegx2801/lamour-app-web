import SectionTitle from "../common/SectionTitle"
import ServiceCard from "../common/ServiceCard"
import { categories } from "../../data/services"

function ServicesSection() {
  return (
    <section id="servicios" className="mx-auto max-w-7xl px-6 py-16">
      <SectionTitle
        eyebrow="Servicios"
        title="Catálogo real de L’AMOUR"
        description="La web está pensada para mostrar precios, descripciones y promociones de forma clara. Aquí ya está organizada en las categorías reales del estudio."
      />

      <div className="space-y-14">
        {categories.map((category) => (
          <div key={category.title}>
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-stone-950">
                {category.title}
              </h3>
              {category.subtitle ? (
                <p className="mt-2 text-sm text-stone-600">
                  {category.subtitle}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {category.services.map((service) => (
                <ServiceCard key={service.name} service={service} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection