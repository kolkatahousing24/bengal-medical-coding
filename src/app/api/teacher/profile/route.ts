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

    // Parse course IDs from teacher profile
    const courseIds: string[] = teacherProfile
      ? JSON.parse(teacherProfile.courseIds || '[]')
      : []

    // Get stats
    const myCourses = courseIds.length > 0
      ? await db.course.count({ where: { id: { in: courseIds } } })
      : 0

    // Also count courses where teacherId matches
    const teacherCourseByRelation = teacherProfile
      ? await db.course.count({ where: { teacherId: teacherProfile.id } })
      : 0

    const totalCourses = myCourses + teacherCourseByRelation

    // Count students enrolled in teacher's courses
    const allCourseIds = courseIds.length > 0 ? courseIds : []
    if (teacherProfile) {
      const relCourses = await db.course.findMany({
        where: { teacherId: teacherProfile.id },
        select: { id: true },
      })
      relCourses.forEach(c => {
        if (!allCourseIds.includes(c.id)) allCourseIds.push(c.id)
      })
    }

    const totalStudents = allCourseIds.length > 0
      ? await db.enrollment.count({
          where: { courseId: { in: allCourseIds }, status: 'active' },
        })
      : 0

    // Count live classes
    const liveClasses = teacherProfile
      ? await db.liveClass.count({
          where: { teacherId: teacherProfile.id, status: { in: ['scheduled', 'live'] } },
        })
      : 0

    // Count assignments
    const assignments = teacherProfile
      ? await db.assignment.count({
          where: { teacherId: teacherProfile.id },
        })
      : 0

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        designation: teacherProfile?.designation || 'Instructor',
        specialization: teacherProfile?.specialization || null,
        qualification: teacherProfile?.qualification || null,
        experience: teacherProfile?.experience || null,
        profilePhoto: user.profilePhoto || null,
      },
      stats: {
        myCourses: totalCourses,
        totalStudents,
        liveClasses,
        assignments,
      },
    })
  } catch (error) {
    console.error('Teacher profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch teacher profile' }, { status: 500 })
  }
}
