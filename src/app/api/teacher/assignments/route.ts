import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get user and teacherProfile separately (no FK relationships in Supabase)
    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const teacherProfile = await db.teacherProfile.findUnique({ where: { userId: user.id } })

    if (!teacherProfile) {
      return NextResponse.json([])
    }

    // Fetch assignments without include
    const assignments = await db.assignment.findMany({
      where: { teacherId: teacherProfile.id },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch course and submission counts separately
    const courseIds = [...new Set(assignments.map(a => a.courseId).filter(Boolean))]
    const courses = courseIds.length > 0 ? await db.course.findMany({ where: { id: { in: courseIds } } }) : []
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]))

    // Count submissions for each assignment
    const submissionCounts = await Promise.all(
      assignments.map(async (a) => {
        const count = await db.assignmentSubmission.count({ where: { assignmentId: a.id } })
        return { assignmentId: a.id, count }
      })
    )
    const submissionMap = Object.fromEntries(submissionCounts.map(s => [s.assignmentId, s.count]))

    const result = assignments.map(a => ({
      id: a.id,
      title: a.title,
      course: a.courseId ? courseMap[a.courseId]?.title || null : null,
      deadline: a.deadline || null,
      submissions: submissionMap[a.id] || 0,
      status: a.status,
      maxMarks: a.maxMarks,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Teacher assignments error:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, courseId, deadline, maxMarks } = body

    if (!userId || !title) {
      return NextResponse.json({ error: 'userId and title are required' }, { status: 400 })
    }

    // Get user and teacherProfile separately (no FK relationships in Supabase)
    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const teacherProfile = await db.teacherProfile.findUnique({ where: { userId: user.id } })

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const assignment = await db.assignment.create({
      data: {
        title,
        courseId: courseId || null,
        teacherId: teacherProfile.id,
        deadline: deadline ? new Date(deadline) : null,
        maxMarks: maxMarks || 100,
        status: 'published',
      },
    })

    return NextResponse.json({ success: true, id: assignment.id })
  } catch (error) {
    console.error('Create assignment error:', error)
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}
