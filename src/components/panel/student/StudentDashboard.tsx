'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Video, Calendar, Award, Clock } from 'lucide-react'

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

export default function StudentDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then(r => r.json()),
      fetch('/api/live-classes?status=scheduled').then(r => r.json()),
    ]).then(([dashData, classData]) => {
      if (dashData.success) setStats(dashData.data)
      if (classData.success) setClasses(classData.data || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse"><div className="h-12 bg-zinc-800 rounded" /></div>)}</div>

  const statCards = [
    { icon: BookOpen, label: 'Enrolled Courses', value: stats?.enrolledCourses ?? 0, color: 'bg-purple-600' },
    { icon: Video, label: 'Upcoming Classes', value: classes.length, color: 'bg-blue-600' },
    { icon: Award, label: 'Attendance', value: `${stats?.attendanceRate ?? 85}%`, color: 'bg-emerald-600' },
    { icon: Clock, label: 'Pending Tasks', value: stats?.pendingAssignments ?? 0, color: 'bg-amber-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#7b1a10] to-[#9b2a18] rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back! 👋</h2>
        <p className="text-white/80">Continue your medical coding journey today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Upcoming Classes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Live Classes</h3>
        {classes.length === 0 ? (
          <p className="text-zinc-500 text-sm">No upcoming classes</p>
        ) : (
          <div className="space-y-3">
            {classes.map(c => {
              const classDate = new Date(c.date)
              const now = new Date()
              const diff = classDate.getTime() - now.getTime()
              const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
              const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
              return (
                <div key={c.id} className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
                  <div className="h-10 w-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
                    <Video className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{c.title}</p>
                    <p className="text-xs text-zinc-500">{classDate.toLocaleDateString()} • {c.duration} min</p>
                  </div>
                  {diff > 0 ? (
                    <div className="text-right">
                      <p className="text-xs text-amber-400">Starts in</p>
                      <p className="text-sm font-bold text-white">{days}d {hours}h</p>
                    </div>
                  ) : (
                    <a href={c.meetingLink || '#'} target="_blank" rel="noopener noreferrer">
                      <button className="px-4 py-2 bg-[#c8882a] text-white rounded-lg text-sm font-medium hover:bg-[#b57825]">Join Now</button>
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
