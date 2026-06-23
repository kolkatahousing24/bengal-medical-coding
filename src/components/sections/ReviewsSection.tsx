'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface ReviewData {
  id: string
  studentName: string
  reviewText: string
  rating: number
  course: string | null
  placement: string | null
  photoUrl: string | null
  type: string
  createdAt: string
}

// Default reviews that always show (including Deblina, Aditi, Arpita)
const defaultReviews = [
  {
    id: 'default-1',
    name: 'Deblina',
    position: 'Medical Coder at Optum',
    rating: 5,
    text: 'The Advanced Diploma course at The Bengal Medical Coding Training Academy was life-changing! The faculty was incredibly supportive and the hands-on training with real medical records gave me the confidence to start my career. Got placed within 2 months!',
    initials: 'DE',
  },
  {
    id: 'default-2',
    name: 'Aditi',
    position: 'CPC Certified Coder at Cognizant',
    rating: 5,
    text: 'I cleared my CPC exam in the first attempt thanks to the excellent training at this academy. The mock tests and practice sessions were exactly like the real exam. Best decision I ever made for my career!',
    initials: 'AD',
  },
  {
    id: 'default-3',
    name: 'Arpita',
    position: 'Denial Coding Specialist at Wipro',
    rating: 5,
    text: 'The Denial Coding Management course was outstanding. Practical case studies and real-world scenarios helped me understand claim processing deeply. The placement support team was amazing — got my dream job!',
    initials: 'AR',
  },
  {
    id: 'default-6',
    name: 'Riya Sen',
    position: 'Medical Coder at Apollo Hospitals',
    rating: 5,
    text: 'The training was excellent! I got placed within 2 months of completing the course. The faculty is very supportive and the curriculum is industry-relevant.',
    initials: 'RS',
  },
  {
    id: 'default-7',
    name: 'Arjun Das',
    position: 'CPC Certified Coder',
    rating: 5,
    text: 'Best academy for medical coding in Kolkata. The practical training approach helped me understand real-world coding scenarios.',
    initials: 'AD',
  },
  {
    id: 'default-8',
    name: 'Sneha Gupta',
    position: 'Medical Coder at TCS',
    rating: 5,
    text: 'Practical training approach helped me clear the CPC exam in first attempt. The mock tests were very helpful.',
    initials: 'SG',
  },
  {
    id: 'default-9',
    name: 'Vikram Singh',
    position: 'Coding Analyst at WNS',
    rating: 4,
    text: 'Flexible timings and online classes made it easy to learn while working. Great support from the faculty.',
    initials: 'VS',
  },
  {
    id: 'default-10',
    name: 'Pooja Sharma',
    position: 'Medical Coder at Cognizant',
    rating: 5,
    text: 'Placement support is outstanding. Resume building and mock interviews were very helpful. Got placed within a month.',
    initials: 'PS',
  },
  {
    id: 'default-11',
    name: 'Amit Roy',
    position: 'Senior Medical Coder',
    rating: 4,
    text: 'The course curriculum is well-designed and covers all aspects of medical coding. ICD-10 training was particularly thorough.',
    initials: 'AR',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? 'fill-accent-gold text-accent-gold'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  )
}

const avatarColors = [
  'bg-medical-blue',
  'bg-accent-red',
  'bg-accent-gold',
  'bg-medical-dark',
]

function getAvatarColor(index: number): string {
  return avatarColors[index % avatarColors.length]
}

export default function ReviewsSection() {
  const [isPaused, setIsPaused] = useState(false)
  const autoplayRef = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
    },
    [autoplayRef.current]
  )

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Merge DB reviews with defaults
  const [dbReviews, setDbReviews] = useState<ReviewData[]>([])
  const allReviews = [...defaultReviews, ...dbReviews.map(r => ({
    id: r.id,
    name: r.studentName,
    position: r.placement || r.course || 'Student',
    rating: r.rating,
    text: r.reviewText,
    initials: r.studentName.split(' ').map(n => n[0]).join('').slice(0, 2),
  }))]

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setDbReviews(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Pause/resume autoplay on hover
  useEffect(() => {
    if (!emblaApi || !autoplayRef.current) return
    if (isPaused) {
      autoplayRef.current.stop()
    } else {
      autoplayRef.current.play()
    }
  }, [emblaApi, isPaused])

  return (
    <section
      id="reviews"
      className="py-16 sm:py-20 bg-medical-light dark:bg-medical-dark/10 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
            Student{' '}
            <span className="text-medical-blue dark:text-medical-cyan">
              Reviews
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Hear from our successful students who launched their careers with us
          </p>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-medical-blue to-accent-red" />
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Embla Carousel Container */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex -ml-4">
              {allReviews.map((review, index) => (
                <div
                  key={review.id}
                  className="flex-[0_0_100%] min-w-0 pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <div className="bg-white dark:bg-card rounded-xl border-l-4 border-medical-blue dark:border-medical-cyan shadow-md hover:shadow-medical-lg transition-all duration-300 p-5 sm:p-6 h-full flex flex-col group">
                    {/* Quote Icon */}
                    <Quote className="h-8 w-8 text-medical-blue/20 dark:text-medical-cyan/20 mb-3 shrink-0 group-hover:text-medical-blue/40 dark:group-hover:text-medical-cyan/40 transition-colors duration-300" />

                    {/* Review Text */}
                    <p className="text-foreground/80 text-sm sm:text-base leading-relaxed flex-1 mb-4">
                      &ldquo;{review.text}&rdquo;
                    </p>

                    {/* Rating */}
                    <StarRating rating={review.rating} />

                    {/* Student Info */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback
                          className={`${getAvatarColor(
                            index
                          )} text-white text-xs font-bold`}
                        >
                          {review.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {review.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {review.position}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="h-10 w-10 rounded-full border-medical-blue/20 text-medical-blue hover:bg-medical-blue hover:text-white dark:border-medical-cyan/20 dark:text-medical-cyan dark:hover:bg-medical-cyan dark:hover:text-white transition-colors disabled:opacity-40"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {allReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    selectedIndex === index
                      ? 'w-6 bg-medical-blue dark:bg-medical-cyan'
                      : 'w-2 bg-medical-blue/25 dark:bg-medical-cyan/25 hover:bg-medical-blue/50 dark:hover:bg-medical-cyan/50'
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="h-10 w-10 rounded-full border-medical-blue/20 text-medical-blue hover:bg-medical-blue hover:text-white dark:border-medical-cyan/20 dark:text-medical-cyan dark:hover:bg-medical-cyan dark:hover:text-white transition-colors disabled:opacity-40"
              aria-label="Next review"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Google Review Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 sm:mt-12 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 bg-white dark:bg-card rounded-full px-5 sm:px-6 py-3 border border-border/50 shadow-sm hover:shadow-medical transition-shadow duration-300">
            {/* Google "G" Icon */}
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground text-sm sm:text-base">
                4.8
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-accent-gold text-accent-gold"
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-xs sm:text-sm">
                /5 on Google Reviews
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
