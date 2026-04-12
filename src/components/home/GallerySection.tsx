import { motion } from "framer-motion"
import SectionTitle from "../common/SectionTitle"
import { galleryItems, type GalleryItem } from "../../data/gallery"

function GallerySection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <SectionTitle
          eyebrow="Galería"
          title="Resultados reales de L’AMOUR"
          description="Trabajos, resultados y estilo que definen nuestra identidad."
        />
      </motion.div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item: GalleryItem, index: number) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            viewport={{ once: true }}
            className={`group relative overflow-hidden rounded-[2rem] ${
              index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
            }`}
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 transition duration-300 group-hover:opacity-100" />

            <div className="absolute bottom-0 left-0 right-0 translate-y-10 p-6 text-white transition duration-300 group-hover:translate-y-0">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                {item.category}
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                {item.title}
              </h3>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

export default GallerySection