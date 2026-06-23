'use client'

import { useState, useEffect } from 'react'
import { Plus, ClipboardCheck, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function AdminExams() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'mcq', duration: '60', totalMarks: '100', passingMarks: '50', startDate: '' })

  useEffect(() => {
    let cancelled = false
    fetch('/api/exams')
      .then(r => r.json())
      .then(d => { if (!cancelled && d.success) setExams(d.data || []) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const refreshExams = () => {
    setLoading(true)
    fetch('/api/exams')
      .then(r => r.json())
      .then(d => d.success && setExams(d.data || []))
      .finally(() => setLoading(false))
  }

  const handleCreate = async () => {
    if (!form.title) {
      toast.error('Exam title is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duration: parseInt(form.duration), totalMarks: parseFloat(form.totalMarks), passingMarks: parseFloat(form.passingMarks) }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Exam created successfully!')
        setDialogOpen(false)
        setForm({ title: '', type: 'mcq', duration: '60', totalMarks: '100', passingMarks: '50', startDate: '' })
        refreshExams()
      } else {
        toast.error(data.error || 'Failed to create exam')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Examination Management</h2>
          <p className="text-sm text-zinc-400">{exams.length} exams</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white"><Plus className="h-4 w-4 mr-2" />Create Exam</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader><DialogTitle>Create Exam</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Exam Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white">
                <option value="mcq">MCQ</option>
                <option value="mock_cpc">Mock CPC Exam</option>
                <option value="practice">Practice Test</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Duration (min)" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="bg-zinc-800 border-zinc-700" />
                <Input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Total Marks" type="number" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} className="bg-zinc-800 border-zinc-700" />
                <Input placeholder="Passing Marks" type="number" value={form.passingMarks} onChange={e => setForm({ ...form, passingMarks: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <Button onClick={handleCreate} disabled={submitting} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">
                {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : 'Create Exam'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Exam</th>
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Type</th>
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Marks</th>
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Date</th>
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Questions</th>
              <th className="text-left text-xs font-medium text-zinc-400 px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr>
            ) : exams.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No exams yet. Create your first exam!</td></tr>
            ) : exams.map((e) => (
              <tr key={e.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-6 py-4 text-sm text-white font-medium">{e.title}</td>
                <td className="px-6 py-4 text-sm text-zinc-400 uppercase">{e.type?.replace('_', ' ')}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">{e.passingMarks}/{e.totalMarks}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">{e.startDate ? new Date(e.startDate).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">{e.questions ?? 0}</td>
                <td className="px-6 py-4">
                  <Badge className={`${e.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-300'} text-xs`}>{e.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
