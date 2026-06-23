'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitDialog, setSubmitDialog] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [form, setForm] = useState({ content: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/assignments').then(r => r.json()),
      fetch('/api/submissions').then(r => r.json()),
    ]).then(([aData, sData]) => {
      if (aData.success) setAssignments(aData.data || [])
      if (sData.success) setSubmissions(sData.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!selectedAssignment) return
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId: selectedAssignment.id, content: form.content, status: 'submitted' }),
    })
    setSubmitDialog(false)
    setForm({ content: '' })
    const res = await fetch('/api/submissions')
    const d = await res.json()
    if (d.success) setSubmissions(d.data || [])
  }

  const getSubmission = (assignmentId: string) => submissions.find((s: any) => s.assignmentId === assignmentId)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Assignments</h2>
      <div className="space-y-4">
        {loading ? <div className="text-zinc-500">Loading...</div> :
          assignments.length === 0 ? <p className="text-zinc-500">No assignments</p> :
          assignments.map(a => {
            const sub = getSubmission(a.id)
            return (
              <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <div>
                      <h3 className="text-white font-medium">{a.title}</h3>
                      <p className="text-sm text-zinc-500">
                        {a.deadline ? `Due: ${new Date(a.deadline).toLocaleDateString()}` : 'No deadline'} • Max: {a.maxMarks} marks
                      </p>
                    </div>
                  </div>
                  <div>
                    {sub ? (
                      <Badge className={`${sub.status === 'reviewed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} text-xs`}>
                        {sub.status === 'reviewed' ? `${sub.marks}/${a.maxMarks}` : 'Submitted'}
                      </Badge>
                    ) : (
                      <Button size="sm" className="bg-[#c8882a] hover:bg-[#b57825] text-white" onClick={() => { setSelectedAssignment(a); setSubmitDialog(true) }}>
                        <Upload className="h-4 w-4 mr-1" />Submit
                      </Button>
                    )}
                  </div>
                </div>
                {sub?.feedback && (
                  <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-500">Feedback:</p>
                    <p className="text-sm text-zinc-300">{sub.feedback}</p>
                  </div>
                )}
              </div>
            )
          })
        }
      </div>

      <Dialog open={submitDialog} onOpenChange={setSubmitDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Submit Assignment</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-zinc-400">{selectedAssignment?.title}</p>
            <textarea placeholder="Your answer / notes" value={form.content} onChange={e => setForm({ content: e.target.value })} rows={6} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm" />
            <Button onClick={handleSubmit} className="w-full bg-[#c8882a] hover:bg-[#b57825] text-white">Submit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
