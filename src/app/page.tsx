'use client'

import { useState } from 'react'
import Header from '@/components/sections/Header'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import FacultySection from '@/components/sections/FacultySection'
import WhyChooseUs from '@/components/sections/WhyChooseUs'
import CoursesSection from '@/components/sections/CoursesSection'
import PlacementSection from '@/components/sections/PlacementSection'
import GallerySection from '@/components/sections/GallerySection'
import ReviewsSection from '@/components/sections/ReviewsSection'
import EnquirySection from '@/components/sections/EnquirySection'
import ContactSection from '@/components/sections/ContactSection'
import Footer from '@/components/sections/Footer'
import LoginDialog from '@/components/sections/LoginDialog'
import PanelContainer from '@/components/panel/PanelContainer'
import EnquiryPopup from '@/components/sections/EnquiryPopup'
import { useAuthStore } from '@/lib/store'

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)
  const [popupSource, setPopupSource] = useState<'enquiry' | 'contact' | 'demo-class'>('enquiry')
  const { panelOpen } = useAuthStore()

  const openPopup = (source: 'enquiry' | 'contact' | 'demo-class') => {
    setPopupSource(source)
    setPopupOpen(true)
  }

  // When panel is open, hide the main website content
  if (panelOpen) {
    return <PanelContainer />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background w-full overflow-x-hidden">
      <Header onLoginClick={() => setLoginOpen(true)} />

      <main className="flex-1">
        <HeroSection onEnquiryClick={() => openPopup('enquiry')} />
        <AboutSection />
        <FacultySection />
        <WhyChooseUs />
        <CoursesSection onDemoClick={() => openPopup('demo-class')} />
        <PlacementSection />
        <GallerySection />
        <ReviewsSection />
        <EnquirySection onEnquiryClick={() => openPopup('enquiry')} />
        <ContactSection onContactClick={() => openPopup('contact')} />
      </main>

      <Footer />
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <EnquiryPopup open={popupOpen} onOpenChange={setPopupOpen} source={popupSource} />
    </div>
  )
}
