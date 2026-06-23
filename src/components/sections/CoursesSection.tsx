'use client'

import { motion } from 'framer-motion'
import {
  Stethoscope,
  Heart,
  FileText,
  ClipboardList,
  FileCode,
  DollarSign,
  Code,
  Laptop,
  CheckCircle2,
  Clock,
  Monitor,
  Award,
  Briefcase,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const courseModules = [
  {
    icon: Stethoscope,
    name: 'Medical Terminology',
    description: 'Comprehensive study of medical terms, prefixes, suffixes, and root words',
  },
  {
    icon: Heart,
    name: 'Anatomy & Physiology',
    description: 'Detailed understanding of human body systems and their functions',
  },
  {
    icon: FileText,
    name: 'ICD-10-CM Coding',
    description: 'International Classification of Diseases coding with real-world practice',
  },
  {
    icon: ClipboardList,
    name: 'CPT Coding',
    description: 'Current Procedural Terminology coding for medical procedures',
  },
  {
    icon: FileCode,
    name: 'HCPCS Coding',
    description: 'Healthcare Common Procedure Coding System for services and supplies',
  },
  {
    icon: DollarSign,
    name: 'Revenue Cycle Management',
    description: 'End-to-end understanding of healthcare revenue cycle processes',
  },
  {
    icon: Code,
    name: 'Practical Coding Lab',
    description: 'Hands-on coding practice with actual medical records and scenarios',
  },
  {
    icon: Laptop,
    name: 'Certification Prep',
    description: 'CPC, CCS exam preparation with mock tests and study materials',
  },
]

const courseDetails = [
  { icon: Clock, label: 'Duration', value: '3-6 Months' },
  { icon: Monitor, label: 'Training Mode', value: 'Online & Offline' },
  { icon: Award, label: 'Certification', value: 'CPC, CCS Available' },
  { icon: Briefcase, label: 'Placement', value: '100% Assistance' },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const moduleVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

const detailContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const detailVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

export default function CoursesSection({ onDemoClick }: { onDemoClick?: () => void }) {
  return (
    <section id="courses" className="py-16 sm:py-20 bg-medical-light dark:bg-[#1a0806] overflow-hidden">
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
            Our Courses & <span className="text-gradient">Training Modules</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-4">
            Comprehensive curriculum designed to make you industry-ready in medical coding
          </p>
          <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-maroon via-accent-red to-accent-gold" />
        </motion.div>

        {/* Course Modules Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-12"
        >
          {courseModules.map((module) => {
            const Icon = module.icon
            return (
              <motion.div
                key={module.name}
                variants={moduleVariants}
                whileHover={{ y: -4, scale: 1.03 }}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 sm:p-6 text-center transition-all duration-300 hover:shadow-medical hover:border-maroon/40 dark:hover:border-accent-red/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon/10 dark:bg-accent-red/15 text-maroon dark:text-accent-red transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-maroon group-hover:to-accent-red group-hover:text-white group-hover:shadow-md">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-maroon dark:group-hover:text-accent-red transition-colors duration-300 leading-tight">
                  {module.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {module.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Course Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
          className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Details List */}
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-maroon dark:text-accent-red mb-6">
                Course Details
              </h3>
              <motion.div
                variants={detailContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {courseDetails.map((detail) => {
                  const Icon = detail.icon
                  return (
                    <motion.div
                      key={detail.label}
                      variants={detailVariants}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gold/10 text-accent-gold">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {detail.label}:
                        </span>{' '}
                        <span className="text-sm font-semibold text-foreground">
                          {detail.value}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>

              {/* Additional details with checkmarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-border">
                {[
                  'Industry-Ready Curriculum',
                  'Real-World Case Studies',
                  'Mock Tests & Practice Exams',
                  'Comprehensive Study Material',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-gold" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center lg:items-end gap-3 shrink-0">
              <Badge className="bg-accent-gold/10 text-accent-gold border-accent-gold/20 text-xs px-3 py-1">
                Admission Open
              </Badge>
              <p className="text-sm text-muted-foreground text-center lg:text-right">
                Ready to start your medical coding career?
              </p>
              <Button
                size="lg"
                onClick={onDemoClick}
                className="bg-medical-green hover:bg-medical-green/90 text-white font-semibold px-8 shadow-md hover:shadow-lg transition-all duration-300"
              >
                Book Demo Class
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
