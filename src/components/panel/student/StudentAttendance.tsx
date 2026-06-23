'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/attendance')
      .then(r => r.json())
      .then(d => d.success && setAttendance(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const total = attendance.length
  const present = attendance.filter(a => a.status === 'present').length
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">My Attendance</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-white">{percentage}%</p>
          <p className="text-sm text-zinc-400 mt-1">Attendance Rate</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-emerald-400">{present}</p>
          <p className="text-sm text-zinc-400 mt-1">Days Present</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-red-400">{total - present}</p>
          <p className="text-sm text-zinc-400 mt-1">Days Absent</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Date</th>
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Status</th>
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Duration</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr> :
              attendance.length === 0 ? <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No attendance records</td></tr> :
              attendance.map(a => (
                <tr key={a.id} className="border-b border-zinc-800/50">
                  <td className="px-6 py-4 text-sm text-zinc-300">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {a.status === 'present' ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <XCircle className="h-5 w-5 text-red-400" />}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{a.duration ? `${a.duration} min` : '-'}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
