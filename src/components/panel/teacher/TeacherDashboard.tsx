'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Video, FileText, Users, Clock } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
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

export default function TeacherDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => d.success && setStats(d.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse"><div className="h-12 bg-zinc-800 rounded" /></div>)}</div>

  const statCards = [
    { icon: BookOpen, label: 'Assigned Courses', value: stats?.totalCourses ?? 0, color: 'bg-purple-600' },
    { icon: Video, label: "Today's Classes", value: stats?.activeLiveClasses ?? 0, color: 'bg-blue-600' },
    { icon: Users, label: 'Total Students', value: stats?.totalStudents ?? 0, color: 'bg-emerald-600' },
    { icon: FileText, label: 'Pending Reviews', value: stats?.pendingAssignments ?? 0, color: 'bg-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Classes</h3>
        <div className="space-y-3">
          {[{ title: 'ICD-10-CM Live Coding Practice', date: 'Tomorrow, 10:00 AM', duration: '90 min' }].map((c, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{c.title}</p>
                <p className="text-xs text-zinc-500">{c.date} • {c.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
