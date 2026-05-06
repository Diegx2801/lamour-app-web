import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router"
import {
  fetchActivePromos,
  type PromoRow,
} from "../../features/promos/api/promoService"

function PromosSection() {
  const [promos, setPromos] = useState<PromoRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPromos = async () => {
      try {
        const data = await fetchActivePromos()
        setPromos(data)
      } catch (error) {
        console.error("Error cargando promociones:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPromos()
  }, [])

  if (!loading && promos.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-10 text-center md:mb-12"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
          Promociones
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-stone-950 md:text-5xl">
          Promos especiales para ti
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-stone-600">
          Packs y campañas especiales disponibles por temporada en L’AMOUR
          Beauty Studio.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-[2rem] bg-stone-200"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo, index) => (
            <motion.article
              key={promo.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {promo.image_url ? (
  <div className="relative flex h-64 items-center justify-center overflow-hidden bg-stone-100">
    <img
      src={promo.image_url}
      alt={promo.title}
      className="h-full w-full object-contain bg-stone-100 p-2 transition duration-300"
    />

    <div className="absolute left-4 top-4">
      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-wide text-stone-800 shadow-sm">
        {promo.tag || "Promo"}
      </span>
    </div>
  </div>
) : (
                <div className="relative flex h-56 items-center justify-center bg-[#eadfd2] px-6 text-center">
                  <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-stone-800">
                    {promo.tag || "Promo"}
                  </span>

                  <p className="text-2xl font-semibold text-stone-900">
                    L’AMOUR Beauty Studio
                  </p>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-2xl font-semibold leading-tight text-stone-950">
                  {promo.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {promo.description}
                </p>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="text-xl font-semibold text-stone-950">
                    {promo.price}
                  </span>

                  <Link
                    to="/reservar"
                    className="rounded-full bg-stone-950 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Reservar
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  )
}

export default PromosSection