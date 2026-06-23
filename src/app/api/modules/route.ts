import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// POST /api/modules - Create module
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
    const { courseId, title, description, order } = body

    if (!courseId || !title) {
      return NextResponse.json({ success: false, error: 'Course ID and title are required' }, { status: 400 })
    }

    const course = await db.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    const module_ = await db.module.create({
      data: {
        courseId,
        title,
        description: description || null,
        order: order ?? 0,
      },
    })

    return NextResponse.json({ success: true, data: { ...module_, course: course ? { id: course.id, title: course.title } : null } }, { status: 201 })
  } catch (error) {
    console.error('[MODULES_POST]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
