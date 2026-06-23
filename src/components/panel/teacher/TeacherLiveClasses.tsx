'use client'

import { useState, useEffect } from 'react'
import { Plus, Video, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

export default function TeacherLiveClasses() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
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

  const handleSchedule = async () => {
    await fetch('/api/live-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, duration: parseInt(form.duration) }),
    })
    setDialogOpen(false)
    setForm({ title: '', date: '', duration: '60', meetingLink: '' })
    refreshClasses()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Live Classes</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white"><Plus className="h-4 w-4 mr-2" />Schedule Class</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader><DialogTitle>Schedule Live Class</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Duration (min)" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Zoom / Google Meet Link" value={form.meetingLink} onChange={e => setForm({ ...form, meetingLink: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Button onClick={handleSchedule} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {loading ? <div className="text-zinc-500">Loading...</div> :
          classes.map(c => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-600/20 flex items-center justify-center">
                  <Video className="h-6 w-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{c.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                    <span>{new Date(c.date).toLocaleDateString()} • {c.duration} min</span>
                    <Badge className={`${c.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-zinc-300'} text-xs`}>{c.status}</Badge>
                  </div>
                </div>
                {c.meetingLink && c.status === 'scheduled' && (
                  <a href={c.meetingLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-[#c8882a] hover:bg-[#b57825] text-white">Join</Button>
                  </a>
                )}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
