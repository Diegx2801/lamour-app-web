import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"
import HeroSection from "../components/home/HeroSection"
import AboutSection from "../components/home/AboutSection"
import GallerySection from "../components/home/GallerySection"
import PromosSection from "../components/home/PromosSection"
import ReviewsSection from "../components/home/ReviewsSection"
import HoursSection from "../components/home/HoursSection"
import ContactSection from "../components/home/ContactSection"
import FloatingWhatsApp from "../components/common/FloatingWhatsApp"
import ServicesPreviewSection from "../components/home/ServicesPreviewSection"

function HomePage() {
  return (
    <div className="min-h-screen bg-[#f6f1e9]">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesPreviewSection />
      <GallerySection />
      <PromosSection />
      <ReviewsSection />
      <HoursSection />
      <ContactSection />
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}

export default HomePage