import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get student profile
    const studentProfile = await db.studentProfile.findFirst({
      where: { userId },
    })

    if (!studentProfile) {
      return NextResponse.json({ courses: [] })
    }

    // Get enrollments without include
    const enrollments = await db.enrollment.findMany({
      where: { studentId: studentProfile.id },
      orderBy: { enrolledAt: 'desc' },
    })

    // Fetch courses separately
    const courseIds = [...new Set(enrollments.map((e: any) => e.courseId).filter(Boolean))]
    const courses = courseIds.length > 0 ? await db.course.findMany({ where: { id: { in: courseIds } } }) : []
    const courseMap = Object.fromEntries(courses.map((c: any) => [c.id, c]))

    const result = enrollments.map((enrollment: any) => {
      const course = courseMap[enrollment.courseId]
      return {
        id: course?.id || enrollment.courseId,
        title: course?.title || 'Unknown Course',
        level: course?.level || null,
        duration: course?.duration || null,
        progress: enrollment.progress,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
      }
    })

    return NextResponse.json({ courses: result })
  } catch (error) {
    console.error('Student courses error:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
