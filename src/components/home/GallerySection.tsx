import { m } from "framer-motion"
import { Link } from "react-router"
import SectionTitle from "../common/SectionTitle"
import { galleryItems, type GalleryItem } from "../../data/gallery"

function GallerySection() {
  const featuredItems = galleryItems.slice(0, 4)

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20">
      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <SectionTitle
          eyebrow="Galería"
          title="Más resultados de L’AMOUR"
          description="Una muestra breve de nuestros trabajos en pestañas, cejas y faciales."
        />
      </m.div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 md:gap-5 lg:grid-cols-4">
        {featuredItems.map((item: GalleryItem, index: number) => (
          <m.article
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
            viewport={{ once: true }}
            className="group relative aspect-square overflow-hidden rounded-3xl bg-stone-200 md:rounded-[2rem]"
          >
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 text-white">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/75">
                {item.category}
              </p>

              <h3 className="mt-1 line-clamp-1 text-sm font-semibold">
                {item.title}
              </h3>
            </div>
          </m.article>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          to="/servicios"
          className="rounded-full border border-stone-300 bg-white/60 px-6 py-3 text-sm font-medium text-stone-900 transition hover:bg-white"
        >
          Ver servicios
        </Link>
      </div>
    </section>
  )
}

export default GallerySection
