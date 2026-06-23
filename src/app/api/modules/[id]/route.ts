import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/modules/[id] - Update module
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
    const { title, description, order } = body

    const existing = await db.module.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 })
    }

    const updated = await db.module.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
      },
    })

    // Fetch course separately
    const course = updated.courseId ? await db.course.findUnique({ where: { id: updated.courseId } }) : null

    return NextResponse.json({ success: true, data: { ...updated, course: course ? { id: course.id, title: course.title } : null } })
  } catch (error) {
    console.error('[MODULE_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/modules/[id] - Delete module
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
    const existing = await db.module.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 })
    }

    await db.module.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Module deleted successfully' } })
  } catch (error) {
    console.error('[MODULE_DELETE]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
