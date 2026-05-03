import { motion } from "framer-motion"
import { Link } from "react-router"

const reviews = [
  {
    name: "Camila R.",
    text: "Resultado natural, elegante y muy bien trabajado.",
  },
  {
    name: "Valeria M.",
    text: "Atención profesional, ambiente cómodo y buen trato.",
  },
  {
    name: "Daniela P.",
    text: "Mis pestañas quedaron como quería. Recomendado.",
  },
]

function ReviewsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-8 text-center md:mb-12"
      >
        <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
          Reseñas
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-stone-950 md:text-5xl">
          Clientas satisfechas
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
          Opiniones breves sobre la experiencia en L’AMOUR.
        </p>
      </motion.div>

      <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        {reviews.map((review, index) => (
          <motion.article
            key={review.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            viewport={{ once: true }}
            className="min-w-[82%] rounded-3xl border border-stone-200 bg-white p-5 shadow-sm md:min-w-0 md:p-6"
          >
            <div className="text-sm text-yellow-400">★★★★★</div>

            <p className="mt-4 text-sm leading-6 text-stone-600">
              “{review.text}”
            </p>

            <p className="mt-5 font-medium text-stone-900">{review.name}</p>
          </motion.article>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          to="/reservar"
          className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Reservar cita
        </Link>
      </div>
    </section>
  )
}

export default ReviewsSection