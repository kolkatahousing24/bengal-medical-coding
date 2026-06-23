import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const classes = await db.liveClass.findMany({
      include: {
        teacher: { include: { user: true } },
        course: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ success: true, data: classes.map(c => ({
      id: c.id,
      title: c.title,
      teacher: c.teacher?.user?.name || 'TBD',
      course: c.course?.title || '',
      date: c.date.toISOString(),
      duration: c.duration,
      meetingLink: c.meetingLink || '',
      recordingLink: c.recordingLink || '',
      status: c.status,
    }))})
  } catch (error) {
    console.error('Live classes fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch live classes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, date, duration, meetingLink, courseId, teacherId } = body

    if (!title || !date) {
      return NextResponse.json({ success: false, error: 'Title and date are required' }, { status: 400 })
    }

    // date can be ISO string or datetime-local format (YYYY-MM-DDTHH:mm)
    const dateObj = new Date(date)

    const liveClass = await db.liveClass.create({
      data: {
        title,
        date: dateObj,
        duration: Number(duration) || 60,
        meetingLink: meetingLink || null,
        courseId: courseId || null,
        teacherId: teacherId || null,
        status: 'scheduled',
      },
    })

    return NextResponse.json({ success: true, data: liveClass })
  } catch (error) {
    console.error('Live class create error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create live class' }, { status: 500 })
  }
}
