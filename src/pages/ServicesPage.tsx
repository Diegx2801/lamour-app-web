import { motion } from "framer-motion"
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"
import ServicesSection from "../components/home/ServicesSection"

function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#f6f1e9]">
      <Navbar />

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-6 pb-10 pt-20"
      >
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#e7ddd1] px-8 py-14 md:px-12">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-[#f7f1ea] blur-2xl" />

          <div className="relative z-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-600">
              Catálogo completo
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight text-stone-950 md:text-6xl">
              Descubre todos los servicios de L’AMOUR
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-700 md:text-base">
              Explora nuestras categorías, compara opciones y elige el servicio
              ideal para tu estilo. Aquí encontrarás el catálogo completo con
              precios y detalles.
            </p>
          </div>
        </div>
      </motion.section>

      <ServicesSection />
      <Footer />
    </div>
  )
}

export default ServicesPage