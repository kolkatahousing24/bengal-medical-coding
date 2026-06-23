'use client'

import { useState, useEffect } from 'react'
import { Users, GraduationCap, BookOpen, Video, FileText, ClipboardCheck, TrendingUp, Award, MessageSquare, Calendar } from 'lucide-react'

interface StatCardProps {
  icon: any
  label: string
  value: string | number
  color: string
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-zinc-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

function RecentEnquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/enquiry')
      .then(r => r.json())
      .then(d => {
        if (d.success) setEnquiries((d.data || []).slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="h-2 w-2 rounded-full bg-zinc-700" />
            <div className="h-4 bg-zinc-800 rounded flex-1" />
          </div>
        ))}
      </div>
    )
  }

  if (enquiries.length === 0) {
    return <p className="text-sm text-zinc-500">No enquiries yet</p>
  }

  const sourceColors: Record<string, string> = {
    'enquiry': 'bg-blue-500',
    'contact': 'bg-purple-500',
    'demo-class': 'bg-amber-500',
  }

  return (
    <div className="space-y-3">
      {enquiries.map((eq) => (
        <div key={eq.id} className="flex items-center gap-3 py-2">
          <div className={`h-2 w-2 rounded-full ${sourceColors[eq.source] || 'bg-zinc-500'}`} />
          <p className="text-sm text-zinc-300 flex-1">
            <span className="font-medium">{eq.fullName}</span> — {eq.mobile} ({eq.source === 'demo-class' ? 'Demo Class' : eq.source === 'contact' ? 'Contact' : 'Enquiry'})
          </p>
          <span className="text-xs text-zinc-600">
            {new Date(eq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        if (d.success) setStats(d.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-zinc-800" />
              <div className="flex-1">
                <div className="h-6 bg-zinc-800 rounded w-16 mb-2" />
                <div className="h-4 bg-zinc-800 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    { icon: GraduationCap, label: 'Total Students', value: stats?.totalStudents ?? 0, color: 'bg-blue-600' },
    { icon: Users, label: 'Total Teachers', value: stats?.totalTeachers ?? 0, color: 'bg-emerald-600' },
    { icon: BookOpen, label: 'Total Courses', value: stats?.totalCourses ?? 0, color: 'bg-purple-600' },
    { icon: MessageSquare, label: 'Total Enquiries', value: stats?.totalEnquiries ?? 0, color: 'bg-pink-600' },
    { icon: Calendar, label: 'Demo Class Requests', value: stats?.demoClassRequests ?? 0, color: 'bg-amber-600' },
    { icon: Video, label: 'Active Classes', value: stats?.activeLiveClasses ?? 0, color: 'bg-orange-600' },
    { icon: ClipboardCheck, label: 'Upcoming Exams', value: stats?.upcomingExams ?? 0, color: 'bg-cyan-600' },
    { icon: TrendingUp, label: 'Placement Rate', value: `${stats?.placementRate ?? 94}%`, color: 'bg-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Enquiries</h3>
        <RecentEnquiries />
      </div>
    </div>
  )
}
