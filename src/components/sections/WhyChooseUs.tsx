'use client'

import { motion } from 'framer-motion'
import {
  ShieldCheck,
  BookOpen,
  Award,
  Briefcase,
  Clock,
  Monitor,
} from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Expert Faculty',
    description:
      '10+ years of industry experience with certified medical coding professionals',
  },
  {
    icon: BookOpen,
    title: 'Practical Training',
    description:
      'Hands-on coding practice with real medical records and case studies',
  },
  {
    icon: Award,
    title: 'CPC Certification',
    description:
      'Complete guidance and preparation for CPC, CCS, and other certifications',
  },
  {
    icon: Briefcase,
    title: 'Placement Support',
    description:
      '100+ hiring partners with dedicated placement assistance and interview prep',
  },
  {
    icon: Clock,
    title: 'Flexible Batches',
    description:
      'Morning, evening, and weekend batches to suit your schedule',
  },
  {
    icon: Monitor,
    title: 'Online & Offline',
    description:
      'Both classroom and live online training options available',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export default function WhyChooseUs() {
  return (
    <section id="whychooseus" className="py-16 sm:py-20 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-3">
            Why Choose <span className="text-gradient">Us?</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-4">
            Discover the advantages that set our medical coding training apart from the rest
          </p>
          <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-maroon via-accent-red to-accent-gold" />
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="group rounded-xl border border-border bg-card p-6 sm:p-7 transition-all duration-300 hover:shadow-medical hover:border-maroon/40 dark:hover:border-accent-red/40"
              >
                {/* Icon Circle */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-maroon/10 dark:bg-accent-red/15 text-maroon dark:text-accent-red transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-maroon group-hover:to-accent-red group-hover:text-white group-hover:shadow-md">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-maroon dark:group-hover:text-accent-red transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
