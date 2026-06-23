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
      return NextResponse.json({ records: [], summary: null })
    }

    // Get attendance records
    const attendanceRecords = await db.attendance.findMany({
      where: { studentId: studentProfile.id },
      orderBy: { date: 'desc' },
    })

    // Fetch live class info separately
    const liveClassIds = [...new Set(attendanceRecords.map((a: any) => a.liveClassId).filter(Boolean))]
    const liveClasses = liveClassIds.length > 0 ? await db.liveClass.findMany({ where: { id: { in: liveClassIds } } }) : []
    const lcMap = Object.fromEntries(liveClasses.map((lc: any) => [lc.id, lc]))

    const total = attendanceRecords.length
    const present = attendanceRecords.filter((a: any) => a.status === 'present').length
    const absent = attendanceRecords.filter((a: any) => a.status === 'absent').length
    const late = attendanceRecords.filter((a: any) => a.status === 'late').length
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0

    const summary = { total, present, absent, late, rate }

    const records = attendanceRecords.map((a: any) => ({
      id: a.id,
      date: a.date,
      status: a.status,
      duration: a.duration,
      joinTime: a.joinTime,
      leaveTime: a.leaveTime,
      liveClassTitle: lcMap[a.liveClassId]?.title || null,
    }))

    return NextResponse.json({ records, summary })
  } catch (error) {
    console.error('Student attendance error:', error)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}
