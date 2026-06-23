'use client'

import { useState, useEffect } from 'react'
import { ClipboardCheck, Clock, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function StudentExams() {
  const [exams, setExams] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [takingExam, setTakingExam] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      fetch('/api/exams?status=published').then(r => r.json()),
      fetch('/api/exam-results').then(r => r.json()),
    ]).then(([eData, rData]) => {
      if (eData.success) setExams(eData.data || [])
      if (rData.success) setResults(rData.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const getResult = (examId: string) => results.find((r: any) => r.examId === examId)

  const startExam = async (exam: any) => {
    const res = await fetch(`/api/exams/${exam.id}`)
    const d = await res.json()
    if (d.success) {
      setTakingExam(d.data)
      setAnswers({})
    }
  }

  const submitExam = async () => {
    if (!takingExam) return
    let score = 0
    for (const q of takingExam.questions || []) {
      if (answers[q.id] === q.correctAnswer) score += q.marks
    }
    await fetch('/api/exam-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examId: takingExam.id,
        score,
        totalMarks: takingExam.totalMarks,
        percentage: (score / takingExam.totalMarks) * 100,
        status: score >= takingExam.passingMarks ? 'pass' : 'fail',
      }),
    })
    setTakingExam(null)
    const res = await fetch('/api/exam-results')
    const d = await res.json()
    if (d.success) setResults(d.data || [])
  }

  if (takingExam) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{takingExam.title}</h2>
          <Badge className="bg-amber-500/20 text-amber-400">{takingExam.totalMarks} marks • {takingExam.duration} min</Badge>
        </div>
        <div className="space-y-6">
          {(takingExam.questions || []).map((q: any, i: number) => (
            <div key={q.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-white font-medium mb-4">{i + 1}. {q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D'].map(opt => {
                  const optionText = q[`option${opt}`]
                  if (!optionText) return null
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                      className={`p-3 rounded-lg border text-left text-sm transition-colors ${answers[q.id] === opt ? 'bg-[#7b1a10] border-[#9b2a18] text-white' : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-600'}`}
                    >
                      <span className="font-semibold mr-2">{opt}.</span>{optionText}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <Button onClick={submitExam} className="w-full bg-[#c8882a] hover:bg-[#b57825] text-white py-3 text-base font-semibold">
          Submit Exam
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Examinations</h2>
      <div className="space-y-4">
        {loading ? <div className="text-zinc-500">Loading...</div> :
          exams.map(e => {
            const result = getResult(e.id)
            return (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ClipboardCheck className="h-5 w-5 text-cyan-400" />
                    <div>
                      <h3 className="text-white font-medium">{e.title}</h3>
                      <p className="text-sm text-zinc-500">{e.type?.toUpperCase()} • {e.totalMarks} marks • Pass: {e.passingMarks}</p>
                    </div>
                  </div>
                  {result ? (
                    <Badge className={`${result.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} text-xs`}>
                      <Trophy className="h-3 w-3 mr-1" />{result.percentage}% - {result.status === 'pass' ? 'PASS' : 'FAIL'}
                    </Badge>
                  ) : (
                    <Button size="sm" className="bg-[#c8882a] hover:bg-[#b57825] text-white" onClick={() => startExam(e)}>
                      Take Exam
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
