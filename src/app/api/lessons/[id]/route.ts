import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/lessons/[id] - Update lesson
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
    const { title, type, content, videoUrl, pdfUrl, duration, order } = body

    const existing = await db.lesson.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 })
    }

    const updated = await db.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(content !== undefined && { content }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(pdfUrl !== undefined && { pdfUrl }),
        ...(duration !== undefined && { duration }),
        ...(order !== undefined && { order }),
      },
      include: { module: { select: { id: true, title: true } } },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[LESSON_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/lessons/[id] - Delete lesson
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
    const existing = await db.lesson.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 })
    }

    await db.lesson.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Lesson deleted successfully' } })
  } catch (error) {
    console.error('[LESSON_DELETE]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
