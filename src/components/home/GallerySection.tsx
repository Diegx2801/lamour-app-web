import SectionTitle from "../common/SectionTitle"
import galleryItems from "../../data/gallery"
function GallerySection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <SectionTitle
        eyebrow="Galería"
        title="Resultados reales de L’AMOUR"
        description="Esta sección muestra trabajos, resultados y contenido visual del estudio. Más adelante puedes seguir agregando imágenes sin tocar toda la estructura."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-[2rem] bg-white shadow-sm"
          >
            <div className="relative aspect-[4/4] overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/80">
                  {item.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {item.title}
                </h3>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default GallerySection