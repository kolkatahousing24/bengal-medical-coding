import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/exam-results - List results, support ?examId=&studentId= filter
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('examId')
    const studentId = searchParams.get('studentId')

    const where: any = {}
    if (examId) where.examId = examId

    // Students can only see their own results
    if (user.role === 'student') {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: user.id },
      })
      if (!studentProfile) {
        return NextResponse.json({ success: true, data: [] })
      }
      where.studentId = studentProfile.id
    } else if (studentId) {
      where.studentId = studentId
    }

    const results = await db.examResult.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    })

    // Fetch related data separately (no FK relationships in Supabase)
    const examIds = [...new Set(results.map((r: any) => r.examId).filter(Boolean))]
    const spIds = [...new Set(results.map((r: any) => r.studentId).filter(Boolean))]

    const [exams, studentProfiles] = await Promise.all([
      examIds.length > 0 ? db.exam.findMany({ where: { id: { in: examIds } } }) : [],
      spIds.length > 0 ? db.studentProfile.findMany({ where: { id: { in: spIds } } }) : [],
    ])

    // Fetch users for student profiles
    const userIds = [...new Set(studentProfiles.map((sp: any) => sp.userId).filter(Boolean))]
    const users = userIds.length > 0 ? await db.user.findMany({ where: { id: { in: userIds } } }) : []

    const examMap = Object.fromEntries(exams.map((e: any) => [e.id, e]))
    const spMap = Object.fromEntries(studentProfiles.map((sp: any) => [sp.id, sp]))
    const userMap = Object.fromEntries(users.map((u: any) => [u.id, u]))

    const enriched = results.map((r: any) => ({
      ...r,
      exam: examMap[r.examId] ? { id: examMap[r.examId].id, title: examMap[r.examId].title, type: examMap[r.examId].type, totalMarks: examMap[r.examId].totalMarks, passingMarks: examMap[r.examId].passingMarks } : null,
      student: spMap[r.studentId] ? {
        ...spMap[r.studentId],
        user: userMap[spMap[r.studentId].userId] ? { id: userMap[spMap[r.studentId].userId].id, name: userMap[spMap[r.studentId].userId].name, email: userMap[spMap[r.studentId].userId].email } : null,
      } : null,
    }))

    return NextResponse.json({ success: true, data: enriched })
  } catch (error) {
    console.error('[EXAM_RESULTS_GET]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/exam-results - Submit exam result
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { examId, studentId, score, totalMarks, percentage, status } = body

    if (!examId || !studentId) {
      return NextResponse.json({ success: false, error: 'Exam ID and Student ID are required' }, { status: 400 })
    }

    const result = await db.examResult.create({
      data: {
        examId,
        studentId,
        score: score ?? 0,
        totalMarks: totalMarks ?? 100,
        percentage: percentage ?? 0,
        status: status || 'pass',
      },
    })

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('[EXAM_RESULTS_POST]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
