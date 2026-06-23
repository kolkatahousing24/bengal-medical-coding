'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle2, Loader2, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface EnquiryPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  source?: 'enquiry' | 'contact' | 'demo-class'
}

const sourceLabels = {
  'enquiry': 'Enquire Now',
  'contact': 'Contact Us',
  'demo-class': 'Book Demo Class',
}

export default function EnquiryPopup({ open, onOpenChange, source = 'enquiry' }: EnquiryPopupProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.mobile,
          email: formData.email,
          qualification: '',
          message: `Source: ${sourceLabels[source]}`,
          source: source,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setIsSubmitted(true)
      setFormData({ fullName: '', mobile: '', email: '' })
      setTimeout(() => {
        setIsSubmitted(false)
        onOpenChange(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const whatsappMessage = encodeURIComponent(`Hi, I am interested in Medical Coding Course. Please share details.`)
  const whatsappLink = `https://wa.me/919831239669?text=${whatsappMessage}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{sourceLabels[source]}</DialogTitle>
          <DialogDescription>
            Fill in your details and we will get back to you
          </DialogDescription>
        </DialogHeader>

        {/* Branding Header */}
        <div className="bg-gradient-to-r from-medical-blue to-medical-dark px-5 py-4 text-white">
          <div className="flex items-center gap-2">
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
              <span className="text-sm font-bold font-heading">The Bengal Medical Coding Training Academy</span>
              <span className="text-[9px] font-bold text-accent-gold tracking-wide uppercase">West Bengal&apos;s First Medical Coding Institute</span>
            </div>
          </div>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-medical-green/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-medical-green" />
                </div>
                <h4 className="font-bold text-lg text-foreground mb-1">
                  Submitted Successfully!
                </h4>
                <p className="text-muted-foreground text-sm">
                  Our counselor will contact you within 24 hours.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className="font-bold text-lg text-foreground mb-1">
                  {sourceLabels[source]}
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Fill in your details and we&apos;ll get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="popup-name">Full Name *</Label>
                    <Input
                      id="popup-name"
                      placeholder="Enter your full name"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="border-border/60 focus:border-medical-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popup-mobile">Mobile Number *</Label>
                    <Input
                      id="popup-mobile"
                      type="tel"
                      placeholder="+91 98765 43210"
                      required
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                      className="border-border/60 focus:border-medical-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="popup-email">Email Address *</Label>
                    <Input
                      id="popup-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="border-border/60 focus:border-medical-blue"
                    />
                  </div>

                  {error && (
                    <p className="text-destructive text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-medical-blue hover:bg-medical-dark text-white rounded-xl shadow-md transition-all duration-300"
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

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm shadow-md transition-all duration-300"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat on WhatsApp
                  </a>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
