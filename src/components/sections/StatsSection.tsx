'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { GraduationCap, Briefcase, Users, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const stats = [
  {
    icon: GraduationCap,
    value: 500,
    suffix: '+',
    label: 'Students Trained',
    description: 'Professionally trained in medical coding',
  },
  {
    icon: Briefcase,
    value: 100,
    suffix: '+',
    label: 'Placements',
    description: 'Successfully placed in top companies',
  },
  {
    icon: Users,
    value: 10,
    suffix: '+',
    label: 'Expert Faculty',
    description: 'Industry-experienced instructors',
  },
  {
    icon: Award,
    value: 95,
    suffix: '%',
    label: 'Industry Curriculum',
    description: 'Aligned with current industry standards',
  },
]

function AnimatedNumber({
  target,
  suffix,
  inView,
}: {
  target: number
  suffix: string
  inView: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return

    let start = 0
    const duration = 2000
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span className="tabular-nums">
      {count}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  }

  return (
    <section
      id="stats"
      className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-medical-light to-background dark:from-medical-dark/20 dark:to-background"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            Our{' '}
            <span className="text-gradient">Achievements</span> in Numbers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Trusted by hundreds of students and healthcare professionals across
            the region for quality medical coding education.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          ref={sectionRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Card className="h-full text-center border-border/50 shadow-md hover:shadow-xl transition-shadow duration-300 bg-card">
                  <CardContent className="flex flex-col items-center gap-3 pt-0 p-4 sm:p-6">
                    {/* Icon Circle */}
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-medical-blue/10 dark:bg-medical-blue/20 text-medical-blue dark:text-medical-cyan">
                      <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>

                    {/* Number */}
                    <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-medical-blue dark:text-medical-cyan">
                      <AnimatedNumber
                        target={stat.value}
                        suffix={stat.suffix}
                        inView={isInView}
                      />
                    </div>

                    {/* Label */}
                    <div className="text-sm sm:text-base font-semibold text-foreground">
                      {stat.label}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
