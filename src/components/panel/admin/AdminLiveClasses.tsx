'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Calendar, Video, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function AdminLiveClasses() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', duration: '60', meetingLink: '' })

  useEffect(() => {
    let cancelled = false
    fetch('/api/live-classes')
      .then(r => r.json())
      .then(d => { if (!cancelled && d.success) setClasses(d.data || []) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const refreshClasses = () => {
    setLoading(true)
    fetch('/api/live-classes')
      .then(r => r.json())
      .then(d => d.success && setClasses(d.data || []))
      .finally(() => setLoading(false))
  }

  const handleCreate = async () => {
    if (!form.title || !form.date) {
      toast.error('Title and date are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duration: parseInt(form.duration) }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Live class scheduled successfully!')
        setDialogOpen(false)
        setForm({ title: '', date: '', duration: '60', meetingLink: '' })
        refreshClasses()
      } else {
        toast.error(data.error || 'Failed to schedule class')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/live-classes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Live class cancelled')
        refreshClasses()
      } else {
        toast.error(data.error || 'Failed to cancel class')
      }
    } catch {
      toast.error('Failed to cancel class')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Live Class Management</h2>
          <p className="text-sm text-zinc-400">{classes.length} classes scheduled</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white"><Plus className="h-4 w-4 mr-2" />Schedule Class</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader><DialogTitle>Schedule Live Class</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Class Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Duration (minutes)" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Meeting Link (Zoom/Meet)" value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Button onClick={handleCreate} disabled={submitting} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scheduling...</> : 'Schedule Class'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-zinc-800 rounded w-1/2 mb-3" />
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
            </div>
          ))
        ) : classes.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No live classes scheduled yet.</div>
        ) : classes.map((c) => (
          <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-600/20 flex items-center justify-center">
                  <Video className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{c.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(c.date).toLocaleString()}</span>
                    <span>{c.duration} min</span>
                    <Badge className={`${c.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : c.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} text-xs`}>
                      {c.status}
                    </Badge>
                  </div>
                  {c.meetingLink && (
                    <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#c8882a] hover:underline mt-1 inline-block">
                      Join Link →
                    </a>
                  )}
                </div>
              </div>
              {c.status === 'scheduled' && (
                <Button variant="outline" size="sm" onClick={() => handleCancel(c.id)} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
