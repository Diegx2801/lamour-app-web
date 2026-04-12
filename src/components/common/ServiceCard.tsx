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
    <article className="flex h-full flex-col justify-between rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h4 className="text-2xl font-semibold text-stone-950">
            {service.name}
          </h4>

          <span className="shrink-0 rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white">
            {service.price}
          </span>
        </div>

        <p className="mt-4 min-h-[72px] text-sm leading-7 text-stone-600">
          {service.description}
        </p>

        {service.retouch && (
          <p className="mt-4 text-sm text-stone-600">
            Retoque: <span className="font-medium text-stone-900">{service.retouch}</span>
          </p>
        )}
      </div>

      <div className="mt-6">
        <Link
          to="/reservar"
          className="inline-flex rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
        >
          Reservar este servicio
        </Link>
      </div>
    </article>
  )
}

export default ServiceCard