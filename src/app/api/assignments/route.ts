import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/assignments - List assignments, support ?courseId=&teacherId= filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const teacherId = searchParams.get('teacherId')

    const where: any = {}
    if (courseId) where.courseId = courseId
    if (teacherId) where.teacherId = teacherId

    const assignments = await db.assignment.findMany({
      where,
      include: {
        course: { select: { id: true, title: true } },
        teacher: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: assignments })
  } catch (error) {
    console.error('[ASSIGNMENTS_GET]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/assignments - Create assignment
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
    const { title, description, courseId, teacherId, fileUrl, deadline, maxMarks } = body

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    const assignment = await db.assignment.create({
      data: {
        title,
        description: description || null,
        courseId: courseId || null,
        teacherId: teacherId || null,
        fileUrl: fileUrl || null,
        deadline: deadline ? new Date(deadline) : null,
        maxMarks: maxMarks ?? 100,
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

    return NextResponse.json({ success: true, data: assignment }, { status: 201 })
  } catch (error) {
    console.error('[ASSIGNMENTS_POST]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
