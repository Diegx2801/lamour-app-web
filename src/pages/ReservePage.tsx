import { Link } from "react-router"
import ReserveProgress from "../components/reserve/ReserveProgress"
import ReserveSummaryCard from "../components/reserve/ReserveSummaryCard"
import ReserveSuccessView from "../components/reserve/ReserveSuccessView"
import ReserveStepCustomer from "../components/reserve/ReserveStepCustomer"
import ReserveStepConfirm from "../components/reserve/ReserveStepConfirm"
import ReserveStepServices from "../components/reserve/ReserveStepServices"
import ReserveStepSchedule from "../components/reserve/ReserveStepSchedule"
import { usePublicReservation } from "../features/reservations/hooks/usePublicReservation"
import { formatDateForMessage } from "../features/reservations/utils/reservationUtils"

function ReservePage() {
  const reservation = usePublicReservation()

  const stepTitle =
    reservation.step === 1
      ? "Elige tu servicio"
      : reservation.step === 2
      ? "Selecciona fecha y hora"
      : reservation.step === 3
      ? "Completa tus datos"
      : "Confirma tu reserva"

  if (reservation.submittedReservation) {
    return (
      <ReserveSuccessView
        reservation={reservation.submittedReservation}
        whatsappUrl={reservation.whatsappUrl}
        onNewReservation={reservation.handleNewReservation}
        formatDateForMessage={formatDateForMessage}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
          >
            ← Volver al inicio
          </Link>
        </div>

        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
          Reserva
        </p>

        <h1 className="mt-3 text-4xl font-semibold text-stone-950">
          Agenda tu cita
        </h1>

        <p className="mt-4 leading-7 text-stone-600">
          Reserva tu atención en L’AMOUR Beauty Studio siguiendo cada paso.
        </p>

        <div className="mt-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
          Horario de atención: lunes a sábado, de 9:00 am a 7:00 pm.
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <ReserveProgress step={reservation.step} title={stepTitle} />

            <form
              className="grid gap-5"
              onSubmit={(event) => {
                event.preventDefault()
                reservation.handleSubmit()
              }}
            >
              {reservation.step === 1 && (
  <ReserveStepServices
    loadingServices={reservation.loadingServices}
    categoryCards={reservation.categoryCards}
    activeCategory={reservation.activeCategory}
    formData={{ serviceId: reservation.formData.serviceId }}
    selectedServiceData={reservation.selectedServiceData}
    onCategoryChange={reservation.handleCategoryChange}
    onSelectService={reservation.handleSelectService}
  />
  
)}

              {reservation.step === 2 && (
                <ReserveStepSchedule
                  date={reservation.formData.date}
                  time={reservation.formData.time}
                  today={reservation.today}
                  timeSlots={reservation.timeSlots}
                  availableSlots={reservation.availableSlots}
                  loadingSlots={reservation.loadingSlots}
                  hasSelectedService={!!reservation.selectedServiceData}
                  isSunday={reservation.isSunday}
                  onDateChange={reservation.handleChange}
                  onTimeSelect={reservation.handleSelectTime}
                />
              )}

              {reservation.step === 3 && (
  <ReserveStepCustomer
    formData={reservation.formData}
    onChange={reservation.handleChange}
  />
)}

              {reservation.step === 4 && (
                <ReserveStepConfirm
                  selectedServiceData={reservation.selectedServiceData}
                  date={reservation.formData.date}
                  time={reservation.formData.time}
                  fullName={reservation.formData.fullName}
                  phone={reservation.formData.phone}
                  phonePreview={reservation.formData.phone}
                  formatDateForMessage={formatDateForMessage}
                />
              )}

              {reservation.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reservation.error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={reservation.goToPreviousStep}
                  disabled={reservation.step === 1 || reservation.loading}
                  className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800 disabled:opacity-40"
                >
                  Anterior
                </button>

                {reservation.step < 4 ? (
                  <button
                    type="button"
                    onClick={reservation.goToNextStep}
                    disabled={reservation.loading}
                    className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={reservation.loading}
                    className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {reservation.loading
                      ? "Registrando..."
                      : "Solicitar reserva"}
                  </button>
                )}
              </div>
            </form>
          </div>

          <ReserveSummaryCard
            service={reservation.selectedServiceData}
            date={reservation.formData.date}
            time={reservation.formData.time}
            servicePrice={reservation.servicePrice}
            depositAmount={reservation.depositAmount}
            remainingAmount={reservation.remainingAmount}
            formatDateForMessage={formatDateForMessage}
          />
        </div>
      </div>
    </div>
  )
}

export default ReservePage