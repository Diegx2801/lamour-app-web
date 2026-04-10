import Navbar from "./components/layout/Navbar"
import HeroSection from "./components/home/HeroSection"
import ServicesSection from "./components/home/ServicesSection"
import PromosSection from "./components/home/PromosSection"
import ReviewsSection from "./components/home/ReviewsSection"
import ContactSection from "./components/home/ContactSection"

function App() {
  return (
    <div className="min-h-screen bg-[#f6f1e9]">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <PromosSection />
      <ReviewsSection />
      <ContactSection />
    </div>
  )
}

export default App