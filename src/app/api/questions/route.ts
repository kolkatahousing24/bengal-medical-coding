import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/questions - List questions by examId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('examId')

    if (!examId) {
      return NextResponse.json({ success: false, error: 'Exam ID is required' }, { status: 400 })
    }

    const questions = await db.question.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, data: questions })
  } catch (error) {
    console.error('[QUESTIONS_GET]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/questions - Create question
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { examId, question, optionA, optionB, optionC, optionD, correctAnswer, marks, order } = body

    if (!examId || !question) {
      return NextResponse.json({ success: false, error: 'Exam ID and question text are required' }, { status: 400 })
    }

    const exam = await db.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 })
    }

    const newQuestion = await db.question.create({
      data: {
        examId,
        question,
        optionA: optionA || null,
        optionB: optionB || null,
        optionC: optionC || null,
        optionD: optionD || null,
        correctAnswer: correctAnswer || null,
        marks: marks ?? 1,
        order: order ?? 0,
      },
    })

    return NextResponse.json({ success: true, data: newQuestion }, { status: 201 })
  } catch (error) {
    console.error('[QUESTIONS_POST]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
