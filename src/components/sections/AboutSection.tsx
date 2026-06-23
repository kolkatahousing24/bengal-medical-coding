'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, Users, HandshakeIcon, TrendingUp, Award, BookOpen, Shield, GraduationCap } from 'lucide-react'

const stats = [
  {
    icon: Calendar,
    value: '10+',
    label: 'Years Experience',
  },
  {
    icon: Users,
    value: '157+',
    label: 'Students Trained',
  },
  {
    icon: HandshakeIcon,
    value: '50+',
    label: 'Hiring Partners',
  },
  {
    icon: TrendingUp,
    value: '94%',
    label: 'Placement Rate',
  },
]

const courses = [
  {
    icon: GraduationCap,
    title: 'Advanced Diploma in Medical Coding',
    description: 'Comprehensive diploma program covering ICD-10-CM, CPT, HCPCS with hands-on practical training',
  },
  {
    icon: BookOpen,
    title: 'Specialized Coding Courses',
    description: 'Focused training on specific coding systems — ICD-10-CM, CPT, and HCPCS individual certifications',
  },
  {
    icon: Shield,
    title: 'Denial Coding Management Training',
    description: 'Expert training on claim denial management, appeals processing, and revenue recovery strategies',
  },
  {
    icon: Award,
    title: 'Specialization-Based Coding Training',
    description: 'Domain-specific coding training for outpatient, inpatient, surgical, and specialty medical coding',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

const courseVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

export default function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20 bg-medical-light dark:bg-[#1a0806] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-foreground mb-3">
            About <span className="text-gradient">Us</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            West Bengal&apos;s First Medical Coding Training Institute
          </p>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-maroon via-accent-red to-accent-gold" />
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Side — Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-maroon dark:text-accent-red mb-2">
                Welcome to The Bengal Medical Coding Training Academy
              </h3>
              <div className="inline-flex items-center gap-2 bg-accent-gold/10 border border-accent-gold/20 rounded-full px-4 py-1.5 mb-4">
                <Award className="h-4 w-4 text-accent-gold" />
                <span className="text-xs sm:text-sm font-bold text-accent-gold tracking-wide">
                  WEST BENGAL&apos;S FIRST MEDICAL CODING TRAINING INSTITUTE
                </span>
              </div>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-muted-foreground text-sm sm:text-base leading-relaxed"
            >
              We are <strong className="text-foreground">West Bengal&apos;s first and premier medical coding training institute</strong>,
              offering comprehensive training in ICD-10-CM, CPT, and HCPCS coding systems. As the pioneer in medical coding
              education in the region, we have set the benchmark for quality training and industry-ready curriculum.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-muted-foreground text-sm sm:text-base leading-relaxed"
            >
              With a strong focus on practical training, an industry-ready curriculum,
              experienced faculty, and dedicated placement support, we ensure every
              student is prepared to step confidently into the healthcare sector. Our
              hands-on approach and real-world case studies set us apart as
              <strong className="text-foreground"> West Bengal&apos;s most trusted medical coding institute</strong>.
            </motion.p>

            {/* Courses List */}
            <motion.div
              variants={containerVariants}
              className="space-y-3 pt-2"
            >
              <motion.p variants={itemVariants} className="text-sm font-bold text-maroon dark:text-accent-red uppercase tracking-wide">
                Our Training Programs
              </motion.p>
              {courses.map((course) => {
                const Icon = course.icon
                return (
                  <motion.div
                    key={course.title}
                    variants={courseVariants}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-maroon/30 dark:hover:border-accent-red/30 transition-colors group"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-maroon/10 dark:bg-accent-red/15 text-maroon dark:text-accent-red group-hover:bg-gradient-to-br group-hover:from-maroon group-hover:to-accent-red group-hover:text-white transition-all duration-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-maroon dark:group-hover:text-accent-red transition-colors">
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {course.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 gap-4 pt-4"
            >
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    variants={statVariants}
                    whileHover={{ y: -4, scale: 1.03 }}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 sm:p-5 text-center shadow-sm transition-shadow duration-300 hover:shadow-medical dark:bg-[#1a0806]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-maroon to-accent-red text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-maroon dark:text-accent-red">
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>

          {/* Right Side — Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-medical-lg aspect-[4/3]">
              <Image
                src="/images/gallery/gallery-1.jpg"
                alt="The Bengal Medical Coding Training Academy"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon/30 to-transparent" />
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-4 -right-4 sm:bottom-6 sm:right-6 bg-gradient-to-br from-accent-gold to-accent-gold-light text-maroon-dark rounded-xl px-5 py-3 shadow-lg"
            >
              <p className="text-xs font-bold uppercase tracking-wide">West Bengal&apos;s</p>
              <p className="text-lg font-bold font-heading">FIRST</p>
              <p className="text-[10px] font-semibold">Medical Coding Institute</p>
            </motion.div>

            {/* Decorative element */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent-red/10 rounded-2xl -z-10" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent-gold/10 rounded-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
