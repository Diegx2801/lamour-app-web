import { motion } from "framer-motion"

const reviews = [
  {
    name: "Camila R.",
    text: "Me encantó el resultado, súper natural y elegante. Definitivamente vuelvo.",
  },
  {
    name: "Valeria M.",
    text: "La atención es increíble y el ambiente es hermoso. Todo muy profesional.",
  },
  {
    name: "Daniela P.",
    text: "Mis pestañas quedaron perfectas, justo como quería. 100% recomendado.",
  },
]

function ReviewsSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
          Reseñas
        </p>

        <h2 className="mt-3 text-3xl font-semibold text-stone-950 md:text-5xl">
          Lo que dicen nuestras clientas
        </h2>

        <p className="mt-4 text-sm text-stone-600">
          Experiencias reales que reflejan la calidad de nuestro servicio.
        </p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        {reviews.map((review, index) => (
          <motion.article
            key={review.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#eadfd3] blur-2xl" />

            <div className="relative z-10">
              <div className="flex gap-1 text-yellow-400">★★★★★</div>

              <p className="mt-4 text-sm leading-7 text-stone-600">
                “{review.text}”
              </p>

              <p className="mt-6 font-medium text-stone-900">
                {review.name}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export default ReviewsSection