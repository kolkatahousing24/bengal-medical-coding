'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Linkedin, Award, Briefcase } from 'lucide-react'

const faculty = [
  {
    name: 'Argha Roy',
    title: 'FOUNDER & CEO',
    qualification: 'CPC Certified',
    image: '/images/faculty-argha.png',
    fallbackInitials: 'AR',
    accent: 'from-maroon to-accent-red',
  },
  {
    name: 'Sujata Routh',
    title: 'CFO',
    qualification: 'Post Graduate',
    image: '/images/faculty-sujata.png',
    fallbackInitials: 'SR',
    accent: 'from-accent-red to-maroon',
  },
  {
    name: 'Pratik Arora',
    title: 'DIRECTOR & BOARD MEMBER',
    qualification: 'CPC Certified',
    image: '/images/faculty-pratik.png',
    fallbackInitials: 'PA',
    accent: 'from-maroon to-medical-dark',
  },
  {
    name: 'Waqar Qaiyum',
    title: 'COO',
    qualification: 'Computer Engineer',
    image: '/images/faculty-waqar.png',
    fallbackInitials: 'WQ',
    accent: 'from-medical-dark to-maroon',
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

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

export default function FacultySection() {
  return (
    <section id="faculty" className="py-16 sm:py-20 bg-gradient-to-br from-[#2a0f0a] via-[#1a0806] to-[#2a0f0a] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-maroon/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-maroon/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-3">
            Meet Our <span className="text-accent-gold">Team</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto">
            Industry-certified professionals leading your journey towards a rewarding healthcare career.
          </p>
          <div className="mt-4 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-accent-gold via-accent-gold-light to-accent-gold" />
        </motion.div>

        {/* Faculty Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {faculty.map((member) => (
            <motion.div
              key={member.name}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative rounded-2xl overflow-hidden bg-[#3d1510]/80 backdrop-blur-sm border border-white/10 shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-accent-gold/30">
                {/* Image Section */}
                <div className="relative h-56 sm:h-64 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${member.title}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  {/* Gradient overlay on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3d1510] via-[#3d1510]/30 to-transparent" />

                  {/* Qualification badge */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 bg-accent-gold/90 text-maroon-dark px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-md">
                      <Award className="h-3 w-3" />
                      {member.qualification}
                    </span>
                  </div>

                  {/* Fallback initials (shown if image fails) */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-maroon to-medical-dark -z-10">
                    <span className="text-5xl font-bold text-white/20 font-heading">
                      {member.fallbackInitials}
                    </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="relative p-5 sm:p-6 -mt-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white font-heading leading-tight mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm font-bold text-accent-gold tracking-wide mb-2">
                    {member.title}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <Briefcase className="h-3 w-3 text-white/50" />
                    <p className="text-[10px] sm:text-xs text-white/50 leading-tight">
                      The Bengal Medical Coding Training Academy
                    </p>
                  </div>
                </div>

                {/* Hover accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-gold to-accent-gold-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-white/60 text-sm sm:text-base mb-4">
            Learn from the best in the industry
          </p>
          <a
            href="#enquiry"
            onClick={(e) => {
              e.preventDefault()
              const el = document.querySelector('#enquiry')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-gold text-maroon-dark font-bold text-sm sm:text-base hover:bg-accent-gold-light transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Join Our Academy
          </a>
        </motion.div>
      </div>
    </section>
  )
}
