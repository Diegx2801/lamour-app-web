import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import HeroSection from "./components/home/HeroSection"
import AboutSection from "./components/home/AboutSection"
import ServicesSection from "./components/home/ServicesSection"
import PromosSection from "./components/home/PromosSection"
import ReviewsSection from "./components/home/ReviewsSection"
import ContactSection from "./components/home/ContactSection"
import FloatingWhatsApp from "./components/common/FloatingWhatsApp"

function App() {
  return (
    <div className="min-h-screen bg-[#f6f1e9]">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PromosSection />
      <ReviewsSection />
      <ContactSection />
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}

export default App