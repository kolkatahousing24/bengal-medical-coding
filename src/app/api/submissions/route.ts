import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/submissions - List submissions, support ?assignmentId=&studentId= filter
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')
    const studentId = searchParams.get('studentId')

    const where: any = {}
    if (assignmentId) where.assignmentId = assignmentId

    // Students can only see their own submissions
    if (user.role === 'student') {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: user.id },
      })
      if (!studentProfile) {
        return NextResponse.json({ success: true, data: [] })
      }
      where.studentId = studentProfile.id
    } else if (studentId) {
      where.studentId = studentId
    }

    const submissions = await db.assignmentSubmission.findMany({
      where,
      include: {
        assignment: { select: { id: true, title: true, maxMarks: true, deadline: true } },
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: submissions })
  } catch (error) {
    console.error('[SUBMISSIONS_GET]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/submissions - Submit assignment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (user.role !== 'student' && user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { assignmentId, studentId, fileUrl, content } = body

    if (!assignmentId || !studentId) {
      return NextResponse.json({ success: false, error: 'Assignment ID and Student ID are required' }, { status: 400 })
    }

    // Check for duplicate submission
    const existing = await db.assignmentSubmission.findFirst({
      where: { assignmentId, studentId },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Assignment already submitted' }, { status: 400 })
    }

    const submission = await db.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        fileUrl: fileUrl || null,
        content: content || null,
        status: 'submitted',
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

    return NextResponse.json({ success: true, data: submission }, { status: 201 })
  } catch (error) {
    console.error('[SUBMISSIONS_POST]', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
