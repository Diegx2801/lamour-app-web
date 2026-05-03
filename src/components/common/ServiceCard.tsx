import { Link } from "react-router"

type Service = {
  name: string
  price: string
  description: string
  retouch?: string
}

type ServiceCardProps = {
  service: Service
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold leading-snug text-stone-950 md:text-xl">
            {service.name}
          </h4>

          {service.retouch && (
            <p className="mt-1 text-xs text-stone-500">
              Retoque:{" "}
              <span className="font-medium text-stone-800">
                {service.retouch}
              </span>
            </p>
          )}
        </div>

        <span className="shrink-0 rounded-full bg-stone-950 px-3 py-1.5 text-xs font-medium text-white">
          {service.price}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
        {service.description}
      </p>

      <Link
        to="/reservar"
        className="mt-4 inline-flex text-sm font-medium text-stone-900 transition hover:text-stone-500"
      >
        Reservar →
      </Link>
    </article>
  )
}

export default ServiceCard