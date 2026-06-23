import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/exams/[id] - Update exam
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
    const { title, description, courseId, teacherId, type, duration, totalMarks, passingMarks, startDate, endDate, status } = body

    const existing = await db.exam.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 })
    }

    const updated = await db.exam.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(courseId !== undefined && { courseId }),
        ...(teacherId !== undefined && { teacherId }),
        ...(type !== undefined && { type }),
        ...(duration !== undefined && { duration }),
        ...(totalMarks !== undefined && { totalMarks }),
        ...(passingMarks !== undefined && { passingMarks }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status !== undefined && { status }),
      },
      include: {
        course: { select: { id: true, title: true } },
        teacher: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[EXAM_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/exams/[id] - Delete exam
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
    const existing = await db.exam.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 })
    }

    await db.exam.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Exam deleted successfully' } })
  } catch (error) {
    console.error('[EXAM_DELETE]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
