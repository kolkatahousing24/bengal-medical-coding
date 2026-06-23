'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const qualifications = [
  'B.Sc Nursing',
  'B.Pharmacy',
  'B.Sc Biotechnology',
  'B.Sc Microbiology',
  'B.Sc Zoology',
  'MBBS',
  'BDS',
  'BPT',
  'B.Sc Life Sciences',
  'M.Sc Life Sciences',
  'Other',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function EnquirySection({ onEnquiryClick }: { onEnquiryClick?: () => void }) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    qualification: '',
    message: '',
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
          qualification: formData.qualification || '',
          message: formData.message,
          source: 'enquiry',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit enquiry')
      }

      setIsSubmitted(true)
      setFormData({ fullName: '', mobile: '', email: '', qualification: '', message: '' })
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      id="enquiry"
      className="py-16 sm:py-20 bg-gradient-to-b from-medical-blue to-medical-dark text-white relative overflow-hidden"
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-medical-green/5 rounded-full translate-y-1/2 -translate-x-1/3" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/3 rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-3">
            Enquire Now
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto">
            Take the first step towards your medical coding career
          </p>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-medical-green/80 to-medical-green" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="space-y-6"
          >
            <motion.h3
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-bold font-heading text-white"
            >
              Start Your Journey in Medical Coding
            </motion.h3>
            <motion.p
              variants={itemVariants}
              className="text-white/80 text-sm sm:text-base leading-relaxed"
            >
              Fill in the enquiry form and our admission counselor will get in touch with
              you within 24 hours. We&apos;ll help you choose the right course and guide you
              through the admission process at The Bengal Medical Coding Training Academy.
            </motion.p>

            <motion.div variants={itemVariants} className="space-y-4">
              {[
                'Free career counseling session',
                'Course details & fee structure',
                'Batch timing information',
                'Placement assistance details',
              ].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="shrink-0 w-6 h-6 rounded-full bg-medical-green/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-medical-green" />
                  </div>
                  <span className="text-white/90 text-sm sm:text-base">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <Button
                size="lg"
                onClick={onEnquiryClick}
                className="w-full sm:w-auto bg-medical-green hover:bg-medical-green/90 text-white font-semibold px-8 shadow-lg shadow-medical-green/30 transition-all duration-300"
              >
                Quick Enquiry
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white dark:bg-card rounded-2xl p-6 sm:p-8 shadow-2xl">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-medical-green/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-medical-green" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-1">
                    Enquiry Submitted!
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Our counselor will contact you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="enquiry-name">Full Name *</Label>
                    <Input
                      id="enquiry-name"
                      placeholder="Enter your full name"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="border-border/60 focus:border-medical-blue"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="enquiry-mobile">Mobile Number *</Label>
                      <Input
                        id="enquiry-mobile"
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
                      <Label htmlFor="enquiry-email">Email Address *</Label>
                      <Input
                        id="enquiry-email"
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enquiry-qualification">Qualification *</Label>
                    <Select
                      value={formData.qualification}
                      onValueChange={(value) =>
                        setFormData({ ...formData, qualification: value })
                      }
                    >
                      <SelectTrigger id="enquiry-qualification" className="border-border/60 focus:border-medical-blue">
                        <SelectValue placeholder="Select your qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {qualifications.map((q) => (
                          <SelectItem key={q} value={q}>
                            {q}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enquiry-message">Message</Label>
                    <Textarea
                      id="enquiry-message"
                      placeholder="Any specific questions or requirements?"
                      rows={3}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
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
                    className="w-full bg-medical-green hover:bg-medical-green/90 text-white rounded-xl shadow-md transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Enquiry
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
