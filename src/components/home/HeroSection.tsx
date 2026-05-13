import { useEffect, useMemo, useState } from "react"
import { m } from "framer-motion"
import { Link } from "react-router"
import { galleryItems } from "../../data/gallery"
import type { SiteContentItem } from "../../features/site-content/api/siteContentService"
import { usePublicSiteContent } from "../../features/site-content/hooks/usePublicSiteContent"

function HeroSection() {
  const fallbackHeroImages = useMemo<SiteContentItem[]>(
    () =>
      galleryItems.slice(0, 6).map((item, index) => ({
        id: String(item.id),
        section: "hero",
        title: "Resultados naturales con atencion personalizada.",
        subtitle:
          "Servicios pensados para que reserves rapido y recibas una atencion ordenada.",
        category: item.category,
        image_url: item.image,
        is_active: true,
        sort_order: index,
      })),
    []
  )
  const heroImages = usePublicSiteContent("hero", fallbackHeroImages)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (heroImages.length <= 1) return

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroImages.length)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [heroImages.length])

  const safeActiveIndex =
    heroImages.length === 0 ? 0 : Math.min(activeIndex, heroImages.length - 1)
  const activeItem = heroImages[safeActiveIndex]

  const goToPrevious = () => {
    if (heroImages.length === 0) return
    setActiveIndex((current) =>
      current === 0 ? heroImages.length - 1 : current - 1
    )
  }

  const goToNext = () => {
    if (heroImages.length === 0) return
    setActiveIndex((current) => (current + 1) % heroImages.length)
  }

  return (
    <m.section
      id="inicio"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 md:pb-20 md:pt-10"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
        <m.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="order-2 max-w-2xl lg:order-1"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500 md:text-sm">
            Cejas · Pestanas · Faciales
          </p>

          <h1 className="mt-4 text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl md:text-6xl">
            Belleza elegante, lista para reservar.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-stone-600 md:mt-6">
            Agenda tu cita en L'AMOUR Beauty Studio y elige el servicio ideal
            para realzar tu imagen con una atencion personalizada.
          </p>

          <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              to="/reservar"
              className="rounded-full bg-stone-950 px-6 py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
            >
              Reservar cita
            </Link>

            <Link
              to="/servicios"
              className="rounded-full border border-stone-300 bg-white/60 px-6 py-3 text-center text-sm font-medium text-stone-900 transition hover:bg-white"
            >
              Ver servicios
            </Link>
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="order-1 overflow-hidden rounded-[2rem] bg-stone-200 shadow-sm md:rounded-[2.5rem] lg:order-2"
        >
          <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/8]">
            {activeItem ? (
              <div className="absolute inset-0 overflow-hidden bg-stone-200">
                <img
                  src={activeItem.image_url}
                  alt={activeItem.title}
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-stone-950/30" />
              </div>
            ) : null}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/65 via-black/20 to-transparent p-5 text-white sm:p-6 md:p-7">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/75 md:text-xs">
                {activeItem?.category ?? "L'AMOUR"}
              </p>

              <h2 className="mt-2 max-w-xl text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
                {activeItem?.title ??
                  "Resultados naturales con atencion personalizada."}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                {activeItem?.subtitle ??
                  "Servicios pensados para que reserves rapido y recibas una atencion ordenada."}
              </p>
            </div>

            {heroImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrevious}
                  aria-label="Foto anterior"
                  className="absolute left-4 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg font-semibold text-stone-900 shadow-sm transition hover:bg-white md:flex"
                >
                  &lsaquo;
                </button>

                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Siguiente foto"
                  className="absolute right-4 top-1/2 z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg font-semibold text-stone-900 shadow-sm transition hover:bg-white md:flex"
                >
                  &rsaquo;
                </button>
              </>
            )}

            {heroImages.length > 1 && (
              <div className="absolute bottom-4 right-4 z-30 flex gap-2">
                {heroImages.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Ver imagen ${index + 1}`}
                    className={`h-2 rounded-full transition ${
                      index === safeActiveIndex
                        ? "w-6 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </m.div>
      </div>
    </m.section>
  )
}

export default HeroSection
