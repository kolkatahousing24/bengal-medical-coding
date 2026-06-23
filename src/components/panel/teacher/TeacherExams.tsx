'use client'

import { useState, useEffect } from 'react'
import { Plus, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

export default function TeacherExams() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [questionDialog, setQuestionDialog] = useState(false)
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [questionForm, setQuestionForm] = useState({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: '10' })
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
    await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, duration: parseInt(form.duration), totalMarks: parseFloat(form.totalMarks), passingMarks: parseFloat(form.passingMarks) }),
    })
    setDialogOpen(false)
    refreshExams()
  }

  const handleAddQuestion = async () => {
    if (!selectedExam) return
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId: selectedExam.id, ...questionForm, marks: parseFloat(questionForm.marks), order: (selectedExam.questions?.length || 0) + 1 }),
    })
    setQuestionDialog(false)
    setQuestionForm({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', marks: '10' })
    refreshExams()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Examinations</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7b1a10] hover:bg-[#9b2a18] text-white"><Plus className="h-4 w-4 mr-2" />Create Exam</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader><DialogTitle>Create Exam</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Exam Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white">
                <option value="mcq">MCQ</option><option value="mock_cpc">Mock CPC</option><option value="practice">Practice</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Duration (min)" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="bg-zinc-800 border-zinc-700" />
                <Input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              </div>
              <Button onClick={handleCreate} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {loading ? <div className="text-zinc-500">Loading...</div> :
          exams.map(e => (
            <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ClipboardCheck className="h-5 w-5 text-cyan-400" />
                  <div>
                    <h3 className="text-white font-medium">{e.title}</h3>
                    <p className="text-sm text-zinc-500">{e.type?.toUpperCase()} • {e.totalMarks} marks • Pass: {e.passingMarks}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setSelectedExam(e); setQuestionDialog(true) }} className="border-zinc-700 text-zinc-300">Add Question</Button>
              </div>
            </div>
          ))
        }
      </div>

      <Dialog open={questionDialog} onOpenChange={setQuestionDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader><DialogTitle>Add Question</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <Input placeholder="Question" value={questionForm.question} onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })} className="bg-zinc-800 border-zinc-700" />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Option A" value={questionForm.optionA} onChange={e => setQuestionForm({ ...questionForm, optionA: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Option B" value={questionForm.optionB} onChange={e => setQuestionForm({ ...questionForm, optionB: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Option C" value={questionForm.optionC} onChange={e => setQuestionForm({ ...questionForm, optionC: e.target.value })} className="bg-zinc-800 border-zinc-700" />
              <Input placeholder="Option D" value={questionForm.optionD} onChange={e => setQuestionForm({ ...questionForm, optionD: e.target.value })} className="bg-zinc-800 border-zinc-700" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select value={questionForm.correctAnswer} onChange={e => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white">
                <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
              </select>
              <Input placeholder="Marks" type="number" value={questionForm.marks} onChange={e => setQuestionForm({ ...questionForm, marks: e.target.value })} className="bg-zinc-800 border-zinc-700" />
            </div>
            <Button onClick={handleAddQuestion} className="w-full bg-[#7b1a10] hover:bg-[#9b2a18] text-white">Add Question</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
