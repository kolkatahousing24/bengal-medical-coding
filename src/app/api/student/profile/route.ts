import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Get user (no include - no FK relationships in Supabase)
    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get student profile separately
    const profile = await db.studentProfile.findUnique({ where: { userId: user.id } })

    // Get counts separately
    const enrolledCourses = profile ? await db.enrollment.count({ where: { studentId: profile.id } }) : 0
    const attendanceRecords = profile ? await db.attendance.findMany({ where: { studentId: profile.id } }) : []
    const presentCount = attendanceRecords.filter((a: any) => a.status === 'present' || a.status === 'late').length
    const attendanceRate = attendanceRecords.length > 0
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 0

    const examResults = profile ? await db.examResult.findMany({ where: { studentId: profile.id } }) : []
    const avgScore = examResults.length > 0
      ? Math.round(examResults.reduce((sum: number, e: any) => sum + e.percentage, 0) / examResults.length)
      : 0

    const certificates = profile ? await db.certificate.count({ where: { studentId: profile.id } }) : 0

    // Get recent notifications
    const recentNotifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      profile: profile
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            enrollmentNo: profile.enrollmentNo,
            admissionDate: profile.admissionDate,
            status: profile.status,
          }
        : {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            enrollmentNo: 'N/A',
            admissionDate: user.createdAt,
            status: 'active',
          },
      stats: {
        enrolledCourses,
        attendanceRate,
        avgScore,
        certificates,
      },
      recentNotifications: recentNotifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
    })
  } catch (error) {
    console.error('Student profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 })
  }
}
