import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/questions/[id] - Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { question, optionA, optionB, optionC, optionD, correctAnswer, marks, order } = body

    const existing = await db.question.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 })
    }

    const updated = await db.question.update({
      where: { id },
      data: {
        ...(question !== undefined && { question }),
        ...(optionA !== undefined && { optionA }),
        ...(optionB !== undefined && { optionB }),
        ...(optionC !== undefined && { optionC }),
        ...(optionD !== undefined && { optionD }),
        ...(correctAnswer !== undefined && { correctAnswer }),
        ...(marks !== undefined && { marks }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[QUESTION_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/questions/[id] - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.question.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 })
    }

    await db.question.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Question deleted successfully' } })
  } catch (error) {
    console.error('[QUESTION_DELETE]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
