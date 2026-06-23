'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AdminAttendance() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    let cancelled = false
    fetch(`/api/attendance?month=${month}`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.success) { setData(d.data); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [month])

  const summary = data?.summary || []
  const totalStudents = summary.length
  const totalPresent = summary.reduce((a: number, s: any) => a + s.present, 0)
  const totalAbsent = summary.reduce((a: number, s: any) => a + s.absent, 0)
  const avgAttendance = totalStudents > 0
    ? Math.round(summary.reduce((a: number, s: any) => a + s.percentage, 0) / totalStudents)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Attendance Overview</h2>
          <p className="text-sm text-zinc-400">Track student attendance records</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalStudents}</p>
              <p className="text-xs text-zinc-400">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalPresent}</p>
              <p className="text-xs text-zinc-400">Present</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-600/20 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalAbsent}</p>
              <p className="text-xs text-zinc-400">Absent</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{avgAttendance}%</p>
              <p className="text-xs text-zinc-400">Avg Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Student</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Present</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Absent</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Late</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Total</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-zinc-800 rounded w-16 animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : summary.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No attendance records for this month</td></tr>
              ) : (
                summary.map((s: any) => (
                  <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-6 py-4 text-sm text-white font-medium">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-emerald-400">{s.present}</td>
                    <td className="px-6 py-4 text-sm text-red-400">{s.absent}</td>
                    <td className="px-6 py-4 text-sm text-amber-400">{s.late}</td>
                    <td className="px-6 py-4 text-sm text-zinc-400">{s.total}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-zinc-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${s.percentage >= 75 ? 'bg-emerald-500' : s.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${s.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-zinc-400">{s.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
