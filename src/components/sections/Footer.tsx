'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  ArrowUp,
  MessageCircle,
} from 'lucide-react'

const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Team', href: '#faculty' },
  { label: 'Courses', href: '#courses' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Placement', href: '#placement' },
  { label: 'Contact Us', href: '#contact' },
]

const courses = [
  'Advanced Diploma in Medical Coding',
  'CPC Exam Preparation',
  'Denial Coding Management',
  'Specialization-Based Training',
  'Specialized Coding Courses',
]

const socialLinks = [
  { Icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/tbmediacalcoding' },
  { Icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/tbmedicalcodingacademy' },
  { Icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/the-bengal-medical-coding-training-academy-582246412/' },
]

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <footer className="bg-gradient-to-b from-medical-dark to-[#2a0e09] text-white mt-auto overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Institute Info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-md shrink-0">
                  <Image
                    src="/images/logo.jpg"
                    alt="The Bengal Medical Coding Training Academy Logo"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-heading">The Bengal Medical</h3>
                  <p className="text-xs text-white/60">Coding Training Academy</p>
                  <p className="text-[8px] font-bold text-accent-gold tracking-wide uppercase">West Bengal&apos;s First Medical Coding Institute</p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                West Bengal&apos;s first medical coding training institute. Transforming
                aspiring healthcare professionals into skilled medical coders with industry-leading
                curriculum and 94% placement support.
              </p>
              <div className="flex gap-3">
                {socialLinks.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-medical-blue flex items-center justify-center transition-colors duration-300"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-base mb-4 text-white font-heading">Quick Links</h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-white/60 text-sm hover:text-medical-green transition-colors duration-200 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Our Courses - Only 5 courses */}
            <div>
              <h4 className="font-bold text-base mb-4 text-white font-heading">Our Courses</h4>
              <ul className="space-y-2.5">
                {courses.map((course) => (
                  <li key={course}>
                    <a
                      href="#courses"
                      onClick={(e) => handleLinkClick(e, '#courses')}
                      className="text-white/60 text-sm hover:text-medical-green transition-colors duration-200 inline-block"
                    >
                      {course}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-base mb-4 text-white font-heading">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <MapPin className="h-4 w-4 text-medical-green mt-0.5 shrink-0" />
                  <p className="text-white/60 text-sm">
                    Baguihati, Kolkata, Near 44 Bus Stand
                  </p>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="h-4 w-4 text-medical-green shrink-0" />
                  <a href="tel:+919831239669" className="text-white/60 text-sm hover:text-medical-green transition-colors">
                    +91 9831239669
                  </a>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="h-4 w-4 text-medical-green shrink-0" />
                  <a href="tel:+919062379349" className="text-white/60 text-sm hover:text-medical-green transition-colors">
                    +91 9062379349
                  </a>
                </div>
                <div className="flex gap-3 items-center">
                  <Mail className="h-4 w-4 text-medical-green shrink-0" />
                  <a href="mailto:tbmedicalcodingacademy@gmail.com" className="text-white/60 text-sm hover:text-medical-green transition-colors">
                    tbmedicalcodingacademy@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/40 text-xs sm:text-sm text-center sm:text-left">
              © {new Date().getFullYear()} THE BENGAL MEDICAL CODING TRAINING ACADEMY. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-white/40">
              <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/70 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/919831239669?text=Hi%2C%20I%20am%20interested%20in%20Medical%20Coding%20Course"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 group"
        aria-label="Chat on WhatsApp"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
          <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
        </div>
        <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-[#2a0e09] text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat with us!
        </span>
      </a>

      {/* Call Now Floating Button */}
      <a
        href="tel:+919831239669"
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Call Now"
      >
        <div className="w-14 h-14 rounded-full bg-medical-blue flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
          <Phone className="h-6 w-6 text-white" />
        </div>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#2a0e09] text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Call Now!
        </span>
      </a>

      {/* Back to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6 z-50 w-10 h-10 rounded-full bg-[#2a0e09] text-white flex items-center justify-center shadow-lg hover:bg-medical-dark transition-colors cursor-pointer"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
