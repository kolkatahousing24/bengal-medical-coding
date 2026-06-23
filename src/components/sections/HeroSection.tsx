'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ChevronDown, ArrowRight, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const heroStats = [
  { value: 157, suffix: '+', label: 'Students Trained' },
  { value: 50, suffix: '+', label: 'Hiring Partners' },
  { value: 10, suffix: '+', label: 'Expert Faculty' },
  { value: 94, suffix: '%', label: 'Placement Rate' },
]

const slides = [
  {
    gradient: 'from-[#7b1a10] via-[#5c130c] to-[#3d0b08]',
    accent: 'bg-medical-green/20',
    overlay: 'from-medical-blue/90 via-medical-blue/80 to-medical-cyan/70',
  },
  {
    gradient: 'from-[#5c130c] via-[#7b1a10] to-[#c84020]',
    accent: 'bg-medical-cyan/15',
    overlay: 'from-medical-blue/85 via-medical-blue/75 to-medical-cyan/65',
  },
  {
    gradient: 'from-[#3d0b08] via-[#c84020] to-[#7b1a10]',
    accent: 'bg-white/10',
    overlay: 'from-medical-blue/80 via-medical-blue/70 to-medical-cyan/60',
  },
]

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number
  suffix: string
  inView: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    let start = 0
    const duration = 2000
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span className="tabular-nums">
      {count}
      {suffix}
    </span>
  )
}

export default function HeroSection({ onEnquiryClick }: { onEnquiryClick?: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const counterRef = useRef<HTMLDivElement>(null)
  const counterInView = useInView(counterRef, { once: true, margin: '-50px' })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const SLIDE_INTERVAL = 5000

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDE_INTERVAL)
  }, [])

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(index)
      startAutoPlay()
    },
    [startAutoPlay]
  )

  useEffect(() => {
    startAutoPlay()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startAutoPlay])

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  }

  const slideVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Slideshow Background */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1, ease: 'easeInOut' as const }}
            className="absolute inset-0"
          >
            {/* Slide gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient}`}
            />
            {/* Decorative pattern for each slide */}
            <div className="absolute inset-0 opacity-30">
              <div
                className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full ${slides[currentSlide].accent} blur-3xl`}
              />
              <div
                className={`absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full ${slides[currentSlide].accent} blur-3xl`}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Maroon Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-medical-blue/90 via-medical-blue/80 to-medical-cyan/70" />

      {/* Animated decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-x-1/4 -translate-y-1/4"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' as const }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-medical-cyan/10 translate-x-[-20%] translate-y-[20%]"
          animate={{ scale: [1, 1.1, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' as const }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-medical-green/10"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Admission Open Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
              className="inline-block"
            >
              <Badge className="bg-medical-green text-white border-0 px-4 py-1.5 text-sm font-semibold shadow-lg shadow-medical-green/30 animate-pulse">
                <Phone className="h-3.5 w-3.5 mr-1.5" />
                Admission Open!
              </Badge>
            </motion.div>
          </motion.div>

          {/* Institute Name */}
          <motion.h1
            variants={itemVariants}
            className="font-heading text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight mb-4 md:whitespace-nowrap"
          >
            THE BENGAL{' '}
            <span className="text-medical-green">MEDICAL CODING</span>
            {' '}TRAINING ACADEMY
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 font-light"
          >
            West Bengal&apos;s First Medical Coding Training Institute
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={onEnquiryClick}
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-medical-blue bg-transparent min-w-[180px] text-base font-semibold transition-all duration-300"
            >
              Enquire Now
            </Button>
            <Button
              size="lg"
              onClick={onEnquiryClick}
              className="w-full sm:w-auto bg-medical-green hover:bg-medical-green/90 text-white shadow-lg shadow-medical-green/30 min-w-[180px] text-base font-semibold transition-all duration-300"
            >
              Apply Now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>

          {/* Animated Counters */}
          <motion.div
            ref={counterRef}
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto"
          >
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    inView={counterInView}
                  />
                </span>
                <span className="text-xs sm:text-sm text-white/80 mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Slide Dot Indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`relative h-3 rounded-full transition-all duration-500 ease-out ${
              index === currentSlide
                ? 'w-8 bg-medical-green shadow-md shadow-medical-green/40'
                : 'w-3 bg-white/50 hover:bg-white/80'
            }`}
          >
            {index === currentSlide && (
              <motion.div
                className="absolute inset-0 rounded-full bg-medical-green"
                layoutId="activeSlide"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
        onClick={() => handleScrollTo('#courses')}
      >
        <div className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
          <span className="text-xs font-medium tracking-wider uppercase">
            Scroll Down
          </span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </motion.div>
    </section>
  )
}
