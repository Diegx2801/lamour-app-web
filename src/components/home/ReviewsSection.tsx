import SectionTitle from "../common/SectionTitle"

const reviews = [
  {
    name: "Cliente frecuente",
    text: "La web debe transmitir exactamente lo que se siente en la atención: orden, estilo y confianza.",
  },
  {
    name: "Reserva rápida",
    text: "El objetivo es que la clienta vea el servicio, el precio y reserve sin perder tiempo.",
  },
  {
    name: "Experiencia premium",
    text: "El diseño tiene que verse limpio, elegante y femenino, sin recargar la pantalla.",
  },
]

function ReviewsSection() {
  return (
    <section id="resenas" className="mx-auto max-w-7xl px-6 py-16">
      <SectionTitle
        eyebrow="Reseñas"
        title="La web debe transmitir confianza"
        description="Luego puedes reemplazar estos textos por reseñas reales de clientas."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {reviews.map((review) => (
          <article
            key={review.name}
            className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
          >
            <p className="text-lg tracking-widest text-stone-950">★★★★★</p>
            <p className="mt-4 text-sm leading-7 text-stone-600">“{review.text}”</p>
            <p className="mt-5 font-medium text-stone-900">{review.name}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ReviewsSection