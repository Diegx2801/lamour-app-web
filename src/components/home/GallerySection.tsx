import { useMemo } from "react"
import { m } from "framer-motion"
import { Link } from "react-router"
import SectionTitle from "../common/SectionTitle"
import { galleryItems } from "../../data/gallery"
import type { SiteContentItem } from "../../features/site-content/api/siteContentService"
import { usePublicSiteContent } from "../../features/site-content/hooks/usePublicSiteContent"

function GallerySection() {
  const fallbackGalleryItems = useMemo<SiteContentItem[]>(
    () =>
      galleryItems.slice(0, 4).map((item, index) => ({
        id: String(item.id),
        section: "gallery",
        title: item.title,
        subtitle: null,
        category: item.category,
        image_url: item.image,
        is_active: true,
        sort_order: index,
      })),
    []
  )
  const featuredItems = usePublicSiteContent("gallery", fallbackGalleryItems)

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
        {featuredItems.slice(0, 8).map((item, index) => (
          <m.article
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.04 }}
            viewport={{ once: true }}
            className="group relative aspect-square overflow-hidden rounded-3xl bg-stone-200 md:rounded-[2rem]"
          >
            <img
              src={item.image_url}
              alt={item.title}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 text-white">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/75">
                {item.category ?? "L’AMOUR"}
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
