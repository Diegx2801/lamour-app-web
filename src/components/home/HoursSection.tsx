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
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-3xl rounded-[1.5rem] bg-white p-5 shadow-sm md:rounded-[2rem] md:p-8">
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

        <div className="mt-8 space-y-3 md:space-y-4">
          {schedule.map((item) => (
            <div
              key={item.day}
              className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 px-4 py-4"
            >
              <span className="font-medium text-stone-900">{item.day}</span>
              <span className="text-right text-sm text-stone-600">
                {item.hours}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HoursSection
