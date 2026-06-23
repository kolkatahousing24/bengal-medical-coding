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

    // Get courses from both courseIds JSON and relation
    const courseIdsFromProfile: string[] = teacherProfile
      ? JSON.parse(teacherProfile.courseIds || '[]')
      : []

    // Get courses by relation
    const coursesByRelation = teacherProfile
      ? await db.course.findMany({
          where: { teacherId: teacherProfile.id },
          select: { id: true },
        })
      : []

    const allCourseIds = [...new Set([
      ...courseIdsFromProfile,
      ...coursesByRelation.map(c => c.id),
    ])]

    if (allCourseIds.length === 0) {
      return NextResponse.json([])
    }

    // Fetch courses without include
    const courses = await db.course.findMany({
      where: { id: { in: allCourseIds } },
      orderBy: { createdAt: 'desc' },
    })

    // Fetch enrollment counts separately
    const enrollmentCounts = await Promise.all(
      courses.map(async (c) => {
        const count = await db.enrollment.count({
          where: { courseId: c.id, status: 'active' },
        })
        return { courseId: c.id, count }
      })
    )

    const enrollmentMap = Object.fromEntries(enrollmentCounts.map(e => [e.courseId, e.count]))

    const result = courses.map(c => ({
      id: c.id,
      title: c.title,
      level: c.level,
      status: c.status,
      duration: c.duration,
      studentCount: enrollmentMap[c.id] || 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Teacher courses error:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
