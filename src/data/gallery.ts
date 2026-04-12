import cejas1 from "../assets/cejas1.jpg"
import cejas2 from "../assets/cejas2.jpg"
import facial1 from "../assets/facial1.jpg"
import mensaje1 from "../assets/mensaje1.jpg"
import pestanas1 from "../assets/pestanas1.jpg"
import pestanas2 from "../assets/pestanas2.jpg"
import pestanas3 from "../assets/pestanas3.jpg"

export type GalleryItem = {
  id: number
  image: string
  title: string
  category: string
}

export const galleryItems: GalleryItem[] = [
  {
    id: 1,
    image: cejas1,
    title: "Planchado de cejas",
    category: "Cejas",
  },
  {
    id: 2,
    image: cejas2,
    title: "Pack Cejas Glow",
    category: "Cejas",
  },
  {
    id: 3,
    image: facial1,
    title: "Limpieza facial",
    category: "Faciales",
  },
  {
    id: 4,
    image: mensaje1,
    title: "Mensaje de marca",
    category: "L’AMOUR",
  },
  {
    id: 5,
    image: pestanas1,
    title: "Extensiones efecto rimel",
    category: "Pestañas",
  },
  {
    id: 6,
    image: pestanas2,
    title: "Antes y después",
    category: "Pestañas",
  },
  {
    id: 7,
    image: pestanas3,
    title: "Resultado final",
    category: "Pestañas",
  },
]