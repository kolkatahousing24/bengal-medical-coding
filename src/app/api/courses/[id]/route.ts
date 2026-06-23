import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/courses/[id] - Get course with modules, lessons, teacher
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const course = await db.course.findUnique({
      where: { id },
      include: {
        teacher: {
          include: {
            user: { select: { id: true, name: true, profilePhoto: true, email: true } },
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: { orderBy: { order: 'asc' } },
          },
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: { select: { id: true, name: true, profilePhoto: true } },
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    })

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: course })
  } catch (error) {
    console.error('[COURSE_GET]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/courses/[id] - Update course
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
    const { title, slug, description, thumbnail, price, duration, level, teacherId, status } = body

    const existing = await db.course.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    // Check slug uniqueness if slug is being changed
    if (slug && slug !== existing.slug) {
      const slugExists = await db.course.findUnique({ where: { slug } })
      if (slugExists) {
        return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 400 })
      }
    }

    const updated = await db.course.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(price !== undefined && { price }),
        ...(duration !== undefined && { duration }),
        ...(level !== undefined && { level }),
        ...(teacherId !== undefined && { teacherId }),
        ...(status !== undefined && { status }),
      },
      include: {
        teacher: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[COURSE_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/courses/[id] - Delete course
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
    const existing = await db.course.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
    }

    await db.course.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Course deleted successfully' } })
  } catch (error) {
    console.error('[COURSE_DELETE]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
