import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/live-classes/[id] - Update live class
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, courseId, teacherId, date, duration, meetingLink, recordingLink, status } = body

    const existing = await db.liveClass.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Live class not found' }, { status: 404 })
    }

    const updated = await db.liveClass.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(courseId !== undefined && { courseId }),
        ...(teacherId !== undefined && { teacherId }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(duration !== undefined && { duration }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(recordingLink !== undefined && { recordingLink }),
        ...(status !== undefined && { status }),
      },
      include: {
        teacher: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        course: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[LIVE_CLASS_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/live-classes/[id] - Delete live class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.liveClass.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Live class not found' }, { status: 404 })
    }

    await db.liveClass.delete({ where: { id } })

    return NextResponse.json({ success: true, data: { message: 'Live class deleted successfully' } })
  } catch (error) {
    console.error('[LIVE_CLASS_DELETE]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
