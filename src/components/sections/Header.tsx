'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Moon,
  Sun,
  Menu,
  LogIn,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  onLoginClick?: () => void
}

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Team', href: '#faculty' },
  { label: 'Courses', href: '#courses' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Placement', href: '#placement' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact Us', href: '#contact' },
]

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/tbmediacalcoding', label: 'Facebook' },
  { icon: Instagram, href: 'https://www.instagram.com/tbmedicalcodingacademy', label: 'Instagram' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/the-bengal-medical-coding-training-academy-582246412/', label: 'LinkedIn' },
]

export default function Header({ onLoginClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Track client-side mounting for theme toggle hydration safety
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // Handle scroll detection for sticky shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full"
    >
      {/* Top Bar — Desktop: full info bar, Mobile: phone numbers only */}
      {/* Desktop Top Bar */}
      <div className="hidden md:flex items-center justify-between px-4 lg:px-8 py-1.5 bg-medical-dark text-white/90 text-xs">
        <div className="flex items-center gap-4">
          <a
            href="tel:+919831239669"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="h-3 w-3" />
            <span>+91 9831239669</span>
          </a>
          <a
            href="tel:+919062379349"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="h-3 w-3" />
            <span>+91 9062379349</span>
          </a>
          <a
            href="mailto:tbmedicalcodingacademy@gmail.com"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="h-3 w-3" />
            <span>tbmedicalcodingacademy@gmail.com</span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          {socialLinks.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="hover:text-white transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            )
          })}
        </div>
      </div>
      {/* Mobile Phone Strip — visible on small screens */}
      <div className="flex md:hidden items-center justify-center gap-4 px-4 py-1.5 bg-medical-dark text-white/90 text-xs">
        <a
          href="tel:+919831239669"
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <Phone className="h-3 w-3" />
          <span>+91 9831239669</span>
        </a>
        <span className="text-white/40">|</span>
        <a
          href="tel:+919062379349"
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <Phone className="h-3 w-3" />
          <span>+91 9062379349</span>
        </a>
      </div>

      {/* Main Navigation Bar */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-lg shadow-md border-b border-border/50'
            : 'bg-background/60 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex h-12 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 min-w-0">
          {/* Logo Section */}
          <Link
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick('#home')
            }}
            className="flex items-center gap-2 shrink-0 min-w-0"
          >
            {/* Logo Image */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="relative h-8 w-8 sm:h-12 sm:w-12 rounded-lg overflow-hidden shrink-0"
            >
              <Image
                src="/images/logo.jpg"
                alt="The Bengal Medical Coding Training Academy Logo"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </motion.div>

            {/* Institute Name */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold leading-tight text-medical-blue dark:text-medical-cyan sm:text-base font-heading truncate">
                The Bengal Medical
              </span>
              <span className="text-[9px] font-semibold leading-tight text-muted-foreground sm:text-xs truncate">
                Coding Training Academy
              </span>
              <span className="hidden sm:block text-[9px] font-bold leading-tight text-accent-gold mt-0.5 tracking-wide uppercase truncate">
                West Bengal&apos;s First Medical Coding Institute
              </span>
            </div>

            {/* Admission Open Badge */}
            <Badge
              className="hidden sm:inline-flex items-center gap-1 bg-medical-green text-white border-0 text-[10px] px-2 py-0.5 animate-pulse ml-1"
            >
              <Phone className="h-2.5 w-2.5" />
              Admission Open
            </Badge>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.href)
                }}
                className="relative px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-medical-blue dark:hover:text-medical-cyan rounded-md hover:bg-medical-blue/5 dark:hover:bg-medical-cyan/5"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="text-muted-foreground hover:text-medical-blue dark:hover:text-medical-cyan"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mounted && theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: 90, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: 90, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Login Button - hidden on mobile (available in hamburger menu), visible on sm+ */}
            <Button
              variant="outline"
              size="sm"
              onClick={onLoginClick}
              className="hidden sm:inline-flex border-medical-blue/30 text-medical-blue hover:bg-medical-blue hover:text-white dark:border-medical-cyan/30 dark:text-medical-cyan dark:hover:bg-medical-cyan dark:hover:text-white transition-colors"
            >
              <LogIn className="h-4 w-4 mr-1" />
              Login
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-medical-blue dark:hover:text-medical-cyan"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0">
                <SheetHeader className="p-6 pb-4 border-b bg-medical-blue/5 dark:bg-medical-cyan/5">
                  <SheetTitle className="flex items-center gap-2 text-left">
                    <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src="/images/logo.jpg"
                        alt="Logo"
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-medical-blue dark:text-medical-cyan font-heading">
                        The Bengal Medical
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        Coding Training Academy
                      </span>
                      <span className="text-[7px] font-bold text-accent-gold tracking-wide uppercase">
                        West Bengal&apos;s First Medical Coding Institute
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-1 p-4 max-h-[60vh] overflow-y-auto">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault()
                          handleNavClick(link.href)
                        }}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-medical-blue/10 hover:text-medical-blue dark:hover:bg-medical-cyan/10 dark:hover:text-medical-cyan"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-medical-blue dark:bg-medical-cyan" />
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile Login Button */}
                <div className="p-4 pt-2 border-t">
                  <Button
                    className="w-full bg-medical-blue hover:bg-medical-dark text-white dark:bg-medical-cyan dark:hover:bg-medical-blue dark:text-white"
                    onClick={() => {
                      setMobileOpen(false)
                      onLoginClick?.()
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </div>

                {/* Admission Open Notice */}
                <div className="p-4 pt-0">
                  <div className="rounded-lg bg-medical-green/10 border border-medical-green/20 p-3 text-center">
                    <p className="text-xs font-semibold text-medical-green flex items-center justify-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      Admission Open — Enroll Now!
                    </p>
                  </div>
                </div>

                {/* Mobile Contact Info */}
                <div className="p-4 pt-0 space-y-2">
                  <a
                    href="tel:+919831239669"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-medical-blue dark:hover:text-medical-cyan transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    +91 9831239669
                  </a>
                  <a
                    href="tel:+919062379349"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-medical-blue dark:hover:text-medical-cyan transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    +91 9062379349
                  </a>
                  <a
                    href="mailto:tbmedicalcodingacademy@gmail.com"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-medical-blue dark:hover:text-medical-cyan transition-colors"
                  >
                    <Mail className="h-3 w-3" />
                    tbmedicalcodingacademy@gmail.com
                  </a>
                  <div className="flex items-center gap-3 pt-1">
                    {socialLinks.map((social) => {
                      const Icon = social.icon
                      return (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          className="text-muted-foreground hover:text-medical-blue dark:hover:text-medical-cyan transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
