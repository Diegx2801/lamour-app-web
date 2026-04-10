import type { Service } from "../../types/service"

type ServiceCardProps = {
  service: Service
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-stone-950">{service.name}</h3>
        <span className="rounded-full bg-stone-900 px-3 py-1 text-sm font-semibold text-white">
          {service.price}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">
        {service.description}
      </p>

      {service.retouch ? (
        <p className="mt-4 text-sm text-stone-500">
          Retoque: <span className="font-medium text-stone-700">{service.retouch}</span>
        </p>
      ) : null}

      <a
        href="https://wa.me/51957230015"
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-block rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
      >
        Reservar este servicio
      </a>
    </article>
  )
}

export default ServiceCard