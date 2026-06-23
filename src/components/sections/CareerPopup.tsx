'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Award, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CareerPopupProps {
  onYesClick: () => void
}

const ISO_CERT_URL = 'https://kxksiowdkdnlvvybcpqp.supabase.co/storage/v1/object/public/gallery/iso-certificate.jpg'

export default function CareerPopup({ onYesClick }: CareerPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const showPopup = useCallback(() => {
    if (!dismissed) {
      setIsOpen(true)
    }
  }, [dismissed])

  useEffect(() => {
    if (dismissed) return

    // First popup after 15 seconds
    const firstTimer = setTimeout(() => {
      showPopup()
    }, 15000)

    // Then repeat every 15 seconds
    const interval = setInterval(() => {
      showPopup()
    }, 15000)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)
    }
  }, [showPopup, dismissed])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleNo = () => {
    setIsOpen(false)
    setDismissed(true)
  }

  const handleYes = () => {
    setIsOpen(false)
    setDismissed(true)
    onYesClick()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-1/2 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] max-w-sm"
        >
          <div className="relative bg-white dark:bg-[#1a0806] rounded-2xl shadow-2xl border-2 border-accent-gold/40 overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-foreground" />
            </button>

            {/* Header bar */}
            <div className="bg-gradient-to-r from-maroon to-accent-red px-5 py-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-accent-gold" />
              <span className="text-white font-bold text-sm uppercase tracking-wide">Career Opportunity</span>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Question */}
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold text-maroon dark:text-accent-red leading-snug">
                  Would you like to choose Medical Coding as a career option?
                </h3>
              </div>

              {/* Yes / No buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleYes}
                  className="flex-1 bg-gradient-to-r from-maroon to-accent-red hover:from-maroon-dark hover:to-accent-red-dark text-white font-semibold py-2.5"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Yes
                </Button>
                <Button
                  onClick={handleNo}
                  variant="outline"
                  className="flex-1 border-border hover:bg-muted font-semibold py-2.5"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  No
                </Button>
              </div>

              {/* Divider */}
              <div className="border-t border-border pt-4">
                {/* Company name */}
                <div className="text-center mb-3">
                  <p className="text-sm font-bold text-foreground leading-tight">
                    THE BENGAL MEDICAL CODING TRAINING ACADEMY PVT. LTD.
                  </p>
                  <p className="text-xs font-semibold text-accent-gold mt-1">(ISO 9001:2015)</p>
                </div>

                {/* ISO Certificate image */}
                <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30">
                  <img
                    src={ISO_CERT_URL}
                    alt="ISO 9001:2015 Certificate"
                    className="w-full h-auto object-contain max-h-[200px]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
