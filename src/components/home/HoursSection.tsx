function HoursSection() {
  const schedule = [
    { day: "Lunes", hours: "9:00 AM - 8:00 PM" },
    { day: "Martes", hours: "9:00 AM - 8:00 PM" },
    { day: "Miércoles", hours: "9:00 AM - 8:00 PM" },
    { day: "Jueves", hours: "9:00 AM - 8:00 PM" },
    { day: "Viernes", hours: "9:00 AM - 8:00 PM" },
    { day: "Sábado", hours: "9:00 AM - 7:00 PM" },
    { day: "Domingo", hours: "Cerrado" },
  ]

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Horarios
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-950">
            Horario de atención
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-600">
            Consulta nuestros horarios disponibles y agenda tu cita en el momento
            que más te convenga.
          </p>

          <div className="mt-8 space-y-4">
            {schedule.map((item) => (
              <div
                key={item.day}
                className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-4"
              >
                <span className="font-medium text-stone-900">{item.day}</span>
                <span className="text-sm text-stone-600">{item.hours}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#e7ddd1] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
            Reserva
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-stone-950">
            Agenda tu atención de forma rápida
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-stone-700">
            Esta sección luego se conectará con el sistema de reservas para que
            la clienta pueda elegir servicio, fecha y horario directamente desde
            la web.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="https://wa.me/51957230015"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Reservar por WhatsApp
            </a>

            <a
              href="#contacto"
              className="rounded-full border border-stone-400 px-6 py-3 text-sm font-medium text-stone-800 transition hover:bg-white/60"
            >
              Ver ubicación
            </a>
          </div>

          <div className="mt-10 rounded-[1.5rem] bg-white/70 p-6">
            <p className="text-sm font-medium text-stone-900">
              Próxima fase del sistema
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
              <li>• Selección de servicio</li>
              <li>• Fecha y hora disponible</li>
              <li>• Registro de clienta</li>
              <li>• Confirmación de cita</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HoursSection