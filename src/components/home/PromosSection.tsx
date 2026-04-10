import SectionTitle from "../common/SectionTitle"
import { promos } from "../../data/promos"

function PromosSection() {
  return (
    <section id="promos" className="mx-auto max-w-7xl px-6 py-16">
      <SectionTitle
        eyebrow="Promociones"
        title="Packs que deben vender rápido"
        description="Estas promociones salen de tu catálogo real. La idea es ponerlas visibles y con llamado claro a reserva."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {promos.map((promo) => (
          <article key={promo.name} className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Promo
            </p>

            <h3 className="mt-3 text-2xl font-semibold text-stone-950">
              {promo.name}
            </h3>

            <p className="mt-4 min-h-[72px] text-sm leading-6 text-stone-600">
              {promo.description}
            </p>

            <p className="mt-6 text-3xl font-semibold text-stone-950">
              {promo.price}
            </p>

            <a
              href="https://wa.me/51957230015"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white"
            >
              Solicitar promo
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PromosSection