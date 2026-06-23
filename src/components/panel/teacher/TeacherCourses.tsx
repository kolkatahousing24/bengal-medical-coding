'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function TeacherCourses() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [moduleDialog, setModuleDialog] = useState(false)
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' })
  const [lessonDialog, setLessonDialog] = useState(false)
  const [lessonForm, setLessonForm] = useState({ moduleId: '', title: '', type: 'video', content: '', videoUrl: '' })

  useEffect(() => {
    let cancelled = false
    fetch('/api/courses')
      .then(r => r.json())
      .then(d => { if (!cancelled && d.success) setCourses(d.data || []) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const refreshCourses = () => {
    setLoading(true)
    fetch('/api/courses')
      .then(r => r.json())
      .then(d => d.success && setCourses(d.data || []))
      .finally(() => setLoading(false))
  }

  const handleAddModule = async () => {
    if (!selectedCourse) return
    await fetch('/api/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: selectedCourse.id, ...moduleForm, order: (selectedCourse.modules?.length || 0) + 1 }),
    })
    setModuleDialog(false)
    setModuleForm({ title: '', description: '' })
    refreshCourses()
  }

  const handleAddLesson = async () => {
    await fetch('/api/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lessonForm, order: 1 }),
    })
    setLessonDialog(false)
    setLessonForm({ moduleId: '', title: '', type: 'video', content: '', videoUrl: '' })
    refreshCourses()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">My Courses</h2>

      {!selectedCourse ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <div className="text-zinc-500">Loading...</div> :
            courses.map(c => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 cursor-pointer" onClick={async () => {
                const res = await fetch(`/api/courses/${c.id}`)
                const d = await res.json()
                if (d.success) setSelectedCourse(d.data)
              }}>
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  <h3 className="text-white font-semibold">{c.title}</h3>
                </div>
                <Badge className={`${c.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-300'} text-xs`}>{c.status}</Badge>
              </div>
            ))
          }
        </div>
      ) : (
        <div>
          <Button variant="ghost" onClick={() => setSelectedCourse(null)} className="text-zinc-400 mb-4">← Back to Courses</Button>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">{selectedCourse.title}</h3>
            <div className="flex gap-2">
              <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
                <DialogTrigger asChild><Button size="sm" className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white"><Plus className="h-4 w-4 mr-1" />Module</Button></DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                  <DialogHeader><DialogTitle>Add Module</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input placeholder="Module Title" value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} className="bg-zinc-800 border-zinc-700" />
                    <Input placeholder="Description" value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} className="bg-zinc-800 border-zinc-700" />
                    <Button onClick={handleAddModule} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">Add Module</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
                <DialogTrigger asChild><Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300"><Plus className="h-4 w-4 mr-1" />Lesson</Button></DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                  <DialogHeader><DialogTitle>Add Lesson</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    <select value={lessonForm.moduleId} onChange={e => setLessonForm({ ...lessonForm, moduleId: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white">
                      <option value="">Select Module</option>
                      {(selectedCourse.modules || []).map((m: any) => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                    <Input placeholder="Lesson Title" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} className="bg-zinc-800 border-zinc-700" />
                    <select value={lessonForm.type} onChange={e => setLessonForm({ ...lessonForm, type: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white">
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                      <option value="note">Note</option>
                    </select>
                    <Input placeholder="Video URL" value={lessonForm.videoUrl} onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} className="bg-zinc-800 border-zinc-700" />
                    <Button onClick={handleAddLesson} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">Add Lesson</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-4">
            {(selectedCourse.modules || []).map((mod: any) => (
              <div key={mod.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">{mod.title}</h4>
                <div className="space-y-2">
                  {(mod.lessons || []).map((les: any) => (
                    <div key={les.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs">{les.type}</Badge>
                      <span className="text-sm text-zinc-300">{les.title}</span>
                    </div>
                  ))}
                  {(!mod.lessons || mod.lessons.length === 0) && <p className="text-sm text-zinc-600 pl-4">No lessons yet</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
