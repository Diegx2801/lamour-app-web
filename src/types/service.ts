export type Service = {
  id?: string
  name: string
  description: string
  price: string
  retouch?: string
}

export type Category = {
  title: string
  subtitle?: string
  services: Service[]
}
