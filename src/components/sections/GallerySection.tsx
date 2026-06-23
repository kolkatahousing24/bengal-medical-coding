'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface GalleryImage {
  id: string
  title: string
  category: string
  imageUrl: string
  description: string | null
  createdAt: string
}

export default function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set())
  const sectionRef = useRef<HTMLDivElement>(null)

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/gallery')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setImages(data.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  // Single intersection observer for the whole section
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '-50px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goNext = () => {
    if (lightboxIndex !== null && images.length > 0) {
      setLightboxIndex((lightboxIndex + 1) % images.length)
    }
  }

  const goPrev = () => {
    if (lightboxIndex !== null && images.length > 0) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <section id="gallery" className="py-16 sm:py-20 bg-background overflow-hidden" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
            Our{' '}
            <span className="text-medical-blue dark:text-medical-cyan">
              Gallery
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            A glimpse into our training sessions, workshops, and campus life
          </p>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-medical-blue to-accent-red" />
        </motion.div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-medical-blue/10 dark:bg-medical-cyan/10 flex items-center justify-center mb-4">
              <ZoomIn className="h-8 w-8 text-medical-blue dark:text-medical-cyan" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">
              Gallery coming soon
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200"
                onClick={() => openLightbox(index)}
              >
                {/* Image - using regular img for better performance with lazy loading */}
                {/* Skeleton placeholder while image loads */}
                {!loadedImages.has(image.id) && !errorImages.has(image.id) && (
                  <Skeleton className="absolute inset-0 w-full h-full" />
                )}
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-110 ${
                    loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'
                  } transition-opacity duration-300`}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  onLoad={() => setLoadedImages(prev => new Set(prev).add(image.id))}
                  onError={() => setErrorImages(prev => new Set(prev).add(image.id))}
                />
                {/* Fallback for broken images */}
                {errorImages.has(image.id) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                    <ZoomIn className="h-6 w-6 mb-1" />
                    <span className="text-xs">Image unavailable</span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-medical-dark/80 via-medical-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-end p-3 sm:p-4">
                  <h3 className="text-white text-sm sm:text-base font-semibold leading-tight">
                    {image.title}
                  </h3>
                  {image.description && (
                    <p className="text-white/70 text-xs mt-1 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>

                {/* Zoom Icon */}
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <ZoomIn className="h-4 w-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && images[lightboxIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close lightbox"
              >
                <X className="h-5 w-5" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="absolute left-2 sm:left-6 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute right-2 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="relative max-w-5xl max-h-[85vh] w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images[lightboxIndex].imageUrl}
                  alt={images[lightboxIndex].title}
                  className="w-full h-full object-contain rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6 rounded-b-lg">
                  <h3 className="text-white text-base sm:text-lg font-semibold">
                    {images[lightboxIndex].title}
                  </h3>
                  {images[lightboxIndex].description && (
                    <p className="text-white/70 text-sm mt-1">
                      {images[lightboxIndex].description}
                    </p>
                  )}
                  <span className="text-white/40 text-xs mt-2 block">
                    {lightboxIndex + 1} / {images.length}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
