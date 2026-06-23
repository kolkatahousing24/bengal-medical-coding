import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const exams = await db.exam.findMany({
      include: { course: true, _count: { select: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: exams.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      course: e.course?.title || '',
      startDate: e.startDate.toISOString(),
      totalMarks: e.totalMarks,
      passingMarks: e.passingMarks,
      duration: e.duration,
      status: e.status,
      questions: e._count?.questions || 0,
    }))})
  } catch (error) {
    console.error('Exams fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch exams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, type, startDate, duration, totalMarks, passingMarks, description, courseId, teacherId } = body

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    const exam = await db.exam.create({
      data: {
        title,
        type: type || 'mcq',
        description: description || null,
        duration: Number(duration) || 60,
        totalMarks: Number(totalMarks) || 100,
        passingMarks: Number(passingMarks) || 50,
        startDate: startDate ? new Date(startDate) : new Date(),
        courseId: courseId || null,
        teacherId: teacherId || null,
        status: 'draft',
      },
    })

    return NextResponse.json({ success: true, data: exam })
  } catch (error) {
    console.error('Exam create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create exam' }, { status: 500 })
  }
}
