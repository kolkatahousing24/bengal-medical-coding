'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle2, Loader2, MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface EnquiryPopupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: 'enquiry' | 'contact' | 'demo-class'
}

const sourceConfig = {
  'enquiry': {
    title: 'Enquire Now',
    subtitle: 'Get course details & admission info',
    color: 'from-medical-blue to-medical-dark',
  },
  'contact': {
    title: 'Contact Us',
    subtitle: 'We\'ll get back to you within 24 hours',
    color: 'from-medical-dark to-[#7b1a10]',
  },
  'demo-class': {
    title: 'Book Demo Class',
    subtitle: 'Experience our teaching methodology firsthand',
    color: 'from-[#7b1a10] to-[#c8882a]',
  },
}

export default function EnquiryPopupForm({ open, onOpenChange, source }: EnquiryPopupFormProps) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const config = sourceConfig[source]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (!form.name || !form.phone || !form.email) {
      setError('Please fill in all fields')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          source,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setIsSubmitted(true)
        setForm({ name: '', phone: '', email: '' })
        setTimeout(() => {
          setIsSubmitted(false)
          onOpenChange(false)
        }, 3000)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const whatsappUrl = `https://wa.me/919831239669?text=Hi%2C%20I%20am%20interested%20in%20Medical%20Coding%20Course${source === 'demo-class' ? '%20Demo%20Class' : ''}`

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-md bg-background rounded-2xl border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${config.color} px-6 py-5 text-white relative`}>
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-white/20 flex items-center justify-center">
                  <Image
                    src="/images/logo.jpg"
                    alt="Logo"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-heading">{config.title}</h3>
                  <p className="text-white/80 text-xs">{config.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-6 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-medical-green/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-7 w-7 text-medical-green" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-1">
                    Submitted Successfully!
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Our counselor will contact you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="popup-name">Full Name *</Label>
                    <Input
                      id="popup-name"
                      placeholder="Enter your full name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="border-border/60 focus:border-medical-blue dark:focus:border-medical-cyan"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popup-phone">Phone Number *</Label>
                    <Input
                      id="popup-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="border-border/60 focus:border-medical-blue dark:focus:border-medical-cyan"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popup-email">Email Address *</Label>
                    <Input
                      id="popup-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="border-border/60 focus:border-medical-blue dark:focus:border-medical-cyan"
                    />
                  </div>

                  {error && (
                    <p className="text-destructive text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-medical-blue hover:bg-medical-dark text-white dark:bg-medical-cyan dark:hover:bg-medical-blue dark:text-white rounded-xl shadow-md transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>

                  {/* WhatsApp Button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold text-sm transition-colors shadow-md"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat on WhatsApp
                  </a>

                  {/* Call Button */}
                  <a
                    href="tel:+919831239669"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Call: +91 9831239669
                  </a>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
