'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  CheckCircle2,
  Briefcase,
  Building2,
  Users,
  Award,
} from 'lucide-react'

const placementFeatures = [
  'Resume Building & Interview Preparation',
  'Mock Interviews with Industry Experts',
  'Direct Placement Assistance with Partner Companies',
  'Career Counseling & Guidance',
  'Post-Placement Support',
]

const placementStats = [
  {
    icon: Award,
    value: '94%',
    label: 'Placement Rate',
    description: 'Students placed within 6 months',
  },
  {
    icon: Building2,
    value: '50+',
    label: 'Hiring Partners',
    description: 'Top healthcare companies & MNCs',
  },
  {
    icon: Users,
    value: '157+',
    label: 'Students Trained',
    description: 'Across India and abroad',
  },
]

const topRecruiters = [
  'Apollo Hospitals',
  'TCS',
  'WNS',
  'Cognizant',
  'Accenture',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
}

const statCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export default function PlacementSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      id="placement"
      className="py-16 sm:py-20 bg-background overflow-hidden"
    >
      <div ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-3">
            Placement &{' '}
            <span className="text-medical-blue dark:text-medical-cyan">
              Career Support
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            From training to placement — we walk with you every step of the way
          </p>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-medical-blue to-accent-red" />
        </motion.div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left Side — Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {/* Heading */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-flex items-center gap-2 bg-medical-blue/10 dark:bg-medical-cyan/10 text-medical-blue dark:text-medical-cyan rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Briefcase className="h-4 w-4" />
                Placement Program
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
                Your Career, Our Commitment
              </h3>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                As West Bengal's first medical coding training institute, we provide comprehensive placement support to help our students
                launch successful careers in medical coding. Our dedicated
                placement cell works with 50+ healthcare companies and MNCs.
              </p>
            </motion.div>

            {/* Features List */}
            <motion.ul
              variants={containerVariants}
              className="space-y-3 sm:space-y-4 mt-6"
            >
              {placementFeatures.map((feature) => (
                <motion.li
                  key={feature}
                  variants={itemVariants}
                  className="flex items-start gap-3 group"
                >
                  <CheckCircle2 className="h-5 w-5 text-accent-gold shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-foreground text-sm sm:text-base leading-relaxed group-hover:text-medical-blue dark:group-hover:text-medical-cyan transition-colors duration-200">
                    {feature}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right Side — Stats Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="space-y-4 sm:space-y-5"
          >
            {placementStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  variants={statCardVariants}
                  className="group relative bg-white dark:bg-card rounded-2xl border border-border/50 p-5 sm:p-6 shadow-sm hover:shadow-medical-lg transition-all duration-300 overflow-hidden"
                >
                  {/* Decorative gradient accent on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-medical-blue/5 to-accent-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative flex items-center gap-4 sm:gap-5">
                    {/* Icon */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-medical flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                    </div>

                    {/* Value & Label */}
                    <div className="flex-1">
                      <div className="text-3xl sm:text-4xl font-heading font-bold text-medical-blue dark:text-medical-cyan">
                        {stat.value}
                      </div>
                      <div className="text-foreground font-semibold text-sm sm:text-base mt-0.5">
                        {stat.label}
                      </div>
                      <div className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                        {stat.description}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* Top Recruiters */}
            <motion.div
              variants={statCardVariants}
              className="bg-medical-light dark:bg-medical-dark/20 rounded-2xl border border-border/50 p-5 sm:p-6"
            >
              <h4 className="font-heading font-bold text-foreground text-sm sm:text-base mb-3">
                Top Recruiters
              </h4>
              <div className="flex flex-wrap gap-2">
                {topRecruiters.map((recruiter) => (
                  <span
                    key={recruiter}
                    className="inline-flex items-center bg-white dark:bg-card rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-medical-blue dark:text-medical-cyan border border-border/50 shadow-sm"
                  >
                    {recruiter}
                  </span>
                ))}
                <span className="inline-flex items-center bg-medical-blue/10 dark:bg-medical-cyan/10 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-medical-blue dark:text-medical-cyan">
                  and more...
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
