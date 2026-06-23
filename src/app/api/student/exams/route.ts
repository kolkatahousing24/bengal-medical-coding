import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get student profile
    const studentProfile = await db.studentProfile.findFirst({
      where: { userId },
    })

    if (!studentProfile) {
      return NextResponse.json({ results: [] })
    }

    // Get exam results without include
    const examResults = await db.examResult.findMany({
      where: { studentId: studentProfile.id },
      orderBy: { submittedAt: 'desc' },
    })

    // Fetch exam details separately
    const examIds = [...new Set(examResults.map((r: any) => r.examId).filter(Boolean))]
    const exams = examIds.length > 0 ? await db.exam.findMany({ where: { id: { in: examIds } } }) : []
    const examMap = Object.fromEntries(exams.map((e: any) => [e.id, e]))

    const results = examResults.map((r: any) => ({
      id: r.id,
      title: examMap[r.examId]?.title || 'Unknown Exam',
      type: examMap[r.examId]?.type || 'unknown',
      score: r.score,
      totalMarks: r.totalMarks,
      percentage: r.percentage,
      status: r.status,
      submittedAt: r.submittedAt,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Student exams error:', error)
    return NextResponse.json({ error: 'Failed to fetch exam results' }, { status: 500 })
  }
}
