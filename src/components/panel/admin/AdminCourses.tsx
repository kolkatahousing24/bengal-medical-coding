'use client'

import { useState, useEffect } from 'react'
import { Plus, BookOpen, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', description: '', price: '0', duration: '', level: 'beginner' })

  useEffect(() => {
    let cancelled = false
    fetch('/api/courses?all=true')
      .then(r => r.json())
      .then(d => { if (!cancelled && d.success) setCourses(d.data || []) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const refreshCourses = () => {
    setLoading(true)
    fetch('/api/courses?all=true')
      .then(r => r.json())
      .then(d => d.success && setCourses(d.data || []))
      .finally(() => setLoading(false))
  }

  const handleCreate = async () => {
    if (!form.title) {
      toast.error('Course title is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Course created successfully!')
        setDialogOpen(false)
        setForm({ title: '', slug: '', description: '', price: '0', duration: '', level: 'beginner' })
        refreshCourses()
      } else {
        toast.error(data.error || 'Failed to create course')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Course deleted successfully')
        refreshCourses()
      } else {
        toast.error(data.error || 'Failed to delete course')
      }
    } catch {
      toast.error('Failed to delete course')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Course Management</h2>
          <p className="text-sm text-zinc-400">{courses.length} courses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white">
              <Plus className="h-4 w-4 mr-2" />Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Course Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '') })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Slug URL" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="bg-zinc-800 border-zinc-700" />
                <Input placeholder="Duration" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <Button onClick={handleCreate} disabled={submitting} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : 'Create Course'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-zinc-800 rounded w-3/4 mb-3" />
              <div className="h-4 bg-zinc-800 rounded w-1/2 mb-6" />
              <div className="h-4 bg-zinc-800 rounded w-full" />
            </div>
          ))
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-500">No courses yet. Create your first course!</div>
        ) : courses.map((c) => (
          <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-400" />
              </div>
              <Badge className={`${c.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-300'} text-xs`}>
                {c.status}
              </Badge>
            </div>
            <h3 className="text-white font-semibold mb-1">{c.title}</h3>
            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{c.description || 'No description'}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span>₹{c.price?.toLocaleString()}</span>
                <span>{c.duration || '-'}</span>
                <span className="capitalize">{c.level}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="h-8 w-8 text-zinc-400 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
