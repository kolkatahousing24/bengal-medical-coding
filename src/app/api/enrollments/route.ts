import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/enrollments - List enrollments, support ?studentId=&courseId= filter
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const courseId = searchParams.get('courseId')

    const where: any = {}

    // Students can only see their own enrollments
    if (user.role === 'student') {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: user.id },
      })
      if (!studentProfile) {
        return NextResponse.json({ success: true, data: [] })
      }
      where.studentId = studentProfile.id
    } else {
      if (studentId) where.studentId = studentId
    }

    if (courseId) where.courseId = courseId

    const enrollments = await db.enrollment.findMany({
      where,
      orderBy: { enrolledAt: 'desc' },
    })

    // Fetch related data separately (no FK relationships in Supabase)
    const studentIds = [...new Set(enrollments.map((e: any) => e.studentId).filter(Boolean))]
    const courseIds = [...new Set(enrollments.map((e: any) => e.courseId).filter(Boolean))]

    const [studentProfiles, courses] = await Promise.all([
      studentIds.length > 0 ? db.studentProfile.findMany({ where: { id: { in: studentIds } } }) : [],
      courseIds.length > 0 ? db.course.findMany({ where: { id: { in: courseIds } } }) : [],
    ])

    // Fetch users for student profiles
    const userIds = [...new Set(studentProfiles.map((sp: any) => sp.userId).filter(Boolean))]
    const users = userIds.length > 0 ? await db.user.findMany({ where: { id: { in: userIds } } }) : []

    const studentProfileMap = Object.fromEntries(studentProfiles.map((sp: any) => [sp.id, sp]))
    const userMap = Object.fromEntries(users.map((u: any) => [u.id, u]))
    const courseMap = Object.fromEntries(courses.map((c: any) => [c.id, c]))

    const enriched = enrollments.map((e: any) => ({
      ...e,
      student: studentProfileMap[e.studentId] ? {
        ...studentProfileMap[e.studentId],
        user: userMap[studentProfileMap[e.studentId].userId] ? {
          id: userMap[studentProfileMap[e.studentId].userId].id,
          name: userMap[studentProfileMap[e.studentId].userId].name,
          email: userMap[studentProfileMap[e.studentId].userId].email,
          profilePhoto: userMap[studentProfileMap[e.studentId].userId].profilePhoto,
        } : null,
      } : null,
      course: courseMap[e.courseId] ? {
        id: courseMap[e.courseId].id,
        title: courseMap[e.courseId].title,
        slug: courseMap[e.courseId].slug,
        thumbnail: courseMap[e.courseId].thumbnail,
      } : null,
    }))

    return NextResponse.json({ success: true, data: enriched })
  } catch (error) {
    console.error('[ENROLLMENTS_GET]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/enrollments - Enroll student
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { studentId, courseId } = body

    if (!studentId || !courseId) {
      return NextResponse.json({ success: false, error: 'Student ID and Course ID are required' }, { status: 400 })
    }

    // Check for duplicate enrollment
    const existing = await db.enrollment.findFirst({
      where: { studentId, courseId },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Student already enrolled in this course' }, { status: 400 })
    }

    const enrollment = await db.enrollment.create({
      data: {
        studentId,
        courseId,
        status: 'active',
      },
    })

    return NextResponse.json({ success: true, data: enrollment }, { status: 201 })
  } catch (error) {
    console.error('[ENROLLMENTS_POST]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
