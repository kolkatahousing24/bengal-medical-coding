import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/assignments/[id] - Update assignment
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
    const { title, description, courseId, teacherId, fileUrl, deadline, maxMarks, status } = body

    const existing = await db.assignment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 })
    }

    const updated = await db.assignment.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(courseId !== undefined && { courseId }),
        ...(teacherId !== undefined && { teacherId }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(maxMarks !== undefined && { maxMarks }),
        ...(status !== undefined && { status }),
      },
    })

    // Fetch related data separately (no FK relationships in Supabase)
    let courseData: { id: string; title: string } | null = null
    let teacherData: { user: { id: string; name: string } | null } | null = null
    if (updated.courseId) {
      const course = await db.course.findUnique({ where: { id: updated.courseId } })
      if (course) courseData = { id: course.id, title: course.title }
    }
    if (updated.teacherId) {
      const tp = await db.teacherProfile.findUnique({ where: { id: updated.teacherId } })
      if (tp) {
        const tpUser = await db.user.findUnique({ where: { id: tp.userId } })
        teacherData = { user: tpUser ? { id: tpUser.id, name: tpUser.name } : null }
      }
    }

    return NextResponse.json({ success: true, data: { ...updated, course: courseData, teacher: teacherData } })
  } catch (error) {
    console.error('[ASSIGNMENT_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/assignments/[id] - Delete assignment
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
    const existing = await db.assignment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 })
    }

    await db.assignment.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Assignment deleted successfully' } })
  } catch (error) {
    console.error('[ASSIGNMENT_DELETE]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
