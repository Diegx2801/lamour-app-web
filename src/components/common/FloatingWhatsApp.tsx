function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/51957230015"
      target="_blank"
      rel="noreferrer"
      aria-label="Chatear por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-green-500 px-5 py-3 text-white shadow-lg transition hover:scale-105 hover:bg-green-600"
    >
      <span className="text-xl">💬</span>
      <span className="text-sm font-medium">WhatsApp</span>
    </a>
  )
}

export default FloatingWhatsApp