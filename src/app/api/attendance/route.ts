import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

    const startDate = new Date(`${month}-01`)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    const records = await db.attendance.findMany({
      where: {
        date: { gte: startDate.toISOString(), lt: endDate.toISOString() },
      },
      orderBy: { date: 'asc' },
    })

    // Fetch related data separately (no FK relationships in Supabase)
    const studentIds = [...new Set(records.map((r: any) => r.studentId).filter(Boolean))]
    const liveClassIds = [...new Set(records.map((r: any) => r.liveClassId).filter(Boolean))]

    const [studentProfiles, liveClasses] = await Promise.all([
      studentIds.length > 0 ? db.studentProfile.findMany({ where: { id: { in: studentIds } } }) : [],
      liveClassIds.length > 0 ? db.liveClass.findMany({ where: { id: { in: liveClassIds } } }) : [],
    ])

    // Fetch users for student profiles
    const userIds = [...new Set(studentProfiles.map((sp: any) => sp.userId).filter(Boolean))]
    const users = userIds.length > 0 ? await db.user.findMany({ where: { id: { in: userIds } } }) : []

    const spMap = Object.fromEntries(studentProfiles.map((sp: any) => [sp.id, sp]))
    const userMap = Object.fromEntries(users.map((u: any) => [u.id, u]))
    const lcMap = Object.fromEntries(liveClasses.map((lc: any) => [lc.id, lc]))

    const data = records.map((r: any) => {
      const sp = spMap[r.studentId]
      const u = sp ? userMap[sp.userId] : null
      const lc = lcMap[r.liveClassId]
      return {
        id: r.id,
        studentName: u?.name || 'Unknown',
        studentEmail: u?.email || '',
        className: lc?.title || '',
        date: r.date ? (typeof r.date === 'string' ? r.date.split('T')[0] : new Date(r.date).toISOString().split('T')[0]) : '',
        joinTime: r.joinTime || '',
        leaveTime: r.leaveTime || '',
        duration: r.duration || 0,
        status: r.status,
      }
    })

    // Also get all students for the attendance summary
    const students = await db.user.findMany({
      where: { role: 'student', status: 'active' },
      orderBy: { name: 'asc' },
    })

    // Summary per student
    const summary = students.map((s: any) => {
      const sp = Object.values(spMap).find((sp: any) => sp.userId === s.id) as any
      const studentRecords = sp ? records.filter((r: any) => r.studentId === sp.id) : []
      const present = studentRecords.filter((r: any) => r.status === 'present').length
      const absent = studentRecords.filter((r: any) => r.status === 'absent').length
      const late = studentRecords.filter((r: any) => r.status === 'late').length
      const total = studentRecords.length
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        present,
        absent,
        late,
        total,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      }
    })

    return NextResponse.json({ success: true, data: { records: data, summary } })
  } catch (error) {
    console.error('Attendance fetch error:', error)
    return NextResponse.json({ success: true, data: { records: [], summary: [] } })
  }
}
