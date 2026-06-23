'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Play, FileText, StickyNote, CheckCircle } from 'lucide-react'

export default function StudentCourses() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)

  useEffect(() => {
    fetch('/api/enrollments')
      .then(r => r.json())
      .then(d => d.success && setEnrollments(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const typeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="h-4 w-4 text-blue-400" />
      case 'pdf': return <FileText className="h-4 w-4 text-red-400" />
      default: return <StickyNote className="h-4 w-4 text-amber-400" />
    }
  }

  if (loading) return <div className="text-zinc-500">Loading courses...</div>

  if (selectedCourse) {
    return (
      <div>
        <button onClick={() => setSelectedCourse(null)} className="text-zinc-400 hover:text-white mb-4">← Back to My Courses</button>
        <h2 className="text-xl font-bold text-white mb-2">{selectedCourse.course?.title}</h2>
        <div className="w-full bg-zinc-800 rounded-full h-2 mb-6">
          <div className="bg-[#c8882a] h-2 rounded-full" style={{ width: `${selectedCourse.progress || 0}%` }} />
        </div>
        <div className="space-y-4">
          {(selectedCourse.course?.modules || []).map((mod: any) => (
            <div key={mod.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3">{mod.title}</h4>
              <div className="space-y-2">
                {(mod.lessons || []).map((les: any) => (
                  <div key={les.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 cursor-pointer">
                    {typeIcon(les.type)}
                    <span className="text-sm text-zinc-300 flex-1">{les.title}</span>
                    {les.duration && <span className="text-xs text-zinc-600">{les.duration}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrollments.length === 0 ? (
          <p className="text-zinc-500">No enrolled courses</p>
        ) : enrollments.map(e => (
          <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 cursor-pointer" onClick={async () => {
            if (e.courseId) {
              const res = await fetch(`/api/courses/${e.courseId}`)
              const d = await res.json()
              if (d.success) setSelectedCourse({ ...e, course: d.data })
            }
          }}>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-purple-400" />
              <h3 className="text-white font-semibold">{e.course?.title || 'Course'}</h3>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-2">
              <div className="bg-[#c8882a] h-2 rounded-full transition-all" style={{ width: `${e.progress || 0}%` }} />
            </div>
            <p className="text-xs text-zinc-500">{e.progress || 0}% complete</p>
          </div>
        ))}
      </div>
    </div>
  )
}
