import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// PUT /api/submissions/[id] - Review submission (add marks, feedback)
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
    const { marks, feedback, status, fileUrl, content } = body

    const existing = await db.assignmentSubmission.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 })
    }

    const updated = await db.assignmentSubmission.update({
      where: { id },
      data: {
        ...(marks !== undefined && { marks }),
        ...(feedback !== undefined && { feedback }),
        ...(status !== undefined && { status }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(content !== undefined && { content }),
        reviewedAt: new Date(),
      },
      include: {
        assignment: { select: { id: true, title: true, maxMarks: true } },
        student: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[SUBMISSION_PUT]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
