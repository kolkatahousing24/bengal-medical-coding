import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const search = request.nextUrl.searchParams.get('search') || ''

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Fetch user and teacherProfile separately (no FK relationships in Supabase)
    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const teacherProfile = await db.teacherProfile.findUnique({ where: { userId: user.id } })

    // Get all course IDs for this teacher
    const courseIdsFromProfile: string[] = teacherProfile
      ? JSON.parse(teacherProfile.courseIds || '[]')
      : []

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

    // Get enrollments for teacher's courses
    const enrollments = await db.enrollment.findMany({
      where: { courseId: { in: allCourseIds } },
    })

    // Fetch related data separately
    const studentIds = [...new Set(enrollments.map(e => e.studentId).filter(Boolean))]
    const courseIdSet = [...new Set(enrollments.map(e => e.courseId).filter(Boolean))]

    const [studentProfiles, courses] = await Promise.all([
      studentIds.length > 0 ? db.studentProfile.findMany({ where: { id: { in: studentIds } } }) : [],
      courseIdSet.length > 0 ? db.course.findMany({ where: { id: { in: courseIdSet } } }) : [],
    ])

    // Fetch users for student profiles
    const userIds = [...new Set(studentProfiles.map(sp => sp.userId).filter(Boolean))]
    const users = userIds.length > 0 ? await db.user.findMany({ where: { id: { in: userIds } } }) : []

    const studentProfileMap = Object.fromEntries(studentProfiles.map(sp => [sp.id, sp]))
    const userMap = Object.fromEntries(users.map(u => [u.id, u]))
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]))

    // Map to unique students
    const studentMap = new Map<string, {
      id: string
      name: string
      email: string
      enrollmentNo: string
      course: string
      status: string
    }>()

    for (const e of enrollments) {
      const sp = studentProfileMap[e.studentId]
      const u = sp ? userMap[sp.userId] : null
      const c = courseMap[e.courseId]
      if (u && !studentMap.has(u.id)) {
        studentMap.set(u.id, {
          id: u.id,
          name: u.name,
          email: u.email,
          enrollmentNo: sp?.enrollmentNo || '',
          course: c?.title || '',
          status: e.status,
        })
      }
    }

    let students = Array.from(studentMap.values())

    // Apply search filter
    if (search) {
      const lowerSearch = search.toLowerCase()
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerSearch) ||
          s.email.toLowerCase().includes(lowerSearch) ||
          s.enrollmentNo.toLowerCase().includes(lowerSearch)
      )
    }

    return NextResponse.json(students)
  } catch (error) {
    console.error('Teacher students error:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}
