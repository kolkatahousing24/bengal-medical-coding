'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

export default function TeacherStudents() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users?role=student')
      .then(r => r.json())
      .then(d => d.success && setStudents(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">My Students</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Name</th>
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Email</th>
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr> :
              students.length === 0 ? <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No students</td></tr> :
              students.map(s => (
                <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-6 py-4 text-sm text-white font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{s.email}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400 capitalize">{s.status || 'active'}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
