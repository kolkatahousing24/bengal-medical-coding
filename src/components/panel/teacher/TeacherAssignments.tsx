'use client'

import { useState, useEffect } from 'react'
import { Plus, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({ marks: '', feedback: '' })
  const [form, setForm] = useState({ title: '', description: '', deadline: '', maxMarks: '100' })

  useEffect(() => {
    let cancelled = false
    fetch('/api/assignments')
      .then(r => r.json())
      .then(d => { if (!cancelled && d.success) setAssignments(d.data || []) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const refreshAssignments = () => {
    setLoading(true)
    fetch('/api/assignments')
      .then(r => r.json())
      .then(d => d.success && setAssignments(d.data || []))
      .finally(() => setLoading(false))
  }

  const handleCreate = async () => {
    await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, maxMarks: parseFloat(form.maxMarks) }),
    })
    setDialogOpen(false)
    setForm({ title: '', description: '', deadline: '', maxMarks: '100' })
    refreshAssignments()
  }

  const handleViewSubmissions = async (assignmentId: string) => {
    const res = await fetch(`/api/submissions?assignmentId=${assignmentId}`)
    const d = await res.json()
    if (d.success) setSubmissions(d.data || [])
  }

  const handleReview = async () => {
    if (!selectedSubmission) return
    await fetch(`/api/submissions/${selectedSubmission.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marks: parseFloat(reviewForm.marks), feedback: reviewForm.feedback, status: 'reviewed' }),
    })
    setReviewDialog(false)
    setReviewForm({ marks: '', feedback: '' })
    setSelectedSubmission(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Assignments</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white"><Plus className="h-4 w-4 mr-2" />Create Assignment</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Max Marks" type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Button onClick={handleCreate} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? <div className="text-zinc-500">Loading...</div> :
          assignments.map(a => (
            <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">{a.title}</h3>
                    <p className="text-sm text-zinc-500">{a.deadline ? `Due: ${new Date(a.deadline).toLocaleDateString()}` : 'No deadline'} • Max: {a.maxMarks} marks</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewSubmissions(a.id)} className="border-zinc-700 text-zinc-300">View Submissions</Button>
              </div>
            </div>
          ))
        }
      </div>

      {submissions.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Submissions ({submissions.length})</h3>
          <div className="space-y-3">
            {submissions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-sm text-white">Submission</p>
                  <p className="text-xs text-zinc-500">{s.content || 'File uploaded'} • {s.status}</p>
                </div>
                {s.status !== 'reviewed' ? (
                  <Button size="sm" variant="outline" onClick={() => { setSelectedSubmission(s); setReviewDialog(true) }} className="border-[#c8882a]/30 text-[#c8882a]">
                    <CheckCircle className="h-4 w-4 mr-1" />Review
                  </Button>
                ) : (
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">{s.marks}/{s.maxMarks || 100}</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Review Submission</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Input placeholder="Marks" type="number" value={reviewForm.marks} onChange={e => setReviewForm({ ...reviewForm, marks: e.target.value })} className="bg-zinc-800 border-zinc-700" />
            <Input placeholder="Feedback" value={reviewForm.feedback} onChange={e => setReviewForm({ ...reviewForm, feedback: e.target.value })} className="bg-zinc-800 border-zinc-700" />
            <Button onClick={handleReview} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Submit Review</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
