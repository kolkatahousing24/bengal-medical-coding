'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Our Address',
    detail: 'Baguihati, Kolkata, Near 44 Bus Stand',
  },
  {
    icon: Phone,
    title: 'Phone / WhatsApp',
    detail: '+91 9831239669',
    detail2: '+91 9062379349',
    link: 'tel:+919831239669',
    link2: 'tel:+919062379349',
  },
  {
    icon: Mail,
    title: 'Email',
    detail: 'tbmedicalcodingacademy@gmail.com',
    link: 'mailto:tbmedicalcodingacademy@gmail.com',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    detail: 'Mon - Sat: 9:00 AM - 7:00 PM',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ContactSection({ onContactClick }: { onContactClick?: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send message')
      }

      setIsSubmitted(true)
      setFormData({ name: '', phone: '', email: '', message: '' })
      setTimeout(() => setIsSubmitted(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-16 sm:py-20 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-3">
            Contact <span className="text-medical-blue">Us</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Get in touch with us for any queries or information
          </p>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-medical-blue to-accent-red" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info & Map */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="space-y-6"
          >
            <motion.h3
              variants={cardVariants}
              className="text-xl sm:text-2xl font-bold font-heading text-foreground"
            >
              Get In Touch
            </motion.h3>
            <motion.p
              variants={cardVariants}
              className="text-muted-foreground text-sm leading-relaxed"
            >
              Have questions about our courses or want to learn more about medical coding?
              We&apos;d love to hear from you. Reach out to us using any of the methods below.
            </motion.p>

            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((info) => {
                const Icon = info.icon
                return (
                  <motion.div
                    key={info.title}
                    variants={cardVariants}
                    className="flex gap-4 items-start p-4 rounded-xl bg-white dark:bg-card border border-border/50 hover:shadow-md hover:border-medical-blue/20 transition-all duration-300"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-medical-blue/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-medical-blue" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{info.title}</p>
                      {'link' in info && info.link ? (
                        <>
                          <a
                            href={info.link}
                            className="text-sm text-muted-foreground hover:text-medical-blue transition-colors"
                          >
                            {info.detail}
                          </a>
                          {'link2' in info && info.link2 && info.detail2 && (
                            <a
                              href={info.link2}
                              className="block text-sm text-muted-foreground hover:text-medical-blue transition-colors"
                            >
                              {info.detail2}
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">{info.detail}</p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Google Map Embed */}
            <motion.div
              variants={cardVariants}
              className="rounded-xl overflow-hidden border border-border/50 shadow-md h-48 sm:h-56"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d235014.2843088746!2d88.4099!3d22.5647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908f667%3A0x43e330e68f6c2cbc!2sKolkata%2C%20West%20Bengal%2C%20India!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="The Bengal Medical Coding Training Academy Location"
              />
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white dark:bg-card rounded-2xl border border-border/50 p-6 sm:p-8 shadow-md">
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-2">
                Send Us a Message
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </p>

              <Button
                variant="outline"
                size="lg"
                onClick={onContactClick}
                className="w-full border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white font-semibold mb-6 transition-all duration-300"
              >
                Quick Contact
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-card px-2 text-muted-foreground">
                    or detailed message
                  </span>
                </div>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-medical-blue" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-1">
                    Message Sent!
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Full Name</Label>
                    <Input
                      id="contact-name"
                      placeholder="Enter your full name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="border-border/60 focus:border-medical-blue"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone Number</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="border-border/60 focus:border-medical-blue"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email Address</Label>
                      <Input
                        id="contact-email"
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
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="How can we help you?"
                      rows={4}
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
                    className="w-full bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl shadow-medical transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
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
